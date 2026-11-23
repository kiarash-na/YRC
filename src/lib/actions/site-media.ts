"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { isE2ERequest } from "@/lib/e2e";
import { SITE_MEDIA_BY_KEY, normalizeSlotItems, type SitePage } from "@/lib/site-media";

const PAGE_PATHS: Record<SitePage, string> = {
  Home: "/",
  Events: "/events",
  Community: "/community",
  About: "/about",
  Journal: "/journal",
};

export type SaveSlotResult = { ok: true } | { ok: false; error: string };

/** Replace a slot's media (validated against the slot) and refresh its page. */
export async function saveSlotMedia(key: string, items: unknown): Promise<SaveSlotResult> {
  const { admin, user } = await requireAdmin();
  const slot = SITE_MEDIA_BY_KEY.get(key);
  if (!slot) return { ok: false, error: "Unknown slot." };
  const normalized = normalizeSlotItems(slot, items);
  if (!normalized) {
    return {
      ok: false,
      error:
        slot.min === slot.max
          ? `This box needs exactly ${slot.min} item${slot.min === 1 ? "" : "s"}, each with an ImageKit path starting with /.`
          : `This box needs ${slot.min}–${slot.max} items, each with an ImageKit path starting with /.`,
    };
  }
  const { error } = await admin
    .from("site_media")
    .upsert({
      key,
      items: normalized,
      updated_at: new Date().toISOString(),
      // The e2e test admin isn't a real auth user (FK).
      updated_by: (await isE2ERequest()) ? null : user.id,
    });
  if (error) {
    console.error("saveSlotMedia failed:", error.message);
    return { ok: false, error: "Couldn't save. Try again in a minute." };
  }
  revalidatePath(PAGE_PATHS[slot.page]);
  revalidatePath("/admin/media");
  return { ok: true };
}

/** Drop the override: the slot shows its built-in default again. */
export async function resetSlotMedia(key: string): Promise<SaveSlotResult> {
  const { admin } = await requireAdmin();
  const slot = SITE_MEDIA_BY_KEY.get(key);
  if (!slot) return { ok: false, error: "Unknown slot." };
  const { error } = await admin.from("site_media").delete().eq("key", key);
  if (error) {
    console.error("resetSlotMedia failed:", error.message);
    return { ok: false, error: "Couldn't reset. Try again in a minute." };
  }
  revalidatePath(PAGE_PATHS[slot.page]);
  revalidatePath("/admin/media");
  return { ok: true };
}

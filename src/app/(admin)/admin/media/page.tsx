import { AdminMediaManager, type MediaSlotState } from "@/components/admin-media-manager";
import { requireAdmin } from "@/lib/admin";
import { SITE_MEDIA_SLOTS, normalizeSlotItems } from "@/lib/site-media";

export const metadata = { title: "Media — YRC admin" };

/**
 * Media manager: every image/video box on the public pages (slots defined in
 * src/lib/site-media.ts), with the admin overrides from `site_media`, plus
 * the ImageKit media library widget.
 */
export default async function AdminMediaPage() {
  const { admin } = await requireAdmin();
  const { data } = await admin.from("site_media").select("key, items, updated_at");
  const overrides = new Map((data ?? []).map((row) => [row.key as string, row]));

  const slots: MediaSlotState[] = SITE_MEDIA_SLOTS.map((slot) => {
    const row = overrides.get(slot.key);
    const items = row ? normalizeSlotItems(slot, row.items) : null;
    return {
      slot,
      items: items ?? slot.defaults,
      custom: Boolean(items),
      updatedAt: row?.updated_at as string | undefined,
    };
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h2">Media</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Every photo and video box on the public pages. Pick a replacement from ImageKit (or
          upload one), give it a short description, and save — the page updates straight away.
          Match the box shape shown under each title so nothing gets awkwardly cropped. Event
          photos are managed on each event instead.
        </p>
      </div>
      <AdminMediaManager slots={slots} />
    </div>
  );
}

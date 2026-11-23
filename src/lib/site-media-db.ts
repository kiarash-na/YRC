import "server-only";

import { cache } from "react";

import {
  SITE_MEDIA_BY_KEY,
  normalizeSlotItems,
  type SiteMediaItem,
  type SiteMediaKey,
} from "@/lib/site-media";
import { createPublicClient } from "@/lib/supabase/public";

/** Admin overrides from `site_media`, one query per request. */
const getOverrides = cache(async (): Promise<Map<string, unknown>> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return new Map();
  }
  try {
    const { data, error } = await createPublicClient().from("site_media").select("key, items");
    if (error) {
      console.error("Failed to load site media:", error.message);
      return new Map();
    }
    return new Map((data ?? []).map((row) => [row.key as string, row.items as unknown]));
  } catch (error) {
    console.error("Failed to load site media:", error);
    return new Map();
  }
});

/** A slot's media: the admin's override if it's usable, else the default. */
export async function getSlotMedia(key: SiteMediaKey): Promise<SiteMediaItem[]> {
  const slot = SITE_MEDIA_BY_KEY.get(key);
  if (!slot) throw new Error(`Unknown media slot: ${key}`);
  const override = (await getOverrides()).get(key);
  return (override !== undefined && normalizeSlotItems(slot, override)) || slot.defaults;
}

/** Several slots at once, keyed like the input. */
export async function getSlotsMedia<K extends SiteMediaKey>(keys: K[]): Promise<Record<K, SiteMediaItem[]>> {
  const entries = await Promise.all(keys.map(async (key) => [key, await getSlotMedia(key)] as const));
  return Object.fromEntries(entries) as Record<K, SiteMediaItem[]>;
}

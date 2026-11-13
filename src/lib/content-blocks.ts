import { createPublicClient } from "@/lib/supabase/public";

/**
 * Content blocks — small admin-editable JSON lists keyed by string
 * (e.g. "events.course_details", "events.faqs") in the `content_blocks`
 * table. Replaces the hardcoded src/data/* files. Public read via RLS.
 */

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** Items of one content block; [] when the key is missing or the read fails. */
export async function getContentBlock<T>(key: string): Promise<T[]> {
  if (!configured()) return []; // Supabase not configured yet (e.g. fresh preview env)
  try {
    const { data, error } = await createPublicClient()
      .from("content_blocks")
      .select("items")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.error(`Failed to load content block "${key}" from Supabase:`, error.message);
      return [];
    }
    return (data?.items ?? []) as T[];
  } catch (error) {
    console.error(`Failed to load content block "${key}" from Supabase:`, error);
    return [];
  }
}

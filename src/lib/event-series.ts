import "server-only";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Weekly series upkeep for admin writes (admin form + Agent). Each week of
 * a weekly run is its own events row (own registrations, QR token,
 * check-ins); the DB keeps six upcoming ones open (0012,
 * maintain_event_lifecycle). New weeks copy the latest one, so an edit to
 * one week is carried to the weeks after it — otherwise they'd keep the old
 * content. Dates, slugs, registrations and tokens are never touched.
 */

/** Content columns shared by every week of a series. */
const SHARED_COLUMNS = [
  "title",
  "excerpt",
  "cover",
  "location",
  "city",
  "category",
  "registration_url",
  "recurrence",
  "start_time",
  "duration_minutes",
  "meeting_point",
  "finish_point",
  "distance_km",
  "elevation_gain_m",
  "route_notes",
  "what_to_bring",
  "coach_tips",
  "route_gpx_path",
  "route_line",
  "overview",
  "gallery",
  "body",
] as const;

/**
 * Copies a week's content to the upcoming weeks after it in its series.
 * Returns the slugs it updated (already revalidated).
 */
export async function applyToFollowingWeeks(eventId: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data: source } = await admin
    .from("events")
    .select(`series_slug, event_date, ${SHARED_COLUMNS.join(", ")}`)
    .eq("id", eventId)
    .maybeSingle();
  const row = source as Record<string, unknown> | null;
  if (!row?.series_slug) return [];

  const shared = Object.fromEntries(SHARED_COLUMNS.map((column) => [column, row[column]]));
  const { data, error } = await admin
    .from("events")
    .update({ ...shared, updated_at: new Date().toISOString() })
    .eq("series_slug", row.series_slug as string)
    .eq("is_past", false)
    .gt("event_date", row.event_date as string)
    .select("slug");
  if (error) {
    console.error("applyToFollowingWeeks failed:", error.message);
    return [];
  }
  const slugs = (data ?? []).map((r) => r.slug as string);
  for (const slug of slugs) revalidatePath(`/events/${slug}`);
  return slugs;
}

/**
 * Tops every weekly series up to six open weeks now (the cron does it every
 * 15 min anyway) — after an event is created as weekly or made weekly.
 */
export async function openWeeklyDates(): Promise<void> {
  const { error } = await createAdminClient().rpc("maintain_event_lifecycle");
  if (error) console.error("maintain_event_lifecycle failed:", error.message);
}

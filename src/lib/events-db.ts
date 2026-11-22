import { cache } from "react";

import {
  formatTime,
  normalizeEventGallery,
  routeGpxUrl,
  type EventCategory,
  type EventItem,
  type EventSummary,
  type SeriesDate,
  WEEKLY_HORIZON,
} from "@/lib/content-shared";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Events data layer — reads from the Supabase `events` table (source of
 * truth; the old content/events/*.mdx files were migrated into the seed).
 * Returns the same shapes the MDX loader did, so UI components are unchanged.
 *
 * List queries use a slim SELECT (no MDX body, no brief fields) and filter
 * is_past in PostgREST; only getEventBySlug fetches the body and the
 * technical-brief columns.
 */

interface EventRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  event_date: string;
  end_date: string | null;
  location: string;
  city: string;
  category: string;
  registration_url: string | null;
  body: string;
  is_past: boolean;
  recurrence: string | null;
  series_slug?: string | null;
  start_time: string | null;
  duration_minutes: number | null;
  meeting_point: string | null;
  finish_point: string | null;
  /** PostgREST may serialize numeric as a string. */
  distance_km: number | string | null;
  elevation_gain_m: number | null;
  route_notes: string | null;
  what_to_bring: string | null;
  coach_tips: string | null;
  route_gpx_path?: string | null;
  route_line?: [number, number][] | null;
  overview?: string | null;
  gallery?: unknown;
}

const EVENT_SELECT_SUMMARY =
  "id, slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, is_past, recurrence, series_slug, start_time, gallery";
const EVENT_SELECT_FULL = `${EVENT_SELECT_SUMMARY}, body, duration_minutes, meeting_point, finish_point, distance_km, elevation_gain_m, route_notes, what_to_bring, coach_tips, route_gpx_path, route_line, overview`;

function toEventItem(row: EventRow): EventItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover: row.cover,
    date: row.event_date,
    endDate: row.end_date ?? undefined,
    location: row.location,
    city: row.city,
    category: row.category as EventCategory,
    registrationUrl: row.registration_url ?? undefined,
    isPast: row.is_past,
    recurrence: row.recurrence === "weekly" ? "weekly" : null,
    seriesSlug: row.series_slug ?? undefined,
    startTime: row.start_time ? formatTime(row.start_time) : undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    meetingPoint: row.meeting_point ?? undefined,
    finishPoint: row.finish_point ?? undefined,
    distanceKm: row.distance_km == null ? undefined : Number(row.distance_km),
    elevationGainM: row.elevation_gain_m ?? undefined,
    routeNotes: row.route_notes ?? undefined,
    whatToBring: row.what_to_bring ?? undefined,
    coachTips: row.coach_tips ?? undefined,
    routeLine:
      Array.isArray(row.route_line) && row.route_line.length >= 2
        ? row.route_line
        : undefined,
    routeGpxUrl: row.route_gpx_path ? routeGpxUrl(row.route_gpx_path) : undefined,
    overview: row.overview?.trim() || undefined,
    gallery: normalizeEventGallery(row.gallery),
    content: row.body ?? "",
  };
}

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** Slim event list. `isPast` filters server-side; undefined = no filter. */
async function fetchEvents(isPast?: boolean): Promise<EventItem[]> {
  if (!configured()) return []; // Supabase not configured yet (e.g. fresh preview env)
  try {
    let query = createPublicClient()
      .from("events")
      .select(EVENT_SELECT_SUMMARY)
      .order("event_date", { ascending: isPast ? false : true });
    if (isPast !== undefined) query = query.eq("is_past", isPast);

    const { data, error } = await query;

    if (error) {
      console.error("Failed to load events from Supabase:", error.message);
      return [];
    }
    return (data as Omit<EventRow, "body">[]).map((row) =>
      toEventItem({ ...row, body: "" }),
    );
  } catch (error) {
    console.error("Failed to load events from Supabase:", error);
    return [];
  }
}

/** All events, soonest first. */
export async function getAllEvents(): Promise<EventItem[]> {
  return fetchEvents();
}

/** Events not yet marked past (DB flag, cron-maintained), soonest first. */
export async function getUpcomingEvents(): Promise<EventItem[]> {
  return fetchEvents(false);
}

/** Events marked past (DB flag), most recent first. */
export async function getPastEvents(): Promise<EventItem[]> {
  return fetchEvents(true);
}

/**
 * Full event incl. MDX body. Wrapped in React cache() so generateMetadata
 * and the page share one query per request.
 */
export const getEventBySlug = cache(
  async (slug: string): Promise<EventItem | undefined> => {
    if (!configured()) return undefined;
    try {
      const { data, error } = await createPublicClient()
        .from("events")
        .select(EVENT_SELECT_FULL)
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) return undefined;
      return toEventItem(data as EventRow);
    } catch {
      return undefined;
    }
  },
);

/**
 * The upcoming dates of a weekly series, soonest first (the DB keeps
 * WEEKLY_HORIZON of them open). Shared by every date's page in one request.
 */
export const getSeriesDates = cache(async (seriesSlug: string): Promise<SeriesDate[]> => {
  if (!configured()) return [];
  try {
    const { data, error } = await createPublicClient()
      .from("events")
      .select("id, slug, event_date")
      .eq("series_slug", seriesSlug)
      .eq("is_past", false)
      .order("event_date", { ascending: true })
      .limit(WEEKLY_HORIZON);
    if (error || !data) return [];
    return data.map((row) => ({ id: row.id, slug: row.slug, date: row.event_date }));
  } catch {
    return [];
  }
});

/**
 * Splits upcoming events into one-off events and weekly series. Each series
 * is represented by its soonest date, with all its open dates attached.
 */
export function splitWeekly(events: EventSummary[]): {
  oneOff: EventSummary[];
  weekly: (EventSummary & { dates: SeriesDate[] })[];
} {
  const oneOff: EventSummary[] = [];
  const series = new Map<string, EventSummary & { dates: SeriesDate[] }>();
  for (const event of events) {
    const key = event.recurrence === "weekly" || event.seriesSlug ? (event.seriesSlug ?? event.slug) : null;
    if (!key) {
      oneOff.push(event);
      continue;
    }
    const date = { id: event.id, slug: event.slug, date: event.date };
    const existing = series.get(key);
    if (existing) {
      if (existing.dates.length < WEEKLY_HORIZON) existing.dates.push(date);
    } else {
      series.set(key, { ...event, dates: [date] });
    }
  }
  return { oneOff, weekly: [...series.values()] };
}

export function toEventSummary(event: EventItem): EventSummary {
  const rest: Partial<EventItem> = { ...event };
  delete rest.content;
  return rest as EventSummary;
}

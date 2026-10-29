import { cache } from "react";

import type { EventCategory, EventItem, EventSummary } from "@/lib/content-shared";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Events data layer — reads from the Supabase `events` table (source of
 * truth; the old content/events/*.mdx files were migrated into the seed).
 * Returns the same shapes the MDX loader did, so UI components are unchanged.
 *
 * List queries use a slim SELECT (no MDX body) and filter is_past in
 * PostgREST; only getEventBySlug fetches the body.
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
}

const EVENT_SELECT_SUMMARY =
  "id, slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, is_past";
const EVENT_SELECT_FULL = `${EVENT_SELECT_SUMMARY}, body`;

function toEventItem(row: EventRow): EventItem {
  return {
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

export function toEventSummary(event: EventItem): EventSummary {
  const rest: Partial<EventItem> = { ...event };
  delete rest.content;
  return rest as EventSummary;
}

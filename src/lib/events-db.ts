import type { EventCategory, EventItem, EventSummary } from "@/lib/content-shared";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Events data layer — reads from the Supabase `events` table (source of
 * truth; the old content/events/*.mdx files were migrated into the seed).
 * Returns the same shapes the MDX loader did, so UI components are unchanged.
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
}

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
    content: row.body,
  };
}

async function fetchEvents(): Promise<EventItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return []; // Supabase not configured yet (e.g. fresh preview env)
  }
  try {
    const { data, error } = await createPublicClient()
      .from("events")
      .select(
        "id, slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body",
      )
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Failed to load events from Supabase:", error.message);
      return [];
    }
    return (data as EventRow[]).map(toEventItem);
  } catch (error) {
    console.error("Failed to load events from Supabase:", error);
    return [];
  }
}

/** All events, soonest first. */
export async function getAllEvents(): Promise<EventItem[]> {
  return fetchEvents();
}

/** Events whose (end) date is today or in the future, soonest first. */
export async function getUpcomingEvents(now: Date = new Date()): Promise<EventItem[]> {
  const today = now.toISOString().slice(0, 10);
  return (await fetchEvents()).filter((event) => (event.endDate ?? event.date) >= today);
}

/** Events that have already ended, most recent first. */
export async function getPastEvents(now: Date = new Date()): Promise<EventItem[]> {
  const today = now.toISOString().slice(0, 10);
  return (await fetchEvents())
    .filter((event) => (event.endDate ?? event.date) < today)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return undefined;
  }
  try {
    const { data, error } = await createPublicClient()
      .from("events")
      .select(
        "id, slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return undefined;
    return toEventItem(data as EventRow);
  } catch {
    return undefined;
  }
}

export function toEventSummary(event: EventItem): EventSummary {
  const rest: Partial<EventItem> = { ...event };
  delete rest.content;
  return rest as EventSummary;
}

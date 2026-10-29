/**
 * Client-safe constants and formatters shared between the content loader
 * (src/lib/content.ts, server-only) and client components. Nothing in this
 * module may import node builtins — it is bundled for the browser.
 */

export const EVENT_CATEGORIES = ["race", "training", "social", "camp"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/** Event shape shared by the DB loader (events-db.ts) and UI components. */
export interface EventItem {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  endDate?: string;
  location: string;
  city: string;
  category: EventCategory;
  registrationUrl?: string;
  /** DB flag, flipped by the event-lifecycle cron at Berlin midnight. */
  isPast?: boolean;
  /** Raw MDX body */
  content: string;
}

/** EventItem without the MDX body — safe to pass to client components. */
export type EventSummary = Omit<EventItem, "content">;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "2026-10-17" → "17 October 2026" */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00`));
}

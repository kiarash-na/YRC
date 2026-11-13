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
  /** Weekly series self-perpetuate via the event-lifecycle cron; null = one-off. */
  recurrence?: "weekly" | null;
  /** Raw MDX body */
  content: string;
}

/** EventItem without the MDX body — safe to pass to client components. */
export type EventSummary = Omit<EventItem, "content">;

/** Media gallery item rendered after a journal article body. */
export interface HighlightMedia {
  /** ImageKit path, e.g. /YRC/... */
  src: string;
  type: "image" | "video";
}

/** Journal post without the MDX body — safe to pass to client components. */
export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  /** ImageKit path, e.g. /YRC/... */
  cover: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  author: string;
  tags: string[];
  /** Optional media gallery rendered after the article body */
  highlights?: HighlightMedia[];
}

/** Full journal post incl. raw MDX body. */
export type BlogPost = PostSummary & { content: string };

/** One Q&A pair, rendered by the Faq section. */
export interface FaqItem {
  question: string;
  answer: string;
}

/** One fact card of the CourseDetails section (format / duration / …). */
export interface CourseDetail {
  title: string;
  value: string;
  description: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "2026-10-17" → "17 October 2026" */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00`));
}

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
});

/** "2026-11-12" → "Thursday" */
export function formatWeekday(iso: string): string {
  return weekdayFormatter.format(new Date(`${iso}T00:00:00`));
}

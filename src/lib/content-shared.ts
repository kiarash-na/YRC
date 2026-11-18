/**
 * Client-safe constants and formatters shared between the content loader
 * (src/lib/content.ts, server-only) and client components. Nothing in this
 * module may import node builtins — it is bundled for the browser.
 */

export const EVENT_CATEGORIES = [
  "race",
  "training",
  "social",
  "camp",
  "community-run",
  "long-run",
  "drills",
  "swim",
  "trail",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/** Human-readable labels for the category slugs (badges, filter dropdowns). */
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  race: "Race",
  training: "Training",
  social: "Social",
  camp: "Camp",
  "community-run": "Community run",
  "long-run": "Long run",
  drills: "Drills",
  swim: "Swim",
  trail: "Trail run",
};

/** Event shape shared by the DB loader (events-db.ts) and UI components. */
export interface EventItem {
  /** DB primary key (uuid) — the RSVP flow writes against it. */
  id: string;
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
  /** HH:MM, Berlin wall-clock. */
  startTime?: string;
  durationMinutes?: number;
  meetingPoint?: string;
  /** undefined = same as meetingPoint */
  finishPoint?: string;
  distanceKm?: number;
  elevationGainM?: number;
  routeNotes?: string;
  whatToBring?: string;
  coachTips?: string;
  /** Simplified GPX track, [lng, lat] pairs (event page map). */
  routeLine?: [number, number][];
  /** Public download URL of the original .gpx. */
  routeGpxUrl?: string;
  /** Short Markdown summary shown under the "at a glance" icon box. */
  overview?: string;
  /** Ordered media for the gallery section (empty = no section). */
  gallery?: EventMedia[];
  /** Raw MDX body */
  content: string;
}

/** One item of an event's media gallery (events.gallery, 0011). */
export interface EventMedia {
  /** ImageKit path, e.g. /YRC/Events/…/IMG_2163.mov */
  src: string;
  type: "image" | "video";
  /**
   * Still image for a video (ImageKit path). ImageKit can't generate video
   * thumbnails on this account (transformation quota), so posters are real
   * images, captured at upload time.
   */
  poster?: string;
  alt?: string;
}

const VIDEO_EXT = /\.(mov|mp4|m4v|webm)$/i;

/** "image" | "video" from an ImageKit path's extension. */
export function mediaTypeOf(path: string): EventMedia["type"] {
  return VIDEO_EXT.test(path.split("?")[0]) ? "video" : "image";
}

/** ImageKit paths are stored URL-encoded (spaces → %20), like covers. */
function encodeMediaPath(path: string): string {
  const trimmed = path.trim();
  return /\s/.test(trimmed) ? encodeURI(trimmed) : trimmed;
}

/**
 * Validates and normalizes a raw `events.gallery` value (DB jsonb, admin
 * form JSON or agent input): drops anything without a usable path, infers
 * a missing type from the extension, caps at 40 items.
 */
export function normalizeEventGallery(raw: unknown): EventMedia[] {
  if (!Array.isArray(raw)) return [];
  const out: EventMedia[] = [];
  for (const item of raw) {
    const record =
      typeof item === "string" ? { src: item } : (item as Record<string, unknown> | null);
    if (!record || typeof record.src !== "string") continue;
    const src = encodeMediaPath(record.src);
    if (!src.startsWith("/") || src.length > 500) continue;
    const type =
      record.type === "image" || record.type === "video" ? record.type : mediaTypeOf(src);
    const media: EventMedia = { src, type };
    if (typeof record.poster === "string" && record.poster.trim().startsWith("/")) {
      media.poster = encodeMediaPath(record.poster).slice(0, 500);
    }
    if (typeof record.alt === "string" && record.alt.trim()) {
      media.alt = record.alt.trim().slice(0, 200);
    }
    out.push(media);
    if (out.length === 40) break;
  }
  return out;
}

/** Public URL of a GPX object in the `event-routes` Storage bucket. */
export function routeGpxUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-routes/${path}`;
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

/** "07:00:00" → "07:00" (Postgres time strings carry seconds). */
export function formatTime(t: string): string {
  return t.slice(0, 5);
}

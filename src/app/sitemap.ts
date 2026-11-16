import type { MetadataRoute } from "next";

import { getAllEvents } from "@/lib/events-db";
import { getPostSummaries } from "@/lib/posts-db";
import { SITE_URL } from "@/lib/site";

// Rebuilt with the event/journal data (events change via admin + cron).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, posts] = await Promise.all([
    getAllEvents().catch(() => []),
    getPostSummaries().catch(() => []),
  ]);

  const pages = ["", "/events", "/events/all", "/events/past", "/community", "/about", "/journal"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );

  return [
    ...pages,
    ...events.map((event) => ({
      url: `${SITE_URL}/events/${event.slug}`,
      lastModified: event.date,
      changeFrequency: "weekly" as const,
      priority: event.isPast ? 0.4 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/journal/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

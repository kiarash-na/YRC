import { cache } from "react";

import type {
  BlogPost,
  HighlightMedia,
  PostSummary,
} from "@/lib/content-shared";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Journal data layer — reads from the Supabase `posts` table (source of
 * truth; the old content/blog/*.mdx files were migrated into the seed).
 * Returns the same shapes the MDX loader did, so UI components are unchanged.
 *
 * List queries use a slim SELECT (no MDX body); only getPostBySlug fetches
 * the body. Tag helpers are pure functions over an already-fetched summaries
 * array, so a page pays for exactly one list query.
 */

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  /** ISO date string (YYYY-MM-DD) — Postgres `date` comes back un-timezoned. */
  date: string;
  author: string;
  tags: string[];
  /** ImageKit paths; image vs video is derived from the extension. */
  highlights: string[];
  body: string;
}

const POST_SELECT_SUMMARY =
  "id, slug, title, excerpt, cover, date, author, tags, highlights";
const POST_SELECT_FULL = `${POST_SELECT_SUMMARY}, body`;

const HIGHLIGHT_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const HIGHLIGHT_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];

function toHighlightMedia(paths: string[]): HighlightMedia[] | undefined {
  if (paths.length === 0) return undefined;
  const media: HighlightMedia[] = [];
  for (const src of paths) {
    const extension = src.slice(src.lastIndexOf(".")).toLowerCase();
    if (HIGHLIGHT_IMAGE_EXTENSIONS.includes(extension)) {
      media.push({ src, type: "image" });
    } else if (HIGHLIGHT_VIDEO_EXTENSIONS.includes(extension)) {
      media.push({ src, type: "video" });
    } else {
      console.warn(`Skipping post highlight with unknown extension: ${src}`);
    }
  }
  return media.length > 0 ? media : undefined;
}

function toPostItem(row: PostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover: row.cover,
    date: row.date,
    author: row.author,
    tags: row.tags,
    highlights: toHighlightMedia(row.highlights),
    content: row.body ?? "",
  };
}

function toPostSummary(post: BlogPost): PostSummary {
  const rest: Partial<BlogPost> = { ...post };
  delete rest.content;
  return rest as PostSummary;
}

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** All posts, newest first, without the MDX body. */
export async function getPostSummaries(): Promise<PostSummary[]> {
  if (!configured()) return []; // Supabase not configured yet (e.g. fresh preview env)
  try {
    const { data, error } = await createPublicClient()
      .from("posts")
      .select(POST_SELECT_SUMMARY)
      .order("date", { ascending: false });

    if (error) {
      console.error("Failed to load posts from Supabase:", error.message);
      return [];
    }
    return (data as Omit<PostRow, "body">[]).map((row) =>
      toPostSummary(toPostItem({ ...row, body: "" })),
    );
  } catch (error) {
    console.error("Failed to load posts from Supabase:", error);
    return [];
  }
}

/**
 * Full post incl. MDX body. Wrapped in React cache() so generateMetadata
 * and the page share one query per request.
 */
export const getPostBySlug = cache(
  async (slug: string): Promise<BlogPost | undefined> => {
    if (!configured()) return undefined;
    try {
      const { data, error } = await createPublicClient()
        .from("posts")
        .select(POST_SELECT_FULL)
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) return undefined;
      return toPostItem(data as PostRow);
    } catch {
      return undefined;
    }
  },
);

/** Distinct tags across the given posts, alphabetically. */
export function getAllTags(summaries: PostSummary[]): string[] {
  const tags = new Set<string>();
  for (const post of summaries) for (const tag of post.tags) tags.add(tag);
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/** Posts carrying a given tag; input order (newest first) is preserved. */
export function getPostsByTag(
  summaries: PostSummary[],
  tag: string,
): PostSummary[] {
  return summaries.filter((post) => post.tags.includes(tag));
}

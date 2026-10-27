import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

/**
 * Blog/journal content loader — reads MDX files from content/blog at build
 * time. Events no longer live here; they come from Supabase via
 * src/lib/events-db.ts.
 */

export {
  EVENT_CATEGORIES,
  formatDate,
  type EventCategory,
  type EventItem,
  type EventSummary,
} from "@/lib/content-shared";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface HighlightMedia {
  /** ImageKit path, e.g. /YRC/... */
  src: string;
  type: "image" | "video";
}

export interface BlogPost {
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
  /** Raw MDX body (without frontmatter) */
  content: string;
}

export type PostSummary = Omit<BlogPost, "content">;

function toISODate(value: unknown, field: string, file: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString().slice(0, 10);
  }
  throw new Error(`Invalid or missing "${field}" in ${file}`);
}

function requireString(value: unknown, field: string, file: string): string {
  if (typeof value === "string" && value.trim() !== "") return value;
  throw new Error(`Invalid or missing "${field}" in ${file}`);
}

function readCollection(collection: "blog") {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      return { slug, data, content, file: `${collection}/${file}` };
    });
}

const HIGHLIGHT_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const HIGHLIGHT_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];

function parseHighlights(value: unknown, file: string): HighlightMedia[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.trim() === "")) {
    throw new Error(`Invalid "highlights" (string array) in ${file}`);
  }
  return value.map((src) => {
    const extension = src.slice(src.lastIndexOf(".")).toLowerCase();
    if (HIGHLIGHT_IMAGE_EXTENSIONS.includes(extension)) return { src, type: "image" as const };
    if (HIGHLIGHT_VIDEO_EXTENSIONS.includes(extension)) return { src, type: "video" as const };
    throw new Error(
      `Invalid "highlights" entry "${src}" in ${file} — extension must be one of: ${[...HIGHLIGHT_IMAGE_EXTENSIONS, ...HIGHLIGHT_VIDEO_EXTENSIONS].join(", ")}`,
    );
  });
}

function parsePost(entry: ReturnType<typeof readCollection>[number]): BlogPost {
  const { slug, data, content, file } = entry;
  const tags = data.tags;
  if (!Array.isArray(tags) || tags.some((t) => typeof t !== "string")) {
    throw new Error(`Invalid or missing "tags" (string array) in ${file}`);
  }
  return {
    slug,
    title: requireString(data.title, "title", file),
    excerpt: requireString(data.excerpt, "excerpt", file),
    cover: requireString(data.cover, "cover", file),
    date: toISODate(data.date, "date", file),
    author: requireString(data.author, "author", file),
    tags,
    highlights: parseHighlights(data.highlights, file),
    content,
  };
}

const byDateDesc = <T extends { date: string }>(a: T, b: T) =>
  b.date.localeCompare(a.date);

const stripContent = <T extends { content: string }>(item: T): Omit<T, "content"> => {
  const rest: Partial<T> = { ...item };
  delete rest.content;
  return rest as Omit<T, "content">;
};

/** All blog posts, newest first. */
export function getAllPosts(): BlogPost[] {
  return readCollection("blog").map(parsePost).sort(byDateDesc);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

/** Distinct tags across all posts, alphabetically. */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) for (const tag of post.tags) tags.add(tag);
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/** Posts carrying a given tag, newest first. */
export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function toPostSummary(post: BlogPost): PostSummary {
  return stripContent(post);
}

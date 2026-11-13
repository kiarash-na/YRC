# Content lives in the database (2026-11-13)

- Journal posts → `posts` table (public read via RLS, service-role writes; MDX body still rendered by compileMDX, unchanged). Seed: `supabase/seed_content.sql`.
- /events copy → `content_blocks` table (key → jsonb items). Keys: `events.faqs`, `events.course_details`.
- Readers: `src/lib/posts-db.ts` (`getPostSummaries` / `getPostBySlug` (React `cache()`) / `getAllTags` / `getPostsByTag`) and `src/lib/content-blocks.ts` (`getContentBlock<T>(key)`). Both mirror `events-db.ts`: `createPublicClient`, `configured()` guard, never-throw.
- Shared types moved to `src/lib/content-shared.ts`: `PostSummary`, `BlogPost`, `FaqItem`, `CourseDetail`, `HighlightMedia`.
- Deleted: `content/`, `src/lib/content.ts`, `src/data/events.ts`, `scripts/generate-events-seed.mjs`; `gray-matter` dependency removed (`next-mdx-remote` + `@types/mdx` stay).
- Journal pages are ISR (`revalidate = 900`); new posts render on-demand (dynamicParams default). Soft-404 note: unknown slugs stream 200 + `noindex` (documented Next streaming behavior, same as events pages).
- Authoring posts now = SQL editor until backlog `03-admin-journal-ui` ships.

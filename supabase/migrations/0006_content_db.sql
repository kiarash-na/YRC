-- 0006: move the last file-based content into the database
--
-- posts          — journal articles (formerly content/blog/*.mdx)
-- content_blocks — structured page copy (formerly src/data/events.ts:
--                  keys 'events.faqs' and 'events.course_details')
--
-- Both are public read (the site renders them anonymously) with NO write
-- policies: writes happen with the service role only (SQL editor / future
-- admin tooling) — same pattern as the events table.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  cover text not null default '',
  date date not null,
  author text not null default '',
  tags text[] not null default '{}',
  -- media paths (ImageKit); image vs video is derived from the extension in app code
  highlights text[] not null default '{}',
  -- MDX body (rendered with next-mdx-remote, same as before)
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy posts_public_read on public.posts
  for select using (true);

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create table public.content_blocks (
  key text primary key,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.content_blocks enable row level security;

create policy content_blocks_public_read on public.content_blocks
  for select using (true);

create trigger content_blocks_updated_at
  before update on public.content_blocks
  for each row execute function public.set_updated_at();

-- 0013: site media — admin overrides for the image/video boxes on public pages
--
-- The slots (and the media each shows by default) are defined in code:
-- src/lib/site-media.ts. A row here replaces a slot's media; deleting the
-- row resets the slot to its default. `items` is the ordered list of
-- { src, alt, type?, poster?, start?, end?, updatedAt?, position?, width? }
-- (ImageKit paths), validated by normalizeSlotItems() before it is written
-- and again when it is read.
--
-- Public read (the pages render with the anon key); writes only through the
-- admin server actions (service role).

create table public.site_media (
  key text primary key check (key ~ '^[a-z]+(\.[a-z]+)+$' and length(key) <= 80),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 40),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.site_media enable row level security;

create policy "site media is public"
  on public.site_media for select
  to anon, authenticated
  using (true);

-- Supabase default privileges grant ALL to anon + authenticated; narrow it.
revoke all on public.site_media from anon, authenticated;
grant select on public.site_media to anon, authenticated;

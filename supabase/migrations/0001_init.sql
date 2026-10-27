-- ============================================================================
-- YRC members & scoring — initial schema
-- 8 tables: profiles, strava_tokens, admins, events, event_checkin_tokens,
--           event_attendance, score_actions, score_entries
-- Plus: 1 view (profile_scores), 2 public functions (is_admin,
--       check_in_with_token, get_event_for_checkin), triggers.
-- RLS is enabled on every table. Security-advisor clean by design.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles — one row per member (created at first Strava login)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  strava_athlete_id bigint not null unique,
  first_name text not null default '',
  last_name text not null default '',
  avatar_url text,
  city text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. strava_tokens — server-only vault (RLS on, zero policies = deny all)
-- ----------------------------------------------------------------------------
create table public.strava_tokens (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. admins — separate from profiles, hard-capped at 3 (trigger below)
--    email is a human label only; strava_athlete_id is what grants access.
-- ----------------------------------------------------------------------------
create table public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  strava_athlete_id bigint unique,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. events — source of truth for events (replaces content/events/*.mdx)
-- ----------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  cover text not null,
  event_date date not null,
  end_date date,
  location text not null,
  city text not null,
  category text not null check (category in ('race', 'training', 'social', 'camp')),
  registration_url text,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. event_checkin_tokens — one row per QR code; token is the QR secret
-- ----------------------------------------------------------------------------
create table public.event_checkin_tokens (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. event_attendance — who showed up; one check-in per member per event
-- ----------------------------------------------------------------------------
create table public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

-- ----------------------------------------------------------------------------
-- 7. score_actions — the points menu (admin-editable; add rows for future
--    actions like challenges or referrals without any schema change)
-- ----------------------------------------------------------------------------
create table public.score_actions (
  key text primary key,
  points integer not null check (points >= 0),
  description text not null default '',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. score_entries — append-only points ledger; score = sum(points)
-- ----------------------------------------------------------------------------
create table public.score_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  action_key text not null references public.score_actions (key),
  points integer not null,
  event_id uuid references public.events (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes on foreign keys / hot lookups
-- ----------------------------------------------------------------------------
create index event_checkin_tokens_event_id_idx on public.event_checkin_tokens (event_id);
create index event_attendance_event_id_idx on public.event_attendance (event_id);
create index event_attendance_profile_id_idx on public.event_attendance (profile_id);
create index score_entries_profile_id_idx on public.score_entries (profile_id);
create index events_event_date_idx on public.events (event_date);

-- ----------------------------------------------------------------------------
-- updated_at maintenance (shared trigger function)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger score_actions_set_updated_at
  before update on public.score_actions
  for each row execute function public.set_updated_at();

create trigger strava_tokens_set_updated_at
  before update on public.strava_tokens
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Hard cap: maximum 3 admins
-- ----------------------------------------------------------------------------
create or replace function public.enforce_max_three_admins()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.admins) >= 3 then
    raise exception 'Maximum of 3 admins allowed';
  end if;
  return new;
end;
$$;

create trigger admins_max_three
  before insert on public.admins
  for each row execute function public.enforce_max_three_admins();

-- ----------------------------------------------------------------------------
-- is_admin() — is the current user a linked admin?
-- security definer so it can read admins/profiles inside RLS policies
-- without recursion.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    join public.profiles p on p.strava_athlete_id = a.strava_athlete_id
    where p.id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- get_event_for_checkin(token) — public-safe preview of an event behind a QR
-- token, without ever exposing the tokens table to clients.
-- ----------------------------------------------------------------------------
create or replace function public.get_event_for_checkin(qr_token uuid)
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
begin
  select e.* into v_event
  from public.event_checkin_tokens t
  join public.events e on e.id = t.event_id
  where t.token = qr_token
    and t.is_active;

  if v_event.id is null then
    return null;
  end if;

  return json_build_object(
    'title', v_event.title,
    'slug', v_event.slug,
    'event_date', v_event.event_date,
    'location', v_event.location,
    'city', v_event.city
  );
end;
$$;

revoke all on function public.get_event_for_checkin(uuid) from public, anon;
grant execute on function public.get_event_for_checkin(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- check_in_with_token(token) — the single door for check-ins.
-- Validates the QR token, records attendance (idempotent), and appends the
-- points ledger entry using the CURRENT price from score_actions.
-- ----------------------------------------------------------------------------
create or replace function public.check_in_with_token(qr_token uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_event public.events%rowtype;
  v_points integer;
  v_attendance_id uuid;
begin
  if v_user is null then
    return json_build_object('status', 'not_authenticated');
  end if;

  select e.* into v_event
  from public.event_checkin_tokens t
  join public.events e on e.id = t.event_id
  where t.token = qr_token
    and t.is_active;

  if v_event.id is null then
    return json_build_object('status', 'invalid_token');
  end if;

  if not exists (select 1 from public.profiles where id = v_user) then
    return json_build_object('status', 'no_profile');
  end if;

  insert into public.event_attendance (event_id, profile_id)
  values (v_event.id, v_user)
  on conflict (event_id, profile_id) do nothing
  returning id into v_attendance_id;

  if v_attendance_id is null then
    return json_build_object(
      'status', 'already_checked_in',
      'event', json_build_object('title', v_event.title, 'slug', v_event.slug)
    );
  end if;

  select points into v_points
  from public.score_actions
  where key = 'event_attendance' and is_active;

  if v_points is not null then
    insert into public.score_entries (profile_id, action_key, points, event_id)
    values (v_user, 'event_attendance', v_points, v_event.id);
  end if;

  return json_build_object(
    'status', 'checked_in',
    'points', coalesce(v_points, 0),
    'event', json_build_object(
      'title', v_event.title,
      'slug', v_event.slug,
      'event_date', v_event.event_date
    )
  );
end;
$$;

revoke all on function public.check_in_with_token(uuid) from public, anon;
grant execute on function public.check_in_with_token(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- profile_scores view — profile_id → total points (security invoker so it
-- respects RLS: members see their own total, admins/service role see all)
-- ----------------------------------------------------------------------------
create or replace view public.profile_scores
with (security_invoker = on)
as
select
  p.id as profile_id,
  coalesce(sum(se.points), 0)::integer as total_points
from public.profiles p
left join public.score_entries se on se.profile_id = p.id
group by p.id;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.strava_tokens enable row level security;
alter table public.admins enable row level security;
alter table public.events enable row level security;
alter table public.event_checkin_tokens enable row level security;
alter table public.event_attendance enable row level security;
alter table public.score_actions enable row level security;
alter table public.score_entries enable row level security;

-- profiles: read/edit your own row; admins can read all (members list).
-- inserts/deletes only via the service role (login flow on the server).
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- strava_tokens: RLS enabled, intentionally NO policies — deny all client
-- access; only the service role (server) ever touches this table.

-- admins: you may only check whether YOU are a linked admin. Writes are
-- service-role only (managed via the admin dashboard / SQL).
create policy "admins_select_self"
  on public.admins for select
  to authenticated
  using (
    strava_athlete_id is not null
    and strava_athlete_id = (
      select p.strava_athlete_id from public.profiles p where p.id = auth.uid()
    )
  );

-- events: public read (they are public website content). No client writes —
-- all writes go through server actions with the service role + is_admin().
create policy "events_public_read"
  on public.events for select
  using (true);

-- event_checkin_tokens: RLS enabled, intentionally NO policies — the QR
-- secrets are never readable by clients; only the security-definer functions
-- and the service role use this table.

-- event_attendance: read your own; admins read all. Inserts only via
-- check_in_with_token().
create policy "attendance_select_own"
  on public.event_attendance for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "attendance_select_admin"
  on public.event_attendance for select
  to authenticated
  using (public.is_admin());

-- score_actions: readable by everyone (points config is not secret);
-- writable only via the service role (admin dashboard).
create policy "score_actions_read"
  on public.score_actions for select
  using (true);

-- score_entries: read your own ledger; admins read all. Inserts only via
-- check_in_with_token() / service role.
create policy "score_entries_select_own"
  on public.score_entries for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "score_entries_select_admin"
  on public.score_entries for select
  to authenticated
  using (public.is_admin());

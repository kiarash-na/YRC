-- 0008: RSVP capture, newsletter subscribers, public leaderboard, gamification
--
-- event_rsvps            — Join flow contact capture (per event, with
--                          newsletter opt-in). RLS on, NO policies: writes only
--                          via service-role server actions (strava_tokens pattern).
-- newsletter_subscribers — minimal newsletter list; sending is manual via the
--                          Resend dashboard for now.
-- profiles.leaderboard_opt_out — members hide themselves from the public board;
--                          added to the 0005 column-level grant list so the
--                          settings toggle can write it.
-- get_leaderboard(int)   — public-safe slice (first name, avatar, points,
--                          attended count); excludes opted-out + zero-activity
--                          members. SECURITY DEFINER (profiles RLS is self/admin
--                          only); executable by anon+authenticated+service_role.
-- get_community_stats()  — totals for the homepage strip (the security_invoker
--                          aggregate views return nothing to anon).
-- get_profile_id_by_email(text) — service-role ONLY helper used to award points
--                          for email-originated actions (newsletter/RSVP).
--                          NOTE: Supabase default privileges grant EXECUTE on new
--                          functions to anon+authenticated directly — revoking
--                          from PUBLIC alone does nothing; revoke from all three.
-- Gamification: newsletter_subscribe / strava_connect / profile_complete (1 pt
-- each, one-time — enforced by the partial unique index; event_attendance rows
-- carry event_id so they stay repeatable). Existing members are backfilled.

create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  email text not null check (position('@' in email) > 1),
  first_name text not null default '',
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  unique (event_id, email)
);
create index event_rsvps_event_id_idx on public.event_rsvps (event_id);
alter table public.event_rsvps enable row level security;

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (position('@' in email) > 1),
  first_name text not null default '',
  source text not null default 'website' check (source in ('website','rsvp')),
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;

alter table public.profiles add column leaderboard_opt_out boolean not null default false;
grant update (leaderboard_opt_out) on public.profiles to authenticated;

create or replace function public.get_profile_id_by_email(p_email text)
returns uuid
language sql stable security definer set search_path = '' as $$
  select p.id from public.profiles p
  join auth.users u on u.id = p.id
  where lower(u.email) = lower(trim(p_email))
  limit 1;
$$;
revoke all on function public.get_profile_id_by_email(text) from public, anon, authenticated;
grant execute on function public.get_profile_id_by_email(text) to service_role;

create or replace function public.get_leaderboard(limit_count integer default 50)
returns table (first_name text, avatar_url text, total_points integer, events_attended integer)
language sql stable security definer set search_path = '' as $$
  select s.first_name, s.avatar_url, s.total_points, s.events_attended from (
    select nullif(p.first_name, '') as first_name, p.avatar_url,
      (select coalesce(sum(se.points), 0) from public.score_entries se where se.profile_id = p.id)::integer as total_points,
      (select count(*) from public.event_attendance ea where ea.profile_id = p.id)::integer as events_attended
    from public.profiles p
    where not p.leaderboard_opt_out
  ) s
  where s.total_points > 0 or s.events_attended > 0
  order by s.total_points desc, s.events_attended desc, s.first_name
  limit least(greatest(limit_count, 1), 100);
$$;
revoke all on function public.get_leaderboard(integer) from public, anon, authenticated;
grant execute on function public.get_leaderboard(integer) to anon, authenticated, service_role;

create or replace function public.get_community_stats()
returns table (members integer, total_strides integer, total_checkins integer)
language sql stable security definer set search_path = '' as $$
  select
    (select count(*) from public.profiles where not leaderboard_opt_out)::integer,
    (select coalesce(sum(points), 0) from public.score_entries)::integer,
    (select count(*) from public.event_attendance)::integer;
$$;
revoke all on function public.get_community_stats() from public, anon, authenticated;
grant execute on function public.get_community_stats() to anon, authenticated, service_role;

insert into public.score_actions (key, points, description) values
  ('newsletter_subscribe', 1, 'Subscribed to the YRC newsletter'),
  ('strava_connect', 1, 'Connected a Strava account'),
  ('profile_complete', 1, 'Completed profile (name, city, country)')
on conflict (key) do nothing;

create unique index score_entries_onetime_uidx
  on public.score_entries (profile_id, action_key) where event_id is null;

-- backfill existing members
insert into public.score_entries (profile_id, action_key, points)
select p.id, 'strava_connect', 1 from public.profiles p where p.strava_athlete_id is not null
on conflict do nothing;
insert into public.score_entries (profile_id, action_key, points)
select p.id, 'profile_complete', 1 from public.profiles p
where p.first_name <> '' and p.last_name <> '' and p.city is not null and p.country is not null
on conflict do nothing;

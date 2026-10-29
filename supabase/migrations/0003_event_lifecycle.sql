-- ============================================================================
-- 0003_event_lifecycle.sql — past-event lifecycle
--
-- * events.is_past   — DB-level flag, maintained by pg_cron (Berlin midnight)
-- * events.recurrence — 'weekly' auto-duplicates the event when it turns past
-- * check-in window  — QR works only from 00:00 (Europe/Berlin) on the event
--   day until 00:00 after the last day; enforced in the RPCs themselves so
--   correctness never depends on the cron cadence
-- * cron job yrc-event-lifecycle runs every 15 min (DST-proof)
--
-- Run in the Supabase SQL editor after 0002_email_login.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Columns + backfill
-- ----------------------------------------------------------------------------
alter table public.events
  add column is_past boolean not null default false;

alter table public.events
  add column recurrence text check (recurrence is null or recurrence in ('weekly'));

update public.events
set is_past = true
where (now() at time zone 'Europe/Berlin')::date > coalesce(end_date, event_date);

create index events_is_past_date_idx
  on public.events (is_past, event_date desc);

-- ----------------------------------------------------------------------------
-- 2. Lifecycle maintenance — flip is_past, auto-duplicate weekly events
-- ----------------------------------------------------------------------------
create or replace function public.maintain_event_lifecycle()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Europe/Berlin')::date;
  v_event record;
  v_new_slug text;
  v_new_id uuid;
begin
  for v_event in
    select * from public.events
    where not is_past
      and v_today > coalesce(end_date, event_date)
  loop
    update public.events
    set is_past = true, updated_at = now()
    where id = v_event.id;

    if v_event.recurrence = 'weekly' then
      -- strip a trailing -YYYYMMDD from earlier auto-copies so slugs stay short
      v_new_slug := left(regexp_replace(v_event.slug, '-\d{8}$', ''), 150)
                    || '-' || to_char(v_event.event_date + 7, 'YYYYMMDD');

      -- idempotent: if next week's occurrence already exists, do nothing
      if not exists (select 1 from public.events e where e.slug = v_new_slug) then
        insert into public.events (
          slug, title, excerpt, cover, event_date, end_date,
          location, city, category, registration_url, body, is_past, recurrence
        ) values (
          v_new_slug, v_event.title, v_event.excerpt, v_event.cover,
          v_event.event_date + 7,
          case when v_event.end_date is not null then v_event.end_date + 7 end,
          v_event.location, v_event.city, v_event.category,
          v_event.registration_url, v_event.body, false, 'weekly'
        )
        returning id into v_new_id;

        -- every event gets a QR check-in token (same rule as createEvent)
        insert into public.event_checkin_tokens (event_id) values (v_new_id);
      end if;
    end if;
  end loop;
end;
$$;

revoke all on function public.maintain_event_lifecycle() from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Check-in window in the RPCs (source of truth = Berlin calendar day)
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
  v_today date := (now() at time zone 'Europe/Berlin')::date;
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
    'city', v_event.city,
    'window_status', case
      when v_today < v_event.event_date then 'not_started'
      when v_today > coalesce(v_event.end_date, v_event.event_date) then 'ended'
      else 'active'
    end
  );
end;
$$;

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
  v_today date := (now() at time zone 'Europe/Berlin')::date;
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

  -- QR activates at 00:00 (Berlin) on the event day …
  if v_today < v_event.event_date then
    return json_build_object(
      'status', 'not_started',
      'event', json_build_object('title', v_event.title, 'slug', v_event.slug, 'event_date', v_event.event_date)
    );
  end if;

  -- … and closes at 00:00 after the last day (past events reject check-ins).
  if v_today > coalesce(v_event.end_date, v_event.event_date) then
    return json_build_object(
      'status', 'event_ended',
      'event', json_build_object('title', v_event.title, 'slug', v_event.slug, 'event_date', v_event.event_date)
    );
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
-- 4. pg_cron — keep is_past fresh (and weekly copies spawning) around midnight
-- ----------------------------------------------------------------------------
create extension if not exists pg_cron;

-- idempotent re-schedule
do $unsched$
begin
  perform cron.unschedule('yrc-event-lifecycle');
exception when others then
  null;
end
$unsched$;

select cron.schedule(
  'yrc-event-lifecycle',
  '*/15 * * * *',
  $job$select public.maintain_event_lifecycle()$job$
);

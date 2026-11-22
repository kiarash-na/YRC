-- 0012: weekly series — always keep the next 6 weeks open for registration
--
-- A weekly event stays one row per date (each with its own registrations,
-- QR token and check-ins), now linked by events.series_slug (the slug
-- without the -YYYYMMDD suffix). maintain_event_lifecycle() no longer adds
-- one copy when a date passes; it tops every live series up to SIX upcoming
-- dates, copying the latest date forward a week at a time. A series stops
-- growing once its latest date is no longer weekly (admin turned it off).
--
-- series_slug is filled by a trigger whenever an event is (or becomes)
-- weekly, so the admin form, the Agent and the copies all get it for free.

alter table public.events add column series_slug text;

update public.events
set series_slug = regexp_replace(slug, '-\d{8}$', '')
where recurrence = 'weekly';

create index events_series_idx
  on public.events (series_slug, event_date)
  where series_slug is not null;

create or replace function public.set_event_series_slug()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.recurrence = 'weekly' and new.series_slug is null then
    new.series_slug := regexp_replace(new.slug, '-\d{8}$', '');
  end if;
  return new;
end;
$function$;

create trigger events_series_slug
  before insert or update of recurrence, slug on public.events
  for each row execute function public.set_event_series_slug();

create or replace function public.maintain_event_lifecycle()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  -- How many upcoming dates every weekly series keeps open.
  c_horizon constant int := 6;
  v_today date := (now() at time zone 'Europe/Berlin')::date;
  v_series text;
  v_last public.events%rowtype;
  v_upcoming int;
  v_new_slug text;
  v_new_id uuid;
begin
  -- 1. Dates that are over become past.
  update public.events
  set is_past = true, updated_at = now()
  where not is_past
    and v_today > coalesce(end_date, event_date);

  -- 2. Top every weekly series up to c_horizon upcoming dates.
  for v_series in
    select distinct series_slug from public.events where series_slug is not null
  loop
    select * into v_last
    from public.events
    where series_slug = v_series
    order by event_date desc
    limit 1;

    continue when v_last.recurrence is distinct from 'weekly';

    select count(*) into v_upcoming
    from public.events
    where series_slug = v_series and not is_past;

    while v_upcoming < c_horizon loop
      v_last.event_date := v_last.event_date + 7;
      v_last.end_date := v_last.end_date + 7;
      v_new_slug := left(v_series, 150) || '-' || to_char(v_last.event_date, 'YYYYMMDD');

      if not exists (select 1 from public.events e where e.slug = v_new_slug) then
        insert into public.events (
          slug, series_slug, title, excerpt, cover, event_date, end_date,
          location, city, category, registration_url, body, is_past, recurrence,
          start_time, duration_minutes, meeting_point, finish_point,
          distance_km, elevation_gain_m, route_notes, what_to_bring, coach_tips,
          route_gpx_path, route_line, overview, gallery
        ) values (
          v_new_slug, v_series, v_last.title, v_last.excerpt, v_last.cover,
          v_last.event_date, v_last.end_date,
          v_last.location, v_last.city, v_last.category,
          v_last.registration_url, v_last.body,
          v_today > coalesce(v_last.end_date, v_last.event_date), 'weekly',
          v_last.start_time, v_last.duration_minutes, v_last.meeting_point,
          v_last.finish_point, v_last.distance_km, v_last.elevation_gain_m,
          v_last.route_notes, v_last.what_to_bring, v_last.coach_tips,
          v_last.route_gpx_path, v_last.route_line, v_last.overview,
          v_last.gallery
        )
        returning id into v_new_id;

        insert into public.event_checkin_tokens (event_id) values (v_new_id);
      end if;

      -- A date far in the past (series revived after a break) doesn't count.
      if v_today <= coalesce(v_last.end_date, v_last.event_date) then
        v_upcoming := v_upcoming + 1;
      end if;
    end loop;
  end loop;
end;
$function$;

revoke all on function public.maintain_event_lifecycle() from public, anon, authenticated;
revoke all on function public.set_event_series_slug() from public, anon, authenticated;

-- Open the next six weeks right away.
select public.maintain_event_lifecycle();

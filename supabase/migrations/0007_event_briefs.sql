-- 0007: structured technical briefs on events + new categories
--
-- Adds the machine-readable brief fields (they feed the event brief panel and
-- the .ics calendar invite; MDX body stays for storytelling), expands the
-- category CHECK with the five service categories (weekly community runs,
-- weekend long runs, technical drills, community swimming, trail runs — the
-- existing four stay for races/camps/trips), nulls self-referential
-- registration URLs, backfills what the body prose already tells us, and
-- re-creates maintain_event_lifecycle() so weekly auto-copies carry the new
-- columns (its INSERT uses an explicit column list — silent drop otherwise).

alter table public.events
  add column start_time time,               -- Berlin wall-clock
  add column duration_minutes integer check (duration_minutes is null or duration_minutes between 5 and 4320),
  add column meeting_point text,
  add column finish_point text,             -- null = same as meeting_point
  add column distance_km numeric(6,2) check (distance_km is null or distance_km > 0),
  add column elevation_gain_m integer check (elevation_gain_m is null or elevation_gain_m >= 0),
  add column route_notes text,
  add column what_to_bring text,
  add column coach_tips text;

alter table public.events drop constraint events_category_check;
alter table public.events add constraint events_category_check
  check (category in ('race','training','social','camp',
                      'community-run','long-run','drills','swim','trail'));

-- self-links only reload the page (RSVP replaces them)
update public.events set registration_url = null
where registration_url like 'https://yasrise.run/events/%';

-- backfill from known body prose (only unambiguous values)
update public.events set start_time = '19:00', route_notes = 'Flat, measured stretch between Kuruçeşme and Bebek', what_to_bring = 'Running shoes, a small water bottle, and a light layer for the cool-down' where slug = 'bosphorus-speed-work';
update public.events set start_time = '20:00', distance_km = 10, route_notes = 'Two flat loops on closed roads along the harbour, timing mats every kilometer' where slug = 'dubai-10k-night-race';
update public.events set start_time = '09:00', distance_km = 5, route_notes = 'Mostly flat with one small hill; Moda back streets loop' where slug = 'kadikoy-coffee-run';
update public.events set start_time = '07:00', distance_km = 7.5, route_notes = 'Easy social loop (~7–8 km), drills included; meet 06:45 at the café' where slug = 'munich-tuesday-community-run';
update public.events set start_time = '19:30', distance_km = 6, route_notes = 'Flat promenade out-and-back' where slug = 'summer-sunset-social-run';
update public.events set start_time = '19:30', what_to_bring = 'Regular trainers are fine — spikes not needed' where slug = 'track-thursdays-interval-session';
update public.events set distance_km = 21.1, route_notes = 'Flat city course' where slug = 'berlin-half-marathon-2026';
update public.events set distance_km = 21.1 where slug = 'tehran-spring-half-marathon';
update public.events set route_notes = 'Soft trail surfaces, marked routes through Göreme and the Red Valley (~1,200 m altitude)' where slug = 'cappadocia-altitude-training-camp';

-- weekly auto-copies must carry the brief
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
          location, city, category, registration_url, body, is_past, recurrence,
          start_time, duration_minutes, meeting_point, finish_point,
          distance_km, elevation_gain_m, route_notes, what_to_bring, coach_tips
        ) values (
          v_new_slug, v_event.title, v_event.excerpt, v_event.cover,
          v_event.event_date + 7,
          case when v_event.end_date is not null then v_event.end_date + 7 end,
          v_event.location, v_event.city, v_event.category,
          v_event.registration_url, v_event.body, false, 'weekly',
          v_event.start_time, v_event.duration_minutes, v_event.meeting_point,
          v_event.finish_point, v_event.distance_km, v_event.elevation_gain_m,
          v_event.route_notes, v_event.what_to_bring, v_event.coach_tips
        )
        returning id into v_new_id;

        -- every event gets a QR check-in token (same rule as createEvent)
        insert into public.event_checkin_tokens (event_id) values (v_new_id);
      end if;
    end if;
  end loop;
end;
$$;

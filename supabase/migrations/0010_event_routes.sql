-- 0010: GPX routes on events
--
-- events.route_gpx_path — object path of the uploaded .gpx in the public
--                         `event-routes` bucket (download link on the page).
-- events.route_line     — the parsed + simplified track as a JSON array of
--                         [lng, lat] pairs, written at upload time by the admin
--                         action, so event pages render the map without
--                         fetching/parsing GPX per request.
--
-- Storage: public-read bucket (anyone can download a route); no storage RLS
-- policies → only the service role (admin server actions) can write.
--
-- maintain_event_lifecycle() is re-created so weekly auto-copies carry the
-- route (its INSERT uses an explicit column list — new columns are silently
-- dropped otherwise; see 0007).

alter table public.events
  add column route_gpx_path text,
  add column route_line jsonb
    check (route_line is null or jsonb_typeof(route_line) = 'array');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-routes', 'event-routes', true, 4194304, array['application/gpx+xml'])
on conflict (id) do nothing;

create or replace function public.maintain_event_lifecycle()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
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
      v_new_slug := left(regexp_replace(v_event.slug, '-\d{8}$', ''), 150)
                    || '-' || to_char(v_event.event_date + 7, 'YYYYMMDD');

      if not exists (select 1 from public.events e where e.slug = v_new_slug) then
        insert into public.events (
          slug, title, excerpt, cover, event_date, end_date,
          location, city, category, registration_url, body, is_past, recurrence,
          start_time, duration_minutes, meeting_point, finish_point,
          distance_km, elevation_gain_m, route_notes, what_to_bring, coach_tips,
          route_gpx_path, route_line
        ) values (
          v_new_slug, v_event.title, v_event.excerpt, v_event.cover,
          v_event.event_date + 7,
          case when v_event.end_date is not null then v_event.end_date + 7 end,
          v_event.location, v_event.city, v_event.category,
          v_event.registration_url, v_event.body, false, 'weekly',
          v_event.start_time, v_event.duration_minutes, v_event.meeting_point,
          v_event.finish_point, v_event.distance_km, v_event.elevation_gain_m,
          v_event.route_notes, v_event.what_to_bring, v_event.coach_tips,
          v_event.route_gpx_path, v_event.route_line
        )
        returning id into v_new_id;

        insert into public.event_checkin_tokens (event_id) values (v_new_id);
      end if;
    end if;
  end loop;
end;
$function$;

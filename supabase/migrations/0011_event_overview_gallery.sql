-- 0011: event page template — overview text + media gallery
--
-- events.overview — short Markdown summary shown right under the "at a
--                   glance" icon box (who/what/where in two or three lines).
--                   The long-form body stays in events.body ("Explore the
--                   details").
-- events.gallery  — ordered JSON array of media items for the gallery
--                   section: { "src": "/YRC/…", "type": "image" | "video",
--                   "poster"?: "/YRC/….jpg", "alt"?: "…" }. src/poster are
--                   ImageKit paths. Empty array = no gallery section.
--
-- maintain_event_lifecycle() is re-created so weekly auto-copies carry both
-- columns (its INSERT uses an explicit column list — see 0007/0010).

alter table public.events
  add column overview text,
  add column gallery jsonb not null default '[]'::jsonb
    check (jsonb_typeof(gallery) = 'array' and jsonb_array_length(gallery) <= 40);

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
          route_gpx_path, route_line, overview, gallery
        ) values (
          v_new_slug, v_event.title, v_event.excerpt, v_event.cover,
          v_event.event_date + 7,
          case when v_event.end_date is not null then v_event.end_date + 7 end,
          v_event.location, v_event.city, v_event.category,
          v_event.registration_url, v_event.body, false, 'weekly',
          v_event.start_time, v_event.duration_minutes, v_event.meeting_point,
          v_event.finish_point, v_event.distance_km, v_event.elevation_gain_m,
          v_event.route_notes, v_event.what_to_bring, v_event.coach_tips,
          v_event.route_gpx_path, v_event.route_line, v_event.overview,
          v_event.gallery
        )
        returning id into v_new_id;

        insert into public.event_checkin_tokens (event_id) values (v_new_id);
      end if;
    end if;
  end loop;
end;
$function$;

revoke all on function public.maintain_event_lifecycle() from public, anon, authenticated;

-- 0005: close the admin-escalation hole on profiles.strava_athlete_id
--
-- Why: admin access is decided by matching profiles.strava_athlete_id against
-- admins.strava_athlete_id (is_admin() SQL function + requireAdmin() in the
-- app). The profiles_update_own RLS policy lets any signed-in member UPDATE
-- their own row — and RLS cannot restrict columns — so a member could PATCH
-- /rest/v1/profiles?id=eq.<own-id> with an admin's (public) Strava athlete ID
-- and become admin. Strava athlete IDs are public recon (club/profile URLs).
--
-- Two layers:
--   1. Column-level privileges: the authenticated role keeps UPDATE only on
--      self-service columns; strava_athlete_id is no longer writable via the
--      Data API at all (the service role keeps its full table-level grant).
--   2. A BEFORE INSERT/UPDATE trigger as defense in depth, in case grants are
--      widened again later: athlete-ID changes are rejected unless the caller
--      is the service role (Strava login/link flows in /auth/callback/strava)
--      or a direct postgres console session.
--
-- Legit flows that must keep working (verified):
--   * Strava login/link upserts         -> service_role JWT claim -> allowed
--   * updateProfile (name/city/country) -> columns in the grant    -> allowed
--   * handle_new_user insert (id only)  -> athlete id is null      -> allowed
--   * dashboard/SQL-editor maintenance  -> runs as postgres        -> allowed

revoke update on public.profiles from authenticated;
grant update (first_name, last_name, avatar_url, city, country)
  on public.profiles to authenticated;

create or replace function public.protect_profile_strava_link()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_role text := coalesce(
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb) ->> 'role',
    nullif(current_setting('request.jwt.claim.role', true), ''),
    current_user
  );
begin
  if v_role in ('service_role', 'postgres') then
    return new;
  end if;

  if (tg_op = 'INSERT' and new.strava_athlete_id is not null)
     or (tg_op = 'UPDATE' and new.strava_athlete_id is distinct from old.strava_athlete_id) then
    raise exception 'strava_athlete_id is managed by the Strava sign-in flow';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_strava_link on public.profiles;
create trigger profiles_protect_strava_link
  before insert or update on public.profiles
  for each row execute function public.protect_profile_strava_link();

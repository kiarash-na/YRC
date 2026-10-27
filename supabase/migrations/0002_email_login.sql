-- ============================================================================
-- YRC 0002 — email (magic-link) login support
--
-- - profiles.strava_athlete_id becomes nullable (email-only members have no
--   Strava account)
-- - new auth users automatically get a profiles row (trigger on auth.users),
--   regardless of login method
-- - is_admin() now matches a seat by linked Strava athlete ID OR by the
--   seat's email label equal to the member's auth email (magic-link login)
-- ============================================================================

-- 1. Email-only members have no Strava athlete ID
alter table public.profiles alter column strava_athlete_id drop not null;

-- 2. Auto-create a blank profile for every new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Admin check: linked Strava athlete ID OR seat email == auth email
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
  ) or exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 0009: member event registrations
--
-- event_registrations — a logged-in member's "I'm coming" for an upcoming
-- event (the event page's Register CTA). Distinct from:
--   event_rsvps       anonymous email contact capture (0008)
--   event_attendance  proof of presence via QR check-in (0001)
--
-- Members write their OWN rows directly (RLS-enforced, user's session — no
-- service role): insert only for themselves and only while the event is not
-- past; read only their own rows; admins read all. No update/delete grants:
-- registration is append-only from the client for now.

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

-- (event_id, profile_id) is covered by the unique index; profile lookups
-- ("my registrations") get their own.
create index event_registrations_profile_id_idx
  on public.event_registrations (profile_id);

alter table public.event_registrations enable row level security;

-- Supabase default privileges grant ALL to anon + authenticated; narrow it.
revoke all on public.event_registrations from anon, authenticated;
grant select, insert on public.event_registrations to authenticated;

create policy "registrations_select_own"
  on public.event_registrations for select
  to authenticated
  using ((select auth.uid()) = profile_id);

create policy "registrations_select_admin"
  on public.event_registrations for select
  to authenticated
  using (public.is_admin());

create policy "registrations_insert_own_upcoming"
  on public.event_registrations for insert
  to authenticated
  with check (
    (select auth.uid()) = profile_id
    and exists (
      select 1 from public.events e
      where e.id = event_id and not e.is_past
    )
  );

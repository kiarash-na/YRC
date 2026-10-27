# YRC database setup (Supabase)

One-time setup, ~10 minutes, no CLI needed — everything runs in the Supabase SQL editor.

## 1. Create the project

1. [supabase.com](https://supabase.com) → **New project** → name `yrc`, pick the region closest to the community (e.g. Frankfurt).
2. From **Project Settings → API** copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (never exposed to the browser)

## 2. Apply schema + seed

In **SQL Editor**, run in this order:

1. `supabase/migrations/0001_init.sql` — tables, RLS, functions, triggers, view
2. `supabase/seed.sql` — points menu + all events + one QR token per event

Then open **Database → Advisors → Security Advisor** — it should show no errors.

## 3. Create the first admin seat (by hand — personal emails stay out of this repo)

```sql
insert into public.admins (email) values ('<the-admin-email>');
```

The email is only a label. Access comes from linking the seat to a Strava athlete ID:

1. The person logs in once at `/login` (Strava button).
2. Find their `strava_athlete_id` in **Table Editor → profiles** (or they can read it on their `/profile/settings` page).
3. Link it:

```sql
update public.admins
set strava_athlete_id = <their-athlete-id>
where email = '<the-admin-email>';
```

After that they manage the seats themselves at `/admin/admins` (max 3, enforced by the database).

## 4. Wire the app

Set the env vars (see `.env.example`) in:

- **Dokploy** (app `yrc-preview`) — dev values, `NEXT_PUBLIC_SITE_URL=https://yrc-dev.kiarash.online`
- **Vercel** (production) — prod values, `NEXT_PUBLIC_SITE_URL=https://yasrise.run`
- **Local** `.env.local` — dev values, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

## Tables at a glance

| Table | Job |
|---|---|
| `profiles` | one row per member (from Strava login) |
| `strava_tokens` | server-only vault for Strava API tokens |
| `admins` | max 3 seats; email label + linked Strava athlete ID |
| `events` | the events (source of truth, replaced MDX) |
| `event_checkin_tokens` | QR secrets per event (never client-readable) |
| `event_attendance` | who checked in where (one per member per event) |
| `score_actions` | the admin-editable points menu |
| `score_entries` | append-only points ledger; score = sum |

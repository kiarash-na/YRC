# Stack upgrade + security hardening (2026-11-13)

- Upgraded: Next 16.3.5→16.4.6, React 19.3.1, tailwind 4.3.5, supabase-js 2.119.0. Deliberately held: typescript 5.9.3, eslint 9.39.5 (plugin compat).
- `src/lib/safe-next.ts` — `safeNext()` hardened against backslash open redirects (`\\evil.com` / `/%5c` treated as external → "/").
- `src/app/(auth)/auth/callback/strava/route.ts` — Strava OAuth callback now calls `verifyOtp` in-handler; no more bearer `token_hash` in redirect URLs.
- `src/lib/actions/auth-email.ts` — email redirect origin validated against a host allow-list (no raw Host-header trust).
- `next.config.ts` — security headers added; HSTS is production-only.
- `supabase/migrations/0005_protect_profile_strava_link.sql` — `profiles.strava_athlete_id` writable only by service_role (column grants revoked from authenticated/anon + BEFORE UPDATE trigger). APPLIED to prod and verified.

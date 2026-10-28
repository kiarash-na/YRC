# Handoff — HTTPS local dev + email system E2E (2026-10-28)

## What was done

- **HTTPS local dev**: self-signed cert generated with openssl into `certificates/` (gitignored). `pnpm dev:https` now serves **https://localhost:3001** (fixed port typo in the script: was `30012`). `.env.local` `NEXT_PUBLIC_SITE_URL` updated to `https://localhost:3001` (gitignored, not committed).
- **Resend domain verified**: `mail.yasrise.run` was stuck at `not_started` although all 4 DNS records were already live. Triggered `POST /domains/{id}/verify` via Resend API → all records (DKIM TXT, SPF MX, SPF TXT, CNAME) now **verified**.
- **Resend direct send works**: API test email from `YRC <login@mail.yasrise.run>` to the owner's Gmail → **delivered**.
- **Token security E2E (Playwright, headless Chromium) — all passed**:
  - magic-link `token_hash`: 56 chars base64url (~336 bits)
  - `/auth/confirm?token_hash=…` establishes session, lands on `/profile`
  - session grants access to gated route
  - token replay in a fresh browser → **rejected** (one-time use)
  - tampered token → **rejected**
  - open-redirect via `next=https://evil…` → **blocked** (`safeNext`)
- **AGENTS.md** updated: HTTPS localhost:3001, production yasrise.run on Vercel via GitHub, workspace path corrected.
- **Cookie hardening (INCOMPLETE — see below)**: added `cookieOptions: { secure: true }` to `src/lib/supabase/server.ts`, `src/proxy.ts`, `src/lib/supabase/client.ts`.

## Open issues / next steps

1. **`Secure` cookie flag not taking effect**: raw `Set-Cookie` from `/auth/confirm` still shows `Path=/; Max-Age=34560000; SameSite=lax` with **no `Secure`**, despite `cookieOptions: { secure: true }`. Investigation was cut off mid-way — next step: read `applyServerStorage` in `node_modules/@supabase/ssr/dist/main/cookies.js` (v0.12.7) to see how set-cookie options flow; possibly the dev server needed a restart, or this ssr version threads options differently. Verify with: `curl -sk -D- "https://localhost:3001/auth/confirm?token_hash=<fresh>&type=magiclink" -o /dev/null | grep -i set-cookie`. Note `httpOnly=false` is by design in @supabase/ssr (browser client reads the session cookie).
2. **Supabase magic-link send is rate-limited**: `signInWithOtp` returns "email rate limit exceeded" after repeated test attempts. Wait for the window to clear (~1h from ~16:30 UTC), then re-run `/tmp/pw-test/e2e-email.mjs` to confirm the full chain: form → Supabase Auth → Resend SMTP → Gmail inbox. No Supabase-originated email has reached the Resend log yet.
3. **Supabase redirect URLs**: confirm `https://localhost:3001/auth/confirm` is allow-listed in Supabase Auth settings (token-flow test passed, so likely fine).

## Test tooling (not in repo)

- Playwright 1.64.0-alpha installed offline from npm cache into `/tmp/pw-test/` (npm registry unreachable from this machine; GitHub/Resend/DNS reachable).
- Scripts: `/tmp/pw-test/e2e-email.mjs` (form submit E2E), `/tmp/pw-test/e2e-token.mjs` (token security suite). Both read `.env.local` for Supabase service-role admin calls.
- Chromium binary reused from `~/.cache/ms-playwright/chromium-1243` via explicit `executablePath`.
- Resend API key used for testing is in the shell history of this session only — **not committed**; it should be rotated if this session log is shared.

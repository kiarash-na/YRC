<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Dev environment

Push to `Devp` branch → Dokploy auto-builds the Dockerfile (app `yrc-preview`) → live preview at https://yrc-dev.kiarash.online in ~1 min. `main` → Vercel production. ImageKit env var (`NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`) is configured in Dokploy, never commit it. Plain `Dockerfile` is ignored by Vercel; never create `Dockerfile.vercel`.

## Images (ImageKit)

- Always use `Image`/`Video` from `@/components/imagekit` for ImageKit-hosted assets (drop-in replacements for `next/image` / `<video>`). Never raw `<img>`/`<video>`.
- `urlEndpoint` comes from the provider in the root layout; never pass it per-component unless overriding.
- Keep `responsive` at its default `true` so srcset is auto-generated. Always set explicit `width`/`height` (or `fill`) to prevent CLS.
- Lazy loading is the default; use `loading="eager"` or `priority` only for above-the-fold/LCP images.
- For hero/LCP images use the official LQIP pattern: `buildSrc` with `transformation: [{ quality: 10, blur: 90 }]` as a background-image placeholder, cleared in `onLoad`.
- Never hardcode output format (`f-*`) or quality: automatic format conversion (AVIF/WebP via Accept header) and default quality 80 are already optimal per ImageKit docs. Use `transformation` only for sizing/cropping.
- No query strings in `src`; use the `queryParameters` prop. `src` is a relative path against the urlEndpoint.
- Videos: `preload="none"` + an `ik-thumbnail.jpg` poster via `buildSrc`.

# YRC — Yas Rise Company

## Project

YRC is the Yas Rise running/community website.

Current environment:
- Local workspace: /opt/data/workspace/yrc/
- Dev website: https://yrc-dev.kiarash.online/
- Production website: https://yasrise.run/
- Framework: Next.js
- UI: shadcn/ui + Tailwind
- External media: ImageKit

## Members, scoring & auth (Supabase + Strava)

- **Route groups**: `(marketing)` = public site (Navbar/Footer/Tally live in its layout); `(auth)` = login, `/profile`, `/checkin/[token]`; `(admin)` = `/admin/*`. Root layout keeps only html/body/font/ImageKit.
- **Auth**: Strava OAuth (scope `read`) is the primary login — `/auth/strava` → `/auth/callback/strava` → `/auth/confirm`. Email magic-link login (`signInWithOtp`, PKCE) is the secondary method; both paths land on `/auth/confirm` (handles `code` exchange and `token_hash` verify). Strava never returns an email, so Strava auth users get a synthetic `strava-<athlete_id>@strava.yasrise.run` email. Every new auth user gets a blank `profiles` row via the `on_auth_user_created` trigger. Session refresh + route gating happen in `src/proxy.ts` (Next 16 renamed middleware → proxy). Transactional email (magic links) goes through Resend SMTP configured in Supabase Auth.
- **Database**: Supabase, 8 tables (see `supabase/README.md`). Events live in the DB (MDX events retired; blog stays MDX). Check-ins go ONLY through the `check_in_with_token` RPC; points are an append-only ledger (`score_entries`) priced by the admin-editable `score_actions` table.
- **Admins**: `admins` table (max 3, DB-trigger enforced), matched by linked `strava_athlete_id` OR by seat email == the member's auth email (so a magic-link login with the seat's email is instantly admin). Admin pages/actions use `requireAdmin()` from `src/lib/admin.ts`.
- **Supabase clients**: `src/lib/supabase/{client,server,admin,public}.ts` — `admin.ts` is the service role (server-only, bypasses RLS); never import it from client components.
- **Secrets**: never commit real env values or personal emails — this repo is public. `.env.example` lists every variable.

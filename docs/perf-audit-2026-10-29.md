# YRC Performance Audit — 2026-10-29 (read-only)

Audited against bundled Next.js 16.3.5 docs (`node_modules/next/dist/docs/`). `cacheComponents` is NOT enabled, so the classic caching model applies: `fetch` uncached by default, `export const dynamic`/`revalidate` still valid. For dynamic routes, Link only prefetches down to the nearest `loading.js` boundary. Verified in auth-js source: `getUser()` with no session cookie returns locally (no network call).

## Findings

| File:line | Issue | Severity | Impact |
|---|---|---|---|
| `(marketing)/page.tsx:11`, `events/page.tsx:21`, `events/all/page.tsx:13`, `events/past/page.tsx:13`, `events/[slug]/page.tsx:15` | `force-dynamic` on all 5 event-driven public pages; data uses only the cookie-less public client — nothing needs per-request rendering. `events/[slug]` also re-compiles MDX per request. No Full Route Cache / CDN. | **High** | ~300ms–1s+ TTFB on every visit instead of ~50ms from CDN |
| `src/lib/events-db.ts:26-27, 46-54` | `fetchEvents()` selects ALL rows incl. full MDX `body` (up to 100k chars) for every caller; home keeps 1, events page keeps 3. Weekly auto-duplication grows the table ~52 rows/yr per recurring event. | **High** | Wasted transfer on most-visited pages; degrades as table grows. Fix: `.eq("is_past", …)` + summary SELECT without `body` |
| `src/lib/actions/admin.ts:20-25` | `revalidateEventPaths()` omits `/events/past` and `/`. Masked by `force-dynamic`; becomes a stale-content bug once ISR is adopted. | Medium | Stale pages after ISR migration |
| `events/[slug]/page.tsx:23, 41` | `getEventBySlug(slug)` runs twice per request (generateMetadata + page). Fix: React `cache()`. | Medium | Extra DB round trip per event page |
| `src/lib/admin.ts:20-53` + `(admin)/layout.tsx:19` + admin pages | `requireAdmin()` runs in layout AND each page: 2× getUser + 2× profiles + 2× admins queries. Fix: React `cache()`. | Medium | Doubled auth latency on admin nav |
| (no file) | Zero `loading.tsx` in `src/app` — no prefetch boundary, blank waits on client navigation. | Medium | Navigations feel slow on bad connections |
| `hero.tsx:1`, `about-hero.tsx:1`, `events-hero.tsx:1`, `community-hero.tsx:1`, `blog52.tsx:1` | Entire heroes are `"use client"` only for the LQIP onLoad clear; `cover-image.tsx` already encapsulates that pattern. | Medium | ~200-line hero ships as client JS on every marketing page |
| `navbar.tsx:3` | Imports `motion/react` (~50KB gzip) for one menu fade — only motion usage in the app; loaded on every public page. | Medium | Animation runtime on every page, worst on mobile TTI |
| `footer.tsx:70-75`, `hero.tsx:135`, `upcoming-event.tsx:72` | Internal links as plain `<a href>` (footer nav, hero CTA, "View event"). | Low | Full reloads, lose prefetch |
| `src/proxy.ts:55` | `getUser()` per matched request. Anonymous visitors pay nothing (verified local early return); signed-in members pay 1 auth round trip per navigation + per RSC prefetch. `getClaims()` only safe with asymmetric signing keys. | Low | Latency for logged-in members only |
| `admin/page.tsx:21`, `admin/events/page.tsx:15` | Unbounded full-table selects aggregated in JS (score_entries SUM, event_attendance counts). Use DB aggregation. | Low | Admin slows as ledger grows |
| `next.config.ts:8-13` | Dead `remotePatterns` entry (shadcn placeholder CDN, unused). | Low | Hygiene |
| `who-is-yrc-for.tsx:120` | `sizes="100vw"` but renders in `max-w-3xl`. | Low | Mobile over-fetches image |
| `events-browser.tsx:34` | `new Date()` during render — hydration mismatch risk at UTC midnight boundary. | Low | Rare flicker |
| `blog56.tsx:59-64` | Newsletter form discards the email (no backend). | Low | Dead-end interaction shipped as JS |
| `(auth)/login/page.tsx:45` | Second `getUser()` right after the proxy's identical call. | Low | 2 auth round trips on login page |

## Quick wins (safe, independent)

1. Wrap `getEventBySlug` + `requireAdmin` (and login-page `getUser`) in React `cache()` — kills duplicate queries immediately.
2. Extend `revalidateEventPaths()` with `/events/past` and `/` — needed regardless.
3. Slim events queries: filter `is_past` in PostgREST, summary SELECT without `body` for list pages.
4. Add `loading.tsx` to `(marketing)` (and optionally `(auth)`).
5. Swap plain `<a>` internal links to `next/link` (footer, hero CTA, upcoming-event).
6. Fix `sizes` in `who-is-yrc-for.tsx:120`.
7. Admin aggregations via DB counts/sums instead of full-table selects.
8. Delete dead `remotePatterns` entry.

## Riskier changes (need testing)

1. **ISR conversion of the 5 `force-dynamic` pages** — biggest payoff. Must be a bundle: `export const revalidate = 900` (matches the 15-min pg_cron cadence, since the cron flips `is_past` and auto-duplicates with NO app-side revalidation), PLUS revalidatePath coverage fix, PLUS removing `force-dynamic`. Accepted tradeoff: ≤15 min staleness for cron-driven changes; admin edits stay instant via on-demand revalidation.
2. **De-client-ing heroes** — extend `CoverImage` with transformation/queryParameters props; visual regression checks on LQIP.
3. **Replace `motion` in navbar** with CSS transitions — visual parity risk.
4. **`getClaims()` in proxy.ts** — only with asymmetric JWT signing keys enabled on the Supabase project; otherwise keep `getUser()` (correct today).

## Already GOOD

- Image discipline exemplary: `@/components/imagekit` everywhere, no raw `<img>`, `fill`+`sizes` (no CLS), `priority` on LCP heroes, official LQIP pattern, `queryParameters` prop, video `preload="none"` + poster.
- Journal fully static (`generateStaticParams` + `dynamicParams = false`, MDX at build).
- Self-hosted Poppins via `next/font`, `display: swap`.
- Correct `Promise.all` parallelism in profile/admin pages.
- Proxy: matcher excludes static assets, anonymous traffic pays no auth call, secure cookies, open-redirect protection.
- Server actions re-verify admin; check-ins only via RPC; forms work without JS.
- Config: `reactCompiler: true`, `output: standalone`, Tally via `afterInteractive` script.
- `EventsBrowser` correctly client-side with slim summaries.

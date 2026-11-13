# 10-day roadmap (events briefs, RSVP+.ics, Strides leaderboard, newsletter, video hero, about)

Plan file: ~/.claude/plans/pasted-content-id-7f3c-yrc-munich-ancient-hare.md (approved).

- [x] T1 migration 0007 (brief columns, 9 categories, cron carries brief) — applied+verified on prod
- [x] 0008 (event_rsvps, newsletter_subscribers, leaderboard RPCs, opt-out, gamification seeds+backfill) — applied+verified on prod
- [x] T2 data plumbing (events-db FULL select, EventItem fields, admin form fieldset, category labels)
- [x] T3 event-brief panel + /events/[slug]/calendar.ics route (src/lib/ics.ts, VTIMEZONE Berlin, 29 ICS assertions)
- [x] T4 RSVP flow: rsvp.ts + event-rsvp.tsx + event page slot (auto .ics download on success)
- [x] T5 leaderboard: strides-leaderboard.tsx on /community (revalidate 300, yrc-points.tsx deleted), strides-strip.tsx on homepage, settings opt-out toggle, award hooks (strava callback, updateProfile)
- [x] T6 newsletter action + blog56.tsx wired (honeypot, idempotent, +1 pt when email matches a profile)
- [x] T7 hero video card (/YRC/13372516_1080_1920_30fps.mp4, ik-thumbnail poster, autoplay muted loop)
- [x] T8/T9 about structure + services definition — TODO(user) placeholders await real copy
- [x] T10 seed.sql parity + regression (build/lint green, curl smoke matrix passed, DB contract verified)
- [ ] Pending USER: about/services/founder/shapers copy; hero clip final pick OK'd; optional 2nd video tile on /community

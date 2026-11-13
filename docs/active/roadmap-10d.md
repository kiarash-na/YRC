# 10-day roadmap (events briefs, RSVP+.ics, Strides leaderboard, newsletter, video hero, about)

Plan file: ~/.claude/plans/pasted-content-id-7f3c-yrc-munich-ancient-hare.md (approved).

- [x] T1 migration 0007 (brief columns, 9 categories, cron carries brief) — applied+verified on prod
- [x] 0008 (event_rsvps, newsletter_subscribers, leaderboard RPCs, opt-out, gamification seeds+backfill) — applied+verified on prod
- [ ] T2 data plumbing (events-db FULL select, EventItem fields, admin form fieldset, category labels) — agent briefed
- [ ] T3 event-brief panel + /events/[slug]/calendar.ics route (src/lib/ics.ts, VTIMEZONE Berlin)
- [ ] T4 RSVP flow: src/lib/actions/rsvp.ts + event-rsvp.tsx + event page slot
- [ ] T5 leaderboard UI: strides-leaderboard.tsx on /community (revalidate 300, replace yrc-points.tsx), strides-strip.tsx on homepage between WeeklyStrip and UpcomingEvent, settings toggle, award hooks (strava callback, updateProfile)
- [ ] T6 newsletter action + wire blog56.tsx
- [ ] T7 hero video (probe 4 provided clips, pick 9:16 ≤1080p; videoPoster() ik-thumbnail pattern; autoplay muted loop)
- [ ] T8/T9 about structure + services definition (TODO(user) placeholders)
- [ ] T10 backfill polish + seed.sql parity + full e2e + docs

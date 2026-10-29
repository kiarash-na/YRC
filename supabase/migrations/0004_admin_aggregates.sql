-- ============================================================================
-- 0004_admin_aggregates.sql — DB-side aggregates for admin pages
--
-- Replaces full-table selects summed/counted in JS (score_entries is an
-- append-only ledger that grows forever). Run after 0003_event_lifecycle.sql.
-- ============================================================================

-- total points across the community (admin overview card)
create or replace view public.community_score_total
with (security_invoker = true) as
select coalesce(sum(points), 0)::integer as total_points
from public.score_entries;

-- per-event check-in counts (admin events list)
create or replace view public.event_attendance_counts
with (security_invoker = true) as
select event_id, count(*)::integer as attendee_count
from public.event_attendance
group by event_id;

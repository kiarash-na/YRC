import { describe, expect, it, vi } from "vitest";

import { weekLabel, weekOfMonth, type EventSummary } from "@/lib/content-shared";

vi.mock("@/lib/supabase/public", () => ({ createPublicClient: () => ({}) }));
const { splitWeekly } = await import("@/lib/events-db");

const ev = (slug: string, date: string, seriesSlug?: string): EventSummary =>
  ({
    id: slug,
    slug,
    date,
    title: slug,
    recurrence: seriesSlug ? "weekly" : null,
    seriesSlug,
  }) as EventSummary;

describe("week labels", () => {
  it("numbers the weeks of the month from the day", () => {
    expect(weekOfMonth("2026-11-24")).toEqual({ month: "Nov", week: 4 });
    expect(weekLabel("2026-12-01")).toBe("Dec · Week 1");
    expect(weekOfMonth("2026-12-29").week).toBe(5);
    expect(weekOfMonth("2026-12-07").week).toBe(1);
    expect(weekOfMonth("2026-12-08").week).toBe(2);
  });
});

describe("splitWeekly", () => {
  it("keeps one-off events and folds each series into its soonest date", () => {
    const { oneOff, weekly } = splitWeekly([
      ev("loop-20261124", "2026-11-24", "loop"),
      ev("run", "2026-11-28"),
      ev("loop-20261201", "2026-12-01", "loop"),
      ev("trail", "2026-12-05"),
      ev("loop-20261208", "2026-12-08", "loop"),
    ]);
    expect(oneOff.map((e) => e.slug)).toEqual(["run", "trail"]);
    expect(weekly).toHaveLength(1);
    expect(weekly[0].slug).toBe("loop-20261124");
    expect(weekly[0].dates.map((d) => d.slug)).toEqual(["loop-20261124", "loop-20261201", "loop-20261208"]);
  });

  it("caps a series at six dates", () => {
    const dates = Array.from({ length: 8 }, (_, i) => ev(`l-${i}`, `2026-12-0${i + 1}`, "l"));
    expect(splitWeekly(dates).weekly[0].dates).toHaveLength(6);
  });
});

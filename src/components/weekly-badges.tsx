import { Repeat } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatWeekday, weekOfMonth } from "@/lib/content-shared";

/*
 * The visual language of weekly (recurring) events, shared by cards, the
 * events page, the home strip and the event page:
 *
 *   WeekTag      — on the image: "Nov · Week 4", which week of the month
 *                  this date is (each weekly date looks alike otherwise).
 *   WeeklyBadge  — next to the category: a yellow "Every Tuesday" pill with
 *                  a repeat icon, so a weekly run never reads as a one-off.
 */

export function WeekTag({ date, className }: { date: string; className?: string }) {
  const { month, week } = weekOfMonth(date);
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-[0.6875rem] leading-none font-bold tracking-[0.16em] text-white uppercase backdrop-blur-sm",
        className,
      )}
    >
      {month}
      <span className="size-1 rounded-full bg-yrc-accent" aria-hidden="true" />
      Week {week}
    </span>
  );
}

export function WeeklyBadge({ date, className }: { date: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full bg-yrc-accent px-3 text-caption font-bold tracking-[0.14em] text-yrc-accent-foreground uppercase",
        className,
      )}
    >
      <Repeat className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
      Every {formatWeekday(date)}
    </span>
  );
}

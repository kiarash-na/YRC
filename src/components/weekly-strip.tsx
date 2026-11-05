import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";

import { formatWeekday, type EventSummary } from "@/lib/content-shared";

interface WeeklyStripProps {
  /** Upcoming occurrence of each weekly recurring series, soonest first. */
  events: EventSummary[];
  className?: string;
}

/**
 * Slim homepage band under the hero listing the weekly recurring runs
 * ("Every Thursday — Loop of Love …"). This is the ONLY public surface that
 * mentions recurrence — event pages and cards deliberately stay date-only.
 */
const WeeklyStrip = ({ events, className }: WeeklyStripProps) => {
  if (events.length === 0) return null;

  return (
    <section
      className={cn(
        "border-y border-border bg-muted/40 py-10 md:py-14",
        className,
      )}
    >
      <div className="container">
        <h2 className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
          Every week
        </h2>

        <ul className="mt-6 flex flex-col divide-y divide-border md:mt-8">
          {events.map((event) => (
            <li key={event.slug}>
              <Link
                href={`/events/${event.slug}`}
                className="group flex flex-col gap-2 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="text-h4 font-semibold transition-colors group-hover:text-yrc-accent md:text-h3">
                  Every {formatWeekday(event.date)} — {event.title}
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  <span className="text-body-small font-semibold text-muted-foreground uppercase">
                    {event.city}
                  </span>
                  <span className="text-caption flex items-center gap-1.5 font-bold tracking-[0.2em] text-yrc-accent uppercase">
                    View event
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export { WeeklyStrip };

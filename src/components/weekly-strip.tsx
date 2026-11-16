import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";

import { Reveal } from "@/components/reveal";
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
        // Dark band: continues straight out of the (dark) home hero.
        "dark border-b border-border bg-background py-14 text-foreground md:py-20",
        className,
      )}
    >
      <div className="container grid gap-8 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-3">
          <h2 className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Every week
          </h2>
        </Reveal>

        <ul className="flex flex-col border-t border-border md:col-span-9">
          {events.map((event, index) => (
            <li key={event.slug} className="border-b border-border">
              <Reveal delay={index * 100}>
                <Link
                  href={`/events/${event.slug}`}
                  className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 md:py-8"
                >
                  <span className="text-h4 font-semibold transition-colors group-hover:text-yrc-accent md:text-h3 lg:text-h2">
                    Every {formatWeekday(event.date)} — {event.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-5">
                    <span className="text-body-small font-semibold text-muted-foreground uppercase">
                      {event.city}
                    </span>
                    <span className="text-caption flex items-center gap-1.5 font-bold tracking-[0.2em] text-yrc-accent uppercase">
                      View event
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export { WeeklyStrip };

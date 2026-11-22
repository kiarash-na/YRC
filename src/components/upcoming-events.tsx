import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { EventCard } from "@/components/event-card";
import { EventsTabs } from "@/components/events-tabs";
import { WeeklySeriesCard } from "@/components/weekly-series-card";
import type { EventSummary, SeriesDate } from "@/lib/content-shared";
import { Reveal } from "@/components/reveal";

interface UpcomingEventsProps {
  /** One-off events (the first few). */
  events: EventSummary[];
  /** Weekly series: their soonest date plus every open date. */
  weekly?: (EventSummary & { dates: SeriesDate[] })[];
  className?: string;
}

const UpcomingEvents = ({ events, weekly = [], className }: UpcomingEventsProps) => {
  const grid = (
<Reveal className="yrc-stagger flex flex-wrap justify-center gap-6">
          {events.map((event) => (
            <EventCard
              key={event.slug}
              event={event}
              className="sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
            />
          ))}

          <Link
            href="/events/all"
            className="group flex w-full flex-col items-center justify-center gap-5 rounded-xl border border-border bg-primary p-8 text-center text-primary-foreground transition-opacity hover:opacity-90 sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
          >
            <p className="text-caption font-bold tracking-[0.3em] uppercase opacity-70">
              Full calendar
            </p>
            <p className="text-h3 md:text-h2">See all events</p>
            <span className="inline-flex items-center gap-2 font-medium underline underline-offset-4">
              Browse upcoming and past events
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/events/past"
            className="group flex w-full flex-col items-center justify-center gap-5 rounded-xl border border-border bg-muted/50 p-8 text-center transition-colors hover:bg-muted sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
          >
            <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
              Archive
            </p>
            <p className="text-h3 md:text-h2">Past events</p>
            <span className="inline-flex items-center gap-2 font-medium underline underline-offset-4">
              Where we&apos;ve been
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </Reveal>
  );

  return (
    <section id="upcoming-events" className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Calendar
          </p>
          <h2 className="text-h2 md:text-h1">Upcoming Events</h2>
          <p className="text-body-small text-muted-foreground md:text-body">
            Find your next run, challenge or shared experience.
          </p>
        </div>

        {weekly.length > 0 ? (
          <EventsTabs
            oneOffCount={events.length}
            weeklyCount={weekly.length}
            oneOff={grid}
            weekly={
              <div className="flex flex-col gap-8">
                <p className="max-w-2xl text-body-small text-muted-foreground md:text-body">
                  Runs that happen every week, same place, same time. Registration is open
                  for the next six weeks: pick the dates that suit you.
                </p>
                {weekly.map((series) => (
                  <WeeklySeriesCard key={series.slug} event={series} dates={series.dates} />
                ))}
              </div>
            }
          />
        ) : (
          <div className="mt-14 md:mt-20">{grid}</div>
        )}
      </div>
    </section>
  );
};

export { UpcomingEvents };

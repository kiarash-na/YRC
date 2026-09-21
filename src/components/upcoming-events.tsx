import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

import { EventCard } from "@/components/event-card";
import type { EventSummary } from "@/lib/content";

interface UpcomingEventsProps {
  events: EventSummary[];
  className?: string;
}

const UpcomingEvents = ({ events, className }: UpcomingEventsProps) => {
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

        <div className="mt-14 flex flex-wrap justify-center gap-6 md:mt-20">
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
        </div>
      </div>
    </section>
  );
};

export { UpcomingEvents };

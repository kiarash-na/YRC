import { cn } from "cn";

import { EventCard } from "@/components/event-card";
import type { YrcEvent } from "@/data/events";

interface UpcomingEventsProps {
  events: YrcEvent[];
  className?: string;
}

const UpcomingEvents = ({ events, className }: UpcomingEventsProps) => {
  return (
    <section id="upcoming-events" className={cn("py-32", className)}>
      <div className="container">
        <div className="mb-9 flex max-w-3xl flex-col gap-5 lg:mb-14">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Calendar
          </p>
          <h2 className="text-h2 md:text-h1">Upcoming Events</h2>
          <p className="text-body-small text-muted-foreground md:text-body">
            Find your next run, challenge or shared experience.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {events.map((event) => (
            <EventCard
              key={event.title}
              event={event}
              className="sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { UpcomingEvents };

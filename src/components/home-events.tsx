import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { EventCard } from "@/components/event-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import type { EventSummary } from "@/lib/content-shared";

interface HomeEventsProps {
  events: EventSummary[];
  className?: string;
}

/**
 * Home page closer before the newsletter: the next few events as cards,
 * with a See all events CTA (top right on desktop, under the grid on phones).
 */
const HomeEvents = ({ events, className }: HomeEventsProps) => {
  const seeAll = (extra?: string) => (
    <Button
      size="lg"
      variant="outline"
      className={cn("h-12 gap-2 px-7 tracking-wider uppercase", extra)}
      render={<Link href="/events/all" />}
      nativeButton={false}
    >
      See all events
      <ArrowRight className="transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden="true" />
    </Button>
  );

  return (
    <section id="home-events" className={cn("pt-24 md:pt-32", className)}>
      <div className="container">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-5">
            <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
              Calendar
            </p>
            <h2 className="text-h2 md:text-h1">Upcoming events</h2>
            <p className="text-body-small text-muted-foreground md:text-body">
              Find your next run, challenge or shared experience.
            </p>
          </div>
          {seeAll("hidden md:inline-flex")}
        </Reveal>

        <Reveal className="yrc-stagger mt-12 grid gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </Reveal>

        {seeAll("mt-10 w-full md:hidden")}
      </div>
    </section>
  );
};

export { HomeEvents };

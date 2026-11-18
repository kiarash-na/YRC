import { ViewTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventSecondaryActions } from "@/components/event-actions";
import { Reveal } from "@/components/reveal";
import { EVENT_CATEGORY_LABELS, formatDate, type EventSummary } from "@/lib/content-shared";

interface UpcomingEventProps {
  event: EventSummary;
  className?: string;
}

/** Home page "next on the calendar" highlight — fed from the events table. */
const UpcomingEvent = ({ event, className }: UpcomingEventProps) => {
  const dateLabel = event.endDate
    ? `${formatDate(event.date)} – ${formatDate(event.endDate)}`
    : formatDate(event.date);

  return (
    <section className={cn("py-24 md:py-32", className)}>
      <div className="container">
        <Reveal className="flex flex-col gap-7">
          <p className="flex items-center gap-3 text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            <span className="yrc-live-dot" aria-hidden="true" />
            Upcoming Event
          </p>
          <h2 className="text-h2 md:text-h1">Next on the calendar</h2>
        </Reveal>

        <Reveal delay={120} className="mt-14 md:mt-20">
          <div className="group grid gap-8 lg:grid-cols-12 lg:gap-16">
            <ViewTransition name={`event-cover-${event.slug}`} share="yrc-morph" default="none">
              <Link
                href={`/events/${event.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                className="relative block aspect-4/3 w-full overflow-hidden rounded-xl border bg-muted lg:col-span-7"
              >
                <Image
                  src={event.cover}
                  alt={event.title}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  transformation={[
                    { aspectRatio: "4-3", crop: "maintain_ratio", focus: "auto" },
                  ]}
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
            </ViewTransition>

            <div className="flex flex-col gap-6 lg:col-span-5 lg:py-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className="h-6 px-3 text-caption font-bold tracking-[0.2em] uppercase"
                >
                  {EVENT_CATEGORY_LABELS[event.category] ?? event.category}
                </Badge>
                <p className="text-caption font-medium tracking-[0.3em] text-muted-foreground uppercase">
                  {dateLabel}
                </p>
              </div>

              <h3 className="text-h2 md:text-h1">
                <Link
                  href={`/events/${event.slug}`}
                  className="transition-colors hover:text-foreground/75"
                >
                  {event.title}
                </Link>
              </h3>

              <p className="text-body-small font-semibold uppercase">
                {event.location} · {event.city}
              </p>

              <p className="text-body text-muted-foreground">
                {event.excerpt}
              </p>

              <EventSecondaryActions
                slug={event.slug}
                registrationUrl={event.registrationUrl}
                compact
              />

              <div className="mt-auto border-t border-border pt-6">
                <Button
                  size="lg"
                  className="h-11 w-full px-6 tracking-wider uppercase sm:w-auto"
                  render={<Link href={`/events/${event.slug}`} />}
                  nativeButton={false}
                >
                  Event details
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export { UpcomingEvent };

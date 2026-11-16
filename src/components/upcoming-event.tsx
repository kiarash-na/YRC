import Link from "next/link";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Upcoming Event
          </p>
          <h2 className="text-h2 md:text-h1">Next on the calendar</h2>
        </Reveal>

        <Reveal delay={120} className="mt-14 md:mt-20">
          <Link
            href={`/events/${event.slug}`}
            className="group grid gap-8 lg:grid-cols-12 lg:gap-16"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border bg-muted lg:col-span-7">
              <Image
                src={event.cover}
                alt={event.title}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                transformation={[
                  { aspectRatio: "4-3", crop: "force", focus: "auto" },
                ]}
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>

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

              <h3 className="text-h2 transition-colors group-hover:text-foreground/80 md:text-h1">
                {event.title}
              </h3>

              <p className="text-body-small font-semibold uppercase">
                {event.location} · {event.city}
              </p>

              <p className="text-body text-muted-foreground">
                {event.excerpt}
              </p>

              <div className="mt-auto border-t border-border pt-6">
                <span
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 w-full px-6 tracking-wider uppercase sm:w-auto",
                  )}
                >
                  View event
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export { UpcomingEvent };

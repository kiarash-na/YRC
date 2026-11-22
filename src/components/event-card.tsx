import { ViewTransition } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Image } from "@/components/imagekit";
import { EventSecondaryActions } from "@/components/event-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeekTag, WeeklyBadge } from "@/components/weekly-badges";
import { EVENT_CATEGORY_LABELS, formatDate, type EventSummary } from "@/lib/content-shared";

interface EventCardProps {
  event: EventSummary;
  className?: string;
}

const EventCard = ({ event, className }: EventCardProps) => {
  const weekly = event.recurrence === "weekly" || Boolean(event.seriesSlug);
  const dateLabel = event.endDate
    ? `${formatDate(event.date)} – ${formatDate(event.endDate)}`
    : formatDate(event.date);

  return (
    <article
      className={cn(
        "yrc-lift group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background",
        className,
      )}
    >
      {/* Same name as the event page cover: the image morphs into it. */}
      <ViewTransition name={`event-cover-${event.slug}`} share="yrc-morph" default="none">
        <Link
          href={`/events/${event.slug}`}
          className="relative block aspect-4/3 overflow-hidden bg-muted"
        >
          {weekly && <WeekTag date={event.date} />}
          <Image
            src={event.cover}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
      </ViewTransition>

      <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className="h-6 px-3 text-caption font-bold tracking-[0.2em] uppercase"
          >
            {EVENT_CATEGORY_LABELS[event.category] ?? event.category}
          </Badge>
          {weekly && <WeeklyBadge date={event.date} />}
          <p className="text-caption font-medium tracking-[0.3em] text-muted-foreground uppercase">
            {dateLabel}
          </p>
        </div>

        <h3 className="text-h4 md:text-h3">
          <Link href={`/events/${event.slug}`} className="transition-colors hover:text-foreground/75">
            {event.title}
          </Link>
        </h3>

        <p className="text-body-small font-semibold uppercase">
          {event.location} · {event.city}
        </p>

        <p className="text-body-small text-muted-foreground">
          {event.excerpt}
        </p>

        <EventSecondaryActions
          slug={event.slug}
          registrationUrl={event.registrationUrl}
          isPast={event.isPast}
          compact
        />

        <div className="mt-auto pt-2">
          <Button
            size="lg"
            className="h-11 w-full tracking-wider uppercase"
            render={
              <Link href={`/events/${event.slug}`} />
            }
            nativeButton={false}
          >
            Event details
            <ArrowRight className="transition-transform duration-500 ease-out group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </article>
  );
};

export { EventCard };

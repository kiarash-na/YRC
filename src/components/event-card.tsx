import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/content-shared";
import type { EventSummary } from "@/lib/content";

interface EventCardProps {
  event: EventSummary;
  className?: string;
}

const EventCard = ({ event, className }: EventCardProps) => {
  const dateLabel = event.endDate
    ? `${formatDate(event.date)} – ${formatDate(event.endDate)}`
    : formatDate(event.date);

  return (
    <article
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background",
        className,
      )}
    >
      <Link
        href={`/events/${event.slug}`}
        className="relative block aspect-4/3 overflow-hidden bg-muted"
      >
        <Image
          src={event.cover}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className="h-6 px-3 text-caption font-bold tracking-[0.2em] uppercase"
          >
            {event.category}
          </Badge>
          <p className="text-caption font-medium tracking-[0.3em] text-muted-foreground uppercase">
            {dateLabel}
          </p>
        </div>

        <h3 className="text-h4 md:text-h3">{event.title}</h3>

        <p className="text-body-small font-semibold uppercase">
          {event.location} · {event.city}
        </p>

        <p className="text-body-small text-muted-foreground">
          {event.excerpt}
        </p>

        <Link
          href={`/events/${event.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-1 pt-2 font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
        >
          View event <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
};

export { EventCard };

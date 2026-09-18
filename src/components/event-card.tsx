import { ArrowRight } from "lucide-react";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import type { YrcEvent } from "@/data/events";

interface EventCardProps {
  event: YrcEvent;
  className?: string;
}

const EventCard = ({ event, className }: EventCardProps) => {
  return (
    <article
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background",
        className,
      )}
    >
      <a
        href={event.href}
        className="relative block aspect-4/3 overflow-hidden bg-muted"
      >
        <Image
          src={event.image.src}
          alt={event.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          queryParameters={{ updatedAt: event.image.updatedAt }}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </a>

      <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className="h-6 px-3 text-caption font-bold tracking-[0.2em] text-yrc-accent uppercase"
          >
            {event.category}
          </Badge>
          <p className="text-caption font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {event.date} · {event.time}
          </p>
        </div>

        <h3 className="text-h4 md:text-h3">{event.title}</h3>

        <p className="text-body-small font-semibold tracking-[0.15em] uppercase">
          {event.location} · {event.distance} · {event.level}
        </p>

        <p className="text-body-small text-muted-foreground">
          {event.description}
        </p>

        <a
          href={event.href}
          className="mt-auto inline-flex w-fit items-center gap-1 pt-2 font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
        >
          {event.cta} <ArrowRight className="size-4" />
        </a>
      </div>
    </article>
  );
};

export { EventCard };

import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";

import { Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { WeekTag, WeeklyBadge } from "@/components/weekly-badges";
import {
  EVENT_CATEGORY_LABELS,
  formatShortDate,
  formatWeekday,
  weekOfMonth,
  type EventSummary,
  type SeriesDate,
} from "@/lib/content-shared";
import { cn } from "@/lib/utils";

interface WeeklySeriesCardProps {
  /** The series' soonest date (its content stands for the whole series). */
  event: EventSummary;
  /** Every open date of the series, soonest first. */
  dates: SeriesDate[];
  className?: string;
}

/**
 * A weekly run as one wide card: what it is, when it repeats, and every
 * open date as a chip ("Tue, 24 Nov · Week 4") that opens that date's page
 * to register. The soonest date is marked "Next".
 */
export function WeeklySeriesCard({ event, dates, className }: WeeklySeriesCardProps) {
  const weekday = formatWeekday(event.date);
  return (
    <article
      className={cn(
        "yrc-lift group grid overflow-hidden rounded-xl border border-border bg-background md:grid-cols-12",
        className,
      )}
    >
      <ViewTransition name={`event-cover-${event.slug}`} share="yrc-morph" default="none">
        <Link
          href={`/events/${event.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block aspect-4/3 overflow-hidden bg-muted md:col-span-5 md:aspect-auto md:min-h-full"
        >
          <WeekTag date={event.date} />
          <Image
            src={event.cover}
            alt=""
            fill
            sizes="(min-width: 768px) 42vw, 100vw"
            transformation={[{ aspectRatio: "4-3", crop: "maintain_ratio", focus: "auto" }]}
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
      </ViewTransition>

      <div className="flex flex-col gap-5 p-6 md:col-span-7 md:p-9">
        <div className="flex flex-wrap items-center gap-2.5">
          <WeeklyBadge date={event.date} />
          <span className="inline-flex h-6 items-center rounded-full border border-border px-3 text-caption font-bold tracking-[0.2em] uppercase">
            {EVENT_CATEGORY_LABELS[event.category] ?? event.category}
          </span>
        </div>

        <h3 className="text-h3 md:text-h2">
          <Link href={`/events/${event.slug}`} className="transition-colors hover:text-foreground/75">
            {event.title}
          </Link>
        </h3>

        <ul className="flex flex-col gap-2 text-body-small text-muted-foreground">
          <li className="flex items-center gap-2.5">
            <CalendarDays className="size-4 shrink-0 text-foreground" aria-hidden="true" />
            Every {weekday}, repeating weekly
          </li>
          {event.startTime && (
            <li className="flex items-center gap-2.5">
              <Clock className="size-4 shrink-0 text-foreground" aria-hidden="true" />
              {event.startTime}
            </li>
          )}
          <li className="flex items-center gap-2.5">
            <MapPin className="size-4 shrink-0 text-foreground" aria-hidden="true" />
            {event.location} · {event.city}
          </li>
        </ul>

        <p className="text-body-small text-muted-foreground md:text-body">{event.excerpt}</p>

        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <p className="text-caption font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Open for registration · next {dates.length} {dates.length === 1 ? "week" : "weeks"}
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {dates.map((date, index) => (
              <li key={date.id}>
                <Link
                  href={`/events/${date.slug}`}
                  className={cn(
                    "flex h-full flex-col gap-0.5 rounded-lg border px-3 py-2.5 transition-colors hover:border-foreground",
                    index === 0 ? "border-yrc-accent bg-yrc-accent/10" : "border-border",
                  )}
                >
                  <span className="text-body-small font-semibold">{formatShortDate(date.date)}</span>
                  <span className="text-[0.6875rem] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                    {index === 0 ? "Next · " : ""}Week {weekOfMonth(date.date).week}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-1">
          <Button
            size="lg"
            className="h-11 w-full tracking-wider uppercase sm:w-auto sm:px-8"
            render={<Link href={`/events/${event.slug}`} />}
            nativeButton={false}
          >
            Pick a date &amp; register
            <ArrowRight className="transition-transform duration-500 ease-out group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </article>
  );
}

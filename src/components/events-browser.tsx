"use client";

import { Search } from "lucide-react";
import * as React from "react";

import { EventCard } from "@/components/event-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import {
  EVENT_CATEGORIES,
  type EventCategory,
} from "@/lib/content-shared";
import type { EventSummary } from "@/lib/content";

type When = "all" | "upcoming" | "past";

interface EventsBrowserProps {
  events: EventSummary[];
}

const WHEN_OPTIONS: { value: When; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

const EventsBrowser = ({ events }: EventsBrowserProps) => {
  const [when, setWhen] = React.useState<When>("all");
  const [category, setCategory] = React.useState<EventCategory | "all">("all");
  const [city, setCity] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const today = new Date().toISOString().slice(0, 10);
  const cities = React.useMemo(
    () => [...new Set(events.map((event) => event.city))].sort(),
    [events],
  );

  const filtered = events.filter((event) => {
    const isUpcoming = (event.endDate ?? event.date) >= today;
    if (when === "upcoming" && !isUpcoming) return false;
    if (when === "past" && isUpcoming) return false;
    if (category !== "all" && event.category !== category) return false;
    if (city !== "all" && event.city !== city) return false;
    if (query.trim() !== "") {
      const haystack =
        `${event.title} ${event.excerpt} ${event.location} ${event.city}`.toLowerCase();
      if (!haystack.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  });

  const selectClass =
    "h-9 rounded-md border border-border bg-background px-3 text-body-small font-medium uppercase tracking-wide";

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6 md:p-8">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            className="pl-9"
            aria-label="Search events"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-md border border-border">
            {WHEN_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setWhen(option.value)}
                className={cn(
                  "px-4 py-2 text-caption font-bold tracking-[0.2em] uppercase transition-colors",
                  when === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory | "all")}
            className={selectClass}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={selectClass}
            aria-label="Filter by city"
          >
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <Badge
            variant="outline"
            className="h-6 px-3 text-caption font-bold tracking-[0.2em] uppercase"
          >
            {filtered.length} {filtered.length === 1 ? "event" : "events"}
          </Badge>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-6">
          {filtered.map((event) => (
            <EventCard
              key={event.slug}
              event={event}
              className="sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
            />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-body text-muted-foreground">
          No events match these filters — try widening your search.
        </p>
      )}
    </div>
  );
};

export { EventsBrowser };

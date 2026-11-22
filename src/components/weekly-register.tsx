"use client";

import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { EventRegister } from "@/components/event-register";
import { formatShortDate, formatWeekday, weekOfMonth, type SeriesDate } from "@/lib/content-shared";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface WeeklyRegisterProps {
  /** The series' open dates, soonest first. */
  dates: SeriesDate[];
  /** The date whose page this is — selected first. */
  currentId: string;
  title: string;
}

/**
 * Register for a weekly run: pick a date (every open week of the series),
 * then the usual Register button acts on that date. Each date is its own
 * event row, so registration, unregistering, the login round-trip and QR
 * check-in all work per date unchanged. Dates the member already holds a
 * spot on show a tick; they can register for as many weeks as they like.
 */
export function WeeklyRegister({ dates, currentId, title }: WeeklyRegisterProps) {
  const [selectedId, setSelectedId] = useState(
    dates.some((d) => d.id === currentId) ? currentId : dates[0]?.id,
  );
  const [registered, setRegistered] = useState<Set<string>>(new Set());
  const selected = dates.find((d) => d.id === selectedId) ?? dates[0];
  const weekday = formatWeekday(dates[0]?.date ?? "");

  // Which of these dates the signed-in member is already registered for.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      const { data } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("profile_id", session.user.id)
        .in(
          "event_id",
          dates.map((d) => d.id),
        );
      if (!cancelled && data) setRegistered(new Set(data.map((row) => row.event_id as string)));
    })();
    return () => {
      cancelled = true;
    };
  }, [dates]);

  const onRegisteredChange = useCallback(
    (isRegistered: boolean) => {
      if (!selected) return;
      setRegistered((current) => {
        if (current.has(selected.id) === isRegistered) return current;
        const next = new Set(current);
        if (isRegistered) next.add(selected.id);
        else next.delete(selected.id);
        return next;
      });
    },
    [selected],
  );

  if (!selected) return null;

  const count = registered.size;

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 flex w-full items-baseline justify-between gap-3">
          <span className="text-caption font-bold tracking-[0.2em] uppercase">Pick your {weekday}</span>
          {count > 0 && (
            <span className="text-caption font-semibold text-green-700 dark:text-green-500">
              {count} {count === 1 ? "week" : "weeks"} booked
            </span>
          )}
        </legend>
        <div role="radiogroup" aria-label={`${title}: dates open for registration`} className="grid grid-cols-3 gap-2">
          {dates.map((date) => {
            const isSelected = date.id === selected.id;
            const isRegistered = registered.has(date.id);
            const { month, week } = weekOfMonth(date.date);
            return (
              <button
                key={date.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${formatShortDate(date.date)}, ${month} week ${week}${isRegistered ? ", registered" : ""}`}
                onClick={() => setSelectedId(date.id)}
                className={cn(
                  "relative flex flex-col items-start gap-0.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/60",
                )}
              >
                <span className="text-body-small leading-tight font-semibold">
                  {formatShortDate(date.date).replace(",", "")}
                </span>
                <span
                  className={cn(
                    "text-[0.625rem] font-bold tracking-[0.14em] uppercase",
                    isSelected ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  Week {week}
                </span>
                {isRegistered && (
                  <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-green-600 text-white">
                    <Check className="size-2.5" strokeWidth={3.5} aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <EventRegister
        key={selected.id}
        eventId={selected.id}
        eventSlug={selected.slug}
        eventTitle={`${title} on ${formatShortDate(selected.date)}`}
        onRegisteredChange={onRegisteredChange}
      />
    </div>
  );
}

"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

import { EventRegister } from "@/components/event-register";
import { formatShortDate, formatWeekday, weekOfMonth, type SeriesDate } from "@/lib/content-shared";
import { createClient } from "@/lib/supabase/client";

interface WeeklyRegisterProps {
  /** The series' open dates, soonest first. */
  dates: SeriesDate[];
  /** The date whose page this is — selected first. */
  currentId: string;
  title: string;
}

/**
 * Register for a weekly run: a dropdown of the open weeks (this page's date
 * first, selected), then the usual Register button acts on the chosen date. Each date is its own
 * event row, so registration, unregistering, the login round-trip and QR
 * check-in all work per date unchanged. Weeks the member already holds a
 * spot on are marked "✓ booked"; they can register for as many as they like.
 */
export function WeeklyRegister({ dates, currentId, title }: WeeklyRegisterProps) {
  const [selectedId, setSelectedId] = useState(
    dates.some((d) => d.id === currentId) ? currentId : dates[0]?.id,
  );
  const [registered, setRegistered] = useState<Set<string>>(new Set());
  const selectId = useId();
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

  // The page's own date first (the default), then the other open weeks.
  const main = dates.find((d) => d.id === currentId);
  const options = main ? [main, ...dates.filter((d) => d.id !== main.id)] : dates;
  const optionLabel = (date: SeriesDate) => {
    const { month, week } = weekOfMonth(date.date);
    return `${formatShortDate(date.date)} · ${month} week ${week}${registered.has(date.id) ? " · ✓ booked" : ""}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={selectId} className="text-caption font-bold tracking-[0.2em] uppercase">
            Pick your {weekday}
          </label>
          {count > 0 && (
            <span className="text-caption font-semibold text-green-700 dark:text-green-500">
              {count} {count === 1 ? "week" : "weeks"} booked
            </span>
          )}
        </div>
        <div className="relative">
          <CalendarDays
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <select
            id={selectId}
            value={selected.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="h-12 w-full cursor-pointer appearance-none rounded-lg border border-border bg-background pr-10 pl-10 text-body-small font-semibold text-foreground transition-colors hover:border-foreground/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {options.map((date) => (
              <option key={date.id} value={date.id}>
                {optionLabel(date)}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <p className="text-caption text-muted-foreground">
          {registered.has(selected.id)
            ? "You're booked for this week. Pick another week to add it too."
            : `Open for the next ${dates.length} weeks. Book as many as you like.`}
        </p>
      </div>

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

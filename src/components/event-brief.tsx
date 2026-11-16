import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  Flag,
  MapPin,
  Mountain,
  Route,
  Timer,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  formatDate,
  formatTime,
  formatWeekday,
  type EventItem,
} from "@/lib/content-shared";

interface EventBriefProps {
  event: EventItem;
}

/** 90 → "1 h 30 min" · 60 → "1 h" · 45 → "45 min" */
function humanizeMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

interface Fact {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  /** Long values (addresses) take a full row instead of a cell. */
  wide?: boolean;
}

/**
 * Quick-scan overview under the event cover: icon + one-word label + value
 * for everything a runner needs to decide and show up (when, how long, how
 * far, where). Always renders — date and location exist on every event;
 * the brief fields (0007) add cells when present.
 */
export function EventOverview({ event }: EventBriefProps) {
  const where = event.meetingPoint ?? event.location;
  const facts: Fact[] = [
    {
      icon: CalendarDays,
      label: "Date",
      value: event.endDate
        ? `${formatDate(event.date)} – ${formatDate(event.endDate)}`
        : `${formatWeekday(event.date)}, ${formatDate(event.date)}`,
    },
  ];
  if (event.startTime) {
    facts.push({ icon: Clock, label: "Start", value: formatTime(event.startTime) });
  }
  if (event.durationMinutes) {
    facts.push({
      icon: Timer,
      label: "Duration",
      value: humanizeMinutes(event.durationMinutes),
    });
  }
  if (event.distanceKm != null) {
    facts.push({ icon: Route, label: "Distance", value: `${event.distanceKm} km` });
  }
  if (event.elevationGainM != null) {
    facts.push({ icon: Mountain, label: "Elevation", value: `+${event.elevationGainM} m` });
  }
  facts.push({
    icon: MapPin,
    label: event.meetingPoint ? "Meet" : "Where",
    wide: true,
    value: (
      <a
        className="group inline-flex items-start gap-1 underline-offset-4 hover:underline"
        href={mapsUrl(`${where}, ${event.city}`)}
        target="_blank"
        rel="noopener"
      >
        <span>
          {where.toLowerCase().includes(event.city.toLowerCase())
            ? where
            : `${where} · ${event.city}`}
        </span>
        <ArrowUpRight
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          aria-label="Open in Google Maps"
        />
      </a>
    ),
  });
  if (event.finishPoint && event.finishPoint !== event.meetingPoint) {
    facts.push({ icon: Flag, label: "Finish", value: event.finishPoint, wide: true });
  }

  return (
    <section aria-label="Event overview" className="mb-12">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 rounded-xl border border-border p-5 sm:grid-cols-3 md:p-6">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className={cn(
              "flex items-start gap-3",
              fact.wide && "col-span-full border-t border-border pt-6",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
              <fact.icon className="size-4.5 text-foreground" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-caption font-bold tracking-[0.2em] text-muted-foreground uppercase">
                {fact.label}
              </dt>
              <dd className="text-body-small font-semibold break-words md:text-body">
                {fact.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * The longer-form brief — route notes, packing list, coach tips. Sits after
 * the event description (the overview above covers the quick scan). Renders
 * nothing when the event carries none of them.
 */
export function EventDetails({ event }: EventBriefProps) {
  const prose = [
    { label: "Route notes", text: event.routeNotes },
    { label: "What to bring", text: event.whatToBring },
    { label: "Coach tips", text: event.coachTips },
  ].filter((item) => item.text);
  if (prose.length === 0) return null;

  return (
    <section className="mt-12 flex flex-col gap-6">
      <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
        Event Brief
      </p>
      {prose.map((item) => (
        <Card key={item.label} className="gap-0">
          <CardHeader>
            <CardDescription className="text-caption font-medium tracking-[0.3em] uppercase">
              {item.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-small whitespace-pre-line text-muted-foreground">
              {item.text}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

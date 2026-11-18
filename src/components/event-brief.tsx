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
  /** Spans the two-column phone grid (the date), so the rest pair up. */
  lead?: boolean;
}

/** One place as a Google Maps link (or the pasted maps URL itself). */
function PlaceLink({ place, city }: { place: string; city: string }) {
  const value = place.trim();
  // Admins sometimes paste a maps link: link to it instead of printing it.
  const isUrl = /^https?:\/\//i.test(value);
  // A full address ("Street 1, 12345 Town") stands alone; a bare name gets
  // the event city so the label and the search are unambiguous.
  const standalone = value.includes(",") || value.toLowerCase().includes(city.toLowerCase());
  return (
    <a
      className="group inline-flex max-w-full items-start gap-1 underline-offset-4 hover:underline"
      href={isUrl ? value : mapsUrl(standalone ? value : `${value}, ${city}`)}
      target="_blank"
      rel="noopener"
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">
        {isUrl ? `Open map · ${city}` : standalone ? value : `${value} · ${city}`}
      </span>
      <ArrowUpRight
        className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        aria-label="Open in Google Maps"
      />
    </a>
  );
}

/** "A\nB" → each line its own place (e.g. a train meet and a car meet). */
function Places({ value, city }: { value: string; city: string }) {
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 1) return <PlaceLink place={lines[0]} city={city} />;
  return (
    <span className="flex flex-col gap-1.5">
      {lines.map((line) => (
        <PlaceLink key={line} place={line} city={city} />
      ))}
    </span>
  );
}

/**
 * The at-a-glance icon box at the top of the Overview: icon + one-word
 * label + value for everything a runner needs to decide and show up (when,
 * how long, how far, where). Always renders — date and location exist on
 * every event; the brief fields (0007) add cells when present. A meeting
 * point may list several places, one per line.
 */
export function EventOverview({ event }: EventBriefProps) {
  const meet = event.meetingPoint ?? event.location;
  const facts: Fact[] = [
    {
      icon: CalendarDays,
      label: "Date",
      lead: true,
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
    value: <Places value={meet} city={event.city} />,
  });
  if (event.finishPoint && event.finishPoint !== event.meetingPoint) {
    facts.push({
      icon: Flag,
      label: "Finish",
      wide: true,
      value: <Places value={event.finishPoint} city={event.city} />,
    });
  }

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-6 rounded-xl border border-border p-5 sm:grid-cols-3 md:p-6">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className={cn(
            "flex items-start gap-3",
            fact.lead && "col-span-2 sm:col-span-1",
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

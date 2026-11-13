import type { ReactNode } from "react";

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

/**
 * Technical-brief panel for the event page: a fact grid (date, start,
 * duration, distance, elevation, meeting/finish points) plus prose cards
 * for route notes, packing list and coach tips. Renders nothing when the
 * event carries no brief data at all.
 */
export function EventBrief({ event }: EventBriefProps) {
  const hasBrief = Boolean(
    event.startTime ??
      event.durationMinutes ??
      event.meetingPoint ??
      event.finishPoint ??
      event.distanceKm ??
      event.elevationGainM ??
      event.routeNotes ??
      event.whatToBring ??
      event.coachTips,
  );
  if (!hasBrief) return null;

  const facts: { label: string; value: ReactNode }[] = [
    {
      label: "Date",
      value: `${formatWeekday(event.date)}, ${formatDate(event.date)}`,
    },
  ];
  if (event.startTime) {
    facts.push({
      label: "Start",
      value: `${formatTime(event.startTime)} · Berlin time`,
    });
  }
  if (event.durationMinutes) {
    facts.push({
      label: "Duration",
      value: humanizeMinutes(event.durationMinutes),
    });
  }
  if (event.distanceKm != null) {
    facts.push({ label: "Distance", value: `${event.distanceKm} km` });
  }
  if (event.elevationGainM != null) {
    facts.push({ label: "Elevation", value: `+${event.elevationGainM} m` });
  }
  if (event.meetingPoint) {
    facts.push({
      label: "Meeting point",
      value: (
        <a
          className="font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
          href={mapsUrl(`${event.meetingPoint}, ${event.city}`)}
          target="_blank"
          rel="noopener"
        >
          {event.meetingPoint}
        </a>
      ),
    });
  }
  if (event.finishPoint || event.meetingPoint) {
    facts.push({
      label: "Finish",
      value: event.finishPoint ?? "Same as start",
    });
  }

  const prose = [
    { label: "Route notes", text: event.routeNotes },
    { label: "What to bring", text: event.whatToBring },
    { label: "Coach tips", text: event.coachTips },
  ].filter((item) => item.text);

  return (
    <section className="mb-12 flex flex-col gap-6">
      <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
        Event Brief
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {facts.map((fact) => (
          <Card key={fact.label} className="gap-0">
            <CardHeader>
              <CardDescription className="text-caption font-medium tracking-[0.3em] uppercase">
                {fact.label}
              </CardDescription>
              <p className="text-body-small font-semibold">{fact.value}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

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

"use client";

import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { rsvpToEvent } from "@/lib/actions/rsvp";

interface EventRsvpProps {
  eventId: string;
  eventSlug: string;
}

/**
 * Per-event RSVP card: email + optional first name + newsletter opt-in, no
 * account needed. On success the form is replaced by a confirmation and the
 * event's .ics invite downloads automatically (manual link kept alongside).
 */
export function EventRsvp({ eventId, eventSlug }: EventRsvpProps) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await rsvpToEvent(eventId, eventSlug, formData);
      if (result.status === "ok") {
        setSaved(true);
        setError(null);
        // The success copy promises the invite "downloads next" — trigger it.
        // The route serves Content-Disposition: attachment, so no navigation.
        const link = document.createElement("a");
        link.href = `/events/${eventSlug}/calendar.ics`;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Card className="gap-0">
      <CardHeader>
        <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
          Join this event
        </p>
        <p className="text-body-small text-muted-foreground">
          Save your spot — one field, no account needed.
        </p>
      </CardHeader>
      <CardContent>
        {saved ? (
          <div className="flex flex-col items-start gap-3">
            <CheckCircle2 className="size-6 text-green-600" />
            <p className="text-body-small font-semibold">
              You&apos;re in — see you at the start line.
            </p>
            <p className="text-caption text-muted-foreground">
              A calendar invite downloads next — or grab it here:
            </p>
            <Button
              variant="outline"
              render={
                <a href={`/events/${eventSlug}/calendar.ics`} download />
              }
              nativeButton={false}
            >
              <CalendarPlus />
              Add to calendar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rsvp-first-name" className="text-caption font-medium">
                First name
              </label>
              <Input id="rsvp-first-name" name="first_name" autoComplete="given-name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rsvp-email" className="text-caption font-medium">
                Email
              </label>
              <Input
                id="rsvp-email"
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="rsvp-newsletter"
                name="newsletter"
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <label htmlFor="rsvp-newsletter" className="text-caption text-muted-foreground">
                Email me YRC announcements and event updates — opt out anytime
              </label>
            </div>
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            {error && (
              <p className="text-caption text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving…" : "Save my spot"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

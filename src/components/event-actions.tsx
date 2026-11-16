import { ArrowUpRight, CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventSecondaryActionsProps {
  slug: string;
  /** The event on Strava (club group event), shown for upcoming events only. */
  registrationUrl?: string;
  isPast?: boolean;
  /** Short labels so all buttons fit one line in narrow cards. */
  compact?: boolean;
  className?: string;
}

/**
 * The quiet actions of an event: small outline buttons on one line under
 * the description. The primary CTA is separate: Register on the event page,
 * Event details on cards.
 */
export function EventSecondaryActions({
  slug,
  registrationUrl,
  isPast = false,
  compact = false,
  className,
}: EventSecondaryActionsProps) {
  // Narrow phones: drop the leading icons so a card's buttons stay on one line.
  const iconClass = compact ? "max-sm:px-2 max-sm:[&_svg]:hidden" : undefined;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact && "max-sm:gap-1.5", className)}>
      {!isPast && (
        <Button
          size="sm"
          variant="outline"
          className={iconClass}
          render={<a href={`/events/${slug}/calendar.ics`} download />}
          nativeButton={false}
        >
          <CalendarPlus aria-hidden="true" />
          {compact ? "Calendar" : "Add to calendar"}
        </Button>
      )}
      {!isPast && registrationUrl && (
        <Button
          size="sm"
          variant="outline"
          className={compact ? "max-sm:px-2" : undefined}
          render={
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener"
              aria-label="Join with Strava (opens in a new tab)"
            />
          }
          nativeButton={false}
        >
          Join with Strava
          <ArrowUpRight aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

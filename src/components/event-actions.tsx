import { ArrowUpRight, CalendarPlus, Info } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Where every "Register" outside the event page points: the event page with
 * the one-shot `register=1` flag. EventRegister then registers a signed-in
 * member on arrival, or sends a guest straight to login (and back).
 */
export function eventRegisterHref(slug: string) {
  return `/events/${slug}?register=1`;
}

interface EventSecondaryActionsProps {
  slug: string;
  /** Official/external registration page, shown for upcoming events only. */
  registrationUrl?: string;
  isPast?: boolean;
  /** Show a "Details" button (cards; the event page itself omits it). */
  details?: boolean;
  /** Short labels so all buttons fit one line in narrow cards. */
  compact?: boolean;
  className?: string;
}

/**
 * The quiet actions of an event: small outline buttons on one line under
 * the description. Register is always the separate, primary CTA.
 */
export function EventSecondaryActions({
  slug,
  registrationUrl,
  isPast = false,
  details = false,
  compact = false,
  className,
}: EventSecondaryActionsProps) {
  // Narrow phones: drop the leading icons so a card's buttons stay on one line.
  const iconClass = compact ? "max-sm:px-2 max-sm:[&_svg]:hidden" : undefined;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact && "max-sm:gap-1.5", className)}>
      {details && (
        <Button
          size="sm"
          variant="outline"
          className={iconClass}
          render={<Link href={`/events/${slug}`} />}
          nativeButton={false}
        >
          <Info aria-hidden="true" />
          Details
        </Button>
      )}
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
              aria-label={compact ? "Official registration (opens in a new tab)" : undefined}
            />
          }
          nativeButton={false}
        >
          {compact ? "Official" : "Official registration"}
          <ArrowUpRight aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

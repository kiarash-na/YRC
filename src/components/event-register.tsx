"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { registerForEvent } from "@/lib/actions/registration";
import { createClient } from "@/lib/supabase/client";

interface EventRegisterProps {
  eventId: string;
  eventSlug: string;
}

type Status = "unknown" | "guest" | "member" | "registered";

/** Query flag the login round-trip carries back: "register me on arrival". */
const REGISTER_PARAM = "register";

/**
 * The event page's primary CTA.
 *
 *  guest      → Register links to /login?next=/events/<slug>?register=1;
 *               after login the member lands back here and is registered
 *               automatically (the flag is then stripped from the URL).
 *  member     → Register registers in place (server action, own session).
 *  registered → green-tick confirmation instead of the button.
 *
 * The page is ISR-cached, so who-is-viewing is resolved client-side. The
 * link works without JS (login then bounces straight back with the flag).
 */
export function EventRegister({ eventId, eventSlug }: EventRegisterProps) {
  const [status, setStatus] = useState<Status>("unknown");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const returnTo = `/events/${eventSlug}?${REGISTER_PARAM}=1`;
  const loginHref = `/login?next=${encodeURIComponent(returnTo)}`;

  const register = () => {
    setError(null);
    startTransition(async () => {
      const result = await registerForEvent(eventId);
      if (result.status === "registered") setStatus("registered");
      else if (result.status === "not_authenticated") router.push(loginHref);
      else if (result.status === "closed")
        setError("Registration for this event has closed.");
      else setError("Couldn't register you. Try again in a minute.");
    });
  };

  useEffect(() => {
    let cancelled = false;
    const url = new URL(window.location.href);
    const wantsRegister = url.searchParams.get(REGISTER_PARAM) === "1";
    if (wantsRegister) {
      // One-shot flag: drop it so a refresh/share doesn't carry it along.
      url.searchParams.delete(REGISTER_PARAM);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }

    const supabase = createClient();
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        setStatus("guest");
        return;
      }
      const { data } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("profile_id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setStatus("registered");
      } else {
        setStatus("member");
        if (wantsRegister) register();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [eventId]);

  if (status === "registered") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-green-600/30 bg-green-600/5 p-4"
      >
        <CheckCircle2 className="yrc-tick mt-0.5 size-6 shrink-0 text-green-600" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-body font-semibold">You&apos;re registered</p>
          <p className="text-body-small text-muted-foreground">
            See you at the start line.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        className="h-12 w-full text-body font-semibold tracking-wider uppercase"
        disabled={isPending}
        render={
          <a
            href={loginHref}
            onClick={(e) => {
              // Members register in place; guests (and "unknown" before the
              // session check resolves) follow the login link.
              if (status === "member") {
                e.preventDefault();
                register();
              }
            }}
          />
        }
        nativeButton={false}
      >
        {isPending ? "Registering…" : "Register"}
      </Button>
      {error && (
        <p className="text-caption text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

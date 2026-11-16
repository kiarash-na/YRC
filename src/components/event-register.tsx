"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { registerForEvent, unregisterFromEvent } from "@/lib/actions/registration";
import { createClient } from "@/lib/supabase/client";

interface EventRegisterProps {
  eventId: string;
  eventSlug: string;
  /** Named in the unregister confirmation. */
  eventTitle?: string;
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
 *  registered → green-tick confirmation plus an Unregister button, which
 *               asks for confirmation in a dialog before cancelling.
 *
 * Register buttons elsewhere (cards, home) link here with the same flag,
 * so a guest goes straight on to login and a member is registered.
 *
 * The page is ISR-cached, so who-is-viewing is resolved client-side. The
 * link works without JS (login then bounces straight back with the flag).
 */
export function EventRegister({ eventId, eventSlug, eventTitle }: EventRegisterProps) {
  const [status, setStatus] = useState<Status>("unknown");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
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

  const unregister = () => {
    setError(null);
    startTransition(async () => {
      const result = await unregisterFromEvent(eventId);
      setConfirmOpen(false);
      if (result.status === "unregistered") setStatus("member");
      else if (result.status === "not_authenticated") router.push(loginHref);
      else if (result.status === "closed")
        setError("This event has already happened, so the registration can't be changed.");
      else setError("Couldn't unregister you. Try again in a minute.");
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
        // Came from a "Register" button elsewhere: continue to login (and
        // back here, registered) instead of making them click twice.
        if (wantsRegister) router.push(loginHref);
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div
            role="status"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-green-600/30 bg-green-600/5 px-4 text-body-small font-semibold tracking-wider text-green-700 uppercase dark:text-green-500"
          >
            <CheckCircle2 className="yrc-tick size-5 shrink-0" aria-hidden="true" />
            You&apos;re registered
          </div>
          <AlertDialog open={confirmOpen} onOpenChange={(open) => !isPending && setConfirmOpen(open)}>
            <AlertDialogTrigger
              render={
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 tracking-wider uppercase"
                  disabled={isPending}
                />
              }
            >
              {isPending ? "Unregistering…" : "Unregister"}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-h4">Unregister from this event?</AlertDialogTitle>
                <AlertDialogDescription className="text-body-small">
                  {eventTitle ? (
                    <>
                      You&apos;ll give up your spot at <strong>{eventTitle}</strong>.
                    </>
                  ) : (
                    "You'll give up your spot at this event."
                  )}{" "}
                  You can register again any time before it starts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Keep my spot</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/90"
                  disabled={isPending}
                  onClick={unregister}
                >
                  {isPending ? "Unregistering…" : "Yes, unregister"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {error ? (
          <p className="text-caption text-destructive" role="alert">
            {error}
          </p>
        ) : (
          <p className="text-body-small text-muted-foreground">See you at the start line.</p>
        )}
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

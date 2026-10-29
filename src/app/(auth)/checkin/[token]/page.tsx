import type { Metadata } from "next";
import { QrCode } from "lucide-react";

import { CheckInButton } from "@/components/checkin-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/content-shared";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Event Check-in — YRC",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * QR landing page. proxy.ts guarantees a session here (redirecting to login
 * first otherwise); the token itself is validated inside the database.
 */
export default async function CheckInPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let event: {
    title: string;
    slug: string;
    event_date: string;
    location: string;
    city: string;
    window_status?: "not_started" | "active" | "ended";
  } | null = null;

  if (UUID_RE.test(token)) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_event_for_checkin", { qr_token: token });
    event = data;
  }

  return (
    <div className="w-full max-w-[380px]">
      <Card>
        {event ? (
          <>
            <CardHeader className="text-center">
              <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
                Event check-in
              </p>
              <CardTitle className="text-h3">{event.title}</CardTitle>
              <CardDescription>
                {formatDate(event.event_date)} · {event.location} · {event.city}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {event.window_status === "not_started" && (
                <p className="text-center text-caption text-muted-foreground">
                  Check-in opens at midnight on the event day.
                </p>
              )}
              {event.window_status === "ended" && (
                <p className="text-center text-caption text-muted-foreground">
                  This event has ended — check-in is closed.
                </p>
              )}
              {(!event.window_status || event.window_status === "active") && (
                <CheckInButton token={token} />
              )}
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="items-center text-center">
              <QrCode className="size-8 text-muted-foreground" />
              <CardTitle className="text-h3">Invalid QR code</CardTitle>
              <CardDescription>
                This check-in link is expired or invalid — ask the run leader to
                show the current QR code.
              </CardDescription>
            </CardHeader>
          </>
        )}
      </Card>
    </div>
  );
}

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminEventForm } from "@/components/admin-event-form";
import { CheckinQr } from "@/components/checkin-qr";
import { DeleteEventButton } from "@/components/delete-event-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCheckinToken, duplicateEvent, setCheckinTokenActive, updateEvent } from "@/lib/actions/admin";
import { formatDate } from "@/lib/content-shared";
import { requireAdmin } from "@/lib/admin";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { admin } = await requireAdmin();

  const [{ data: event }, { data: tokens }, { data: attendance }] = await Promise.all([
    admin.from("events").select("*").eq("id", id).maybeSingle(),
    admin
      .from("event_checkin_tokens")
      .select("id, token, is_active, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
    admin
      .from("event_attendance")
      .select("checked_in_at, profiles(first_name, last_name)")
      .eq("event_id", id)
      .order("checked_in_at", { ascending: false }),
  ]);

  if (!event) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/events"
          className="flex w-fit items-center gap-1 text-caption text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to events
        </Link>
        <div className="flex items-center gap-2">
          <form action={duplicateEvent.bind(null, event.id)}>
            <Button type="submit" variant="outline" size="sm">
              Duplicate
            </Button>
          </form>
          <DeleteEventButton eventId={event.id} title={event.title} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-body font-semibold">QR check-in codes</CardTitle>
          <form action={createCheckinToken.bind(null, event.id)}>
            <Button type="submit" variant="outline" size="sm">
              New QR
            </Button>
          </form>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {!tokens || tokens.length === 0 ? (
            <p className="text-caption text-muted-foreground">No QR codes yet — create one.</p>
          ) : (
            tokens.map((token) => (
              <div
                key={token.id}
                className="flex flex-col items-center gap-3 rounded-xl border border-border p-4"
              >
                {token.is_active ? (
                  <CheckinQr token={token.token} slug={event.slug} />
                ) : (
                  <p className="py-6 text-caption text-muted-foreground">This QR code is disabled.</p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant={token.is_active ? "default" : "secondary"}>
                    {token.is_active ? "Active" : "Disabled"}
                  </Badge>
                  <form action={setCheckinTokenActive.bind(null, token.id, !token.is_active)}>
                    <Button type="submit" variant="outline" size="sm">
                      {token.is_active ? "Disable" : "Enable"}
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-h3">{event.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEventForm action={updateEvent.bind(null, event.id)} event={event} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">
            Check-ins ({attendance?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!attendance || attendance.length === 0 ? (
            <p className="text-caption text-muted-foreground">No check-ins yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {attendance.map((row) => {
                const member = row.profiles as unknown as { first_name: string; last_name: string } | null;
                return (
                  <li key={row.checked_in_at} className="flex items-center justify-between gap-3 py-3">
                    <p className="text-body-small font-medium">
                      {member ? `${member.first_name} ${member.last_name}`.trim() : "Member"}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {formatDate(row.checked_in_at.slice(0, 10))}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/content-shared";
import { requireAdmin } from "@/lib/admin";

export default async function AdminEventsPage() {
  const { admin } = await requireAdmin();

  const [{ data: events }, { data: attendance }] = await Promise.all([
    admin.from("events").select("id, slug, title, event_date, city, category, is_past, recurrence").order("event_date", { ascending: false }),
    admin.from("event_attendance").select("event_id"),
  ]);

  const attendanceCounts = new Map<string, number>();
  for (const row of attendance ?? []) {
    attendanceCounts.set(row.event_id, (attendanceCounts.get(row.event_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h2">Events</h1>
        <Button
          size="sm"
          className="gap-1.5"
          render={<Link href="/admin/events/new" />}
          nativeButton={false}
        >
          <Plus className="size-4" />
          New event
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!events || events.length === 0 ? (
            <p className="text-caption text-muted-foreground">
              No events in the database yet — run the seed SQL first.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="text-body-small truncate font-medium">{event.title}</p>
                      <p className="text-caption text-muted-foreground">
                        {formatDate(event.event_date)} · {event.city}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-caption text-muted-foreground">
                        {attendanceCounts.get(event.id) ?? 0} checked in
                      </span>
                      {event.recurrence === "weekly" && (
                        <Badge variant="outline">Weekly</Badge>
                      )}
                      {event.is_past && <Badge variant="secondary">Past</Badge>}
                      <Badge variant="secondary" className="uppercase">
                        {event.category}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

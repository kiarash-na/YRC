import { CalendarDays, Star, Users, QrCode } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/content-shared";
import { requireAdmin } from "@/lib/admin";

export default async function AdminOverviewPage() {
  const { admin } = await requireAdmin();

  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: memberCount },
    { count: checkinCount },
    { data: pointsRows },
    { count: upcomingCount },
    { data: recentCheckins },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("event_attendance").select("id", { count: "exact", head: true }),
    admin.from("score_entries").select("points"),
    admin.from("events").select("id", { count: "exact", head: true }).gte("event_date", today),
    admin
      .from("event_attendance")
      .select("checked_in_at, profiles(first_name, last_name), events(title)")
      .order("checked_in_at", { ascending: false })
      .limit(10),
  ]);

  const totalPoints = (pointsRows ?? []).reduce((sum, row) => sum + (row.points ?? 0), 0);

  const stats = [
    { label: "Members", value: memberCount ?? 0, icon: Users },
    { label: "Check-ins", value: checkinCount ?? 0, icon: QrCode },
    { label: "Points awarded", value: totalPoints, icon: Star },
    { label: "Upcoming events", value: upcomingCount ?? 0, icon: CalendarDays },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="text-h2">Overview</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col gap-2 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-caption tracking-[0.15em] text-muted-foreground uppercase">
                  {stat.label}
                </p>
                <stat.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-h2 font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Recent check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentCheckins || recentCheckins.length === 0 ? (
            <p className="text-caption text-muted-foreground">
              No check-ins yet — share an event QR code to get started.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {recentCheckins.map((row) => {
                const member = row.profiles as unknown as { first_name: string; last_name: string } | null;
                const event = row.events as unknown as { title: string } | null;
                return (
                  <li key={row.checked_in_at} className="flex items-center justify-between gap-3 py-3">
                    <p className="text-body-small">
                      <span className="font-medium">
                        {member ? `${member.first_name} ${member.last_name}`.trim() : "Member"}
                      </span>{" "}
                      <span className="text-muted-foreground">checked in at</span>{" "}
                      <span className="font-medium">{event?.title ?? "an event"}</span>
                    </p>
                    <p className="text-caption shrink-0 text-muted-foreground">
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

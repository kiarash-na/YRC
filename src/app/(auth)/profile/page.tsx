import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/content-shared";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Profile — YRC",
};

interface AttendanceRow {
  checked_in_at: string;
  events: { title: string; slug: string; event_date: string; city: string } | null;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const [{ data: profile }, { data: scoreRow }, { data: attendance }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("profile_scores").select("total_points").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("event_attendance")
      .select("checked_in_at, events(title, slug, event_date, city)")
      .eq("profile_id", user.id)
      .order("checked_in_at", { ascending: false }),
  ]);

  if (!profile) redirect("/login?error=profile");

  const totalPoints = scoreRow?.total_points ?? 0;
  const visits = (attendance ?? []) as unknown as AttendanceRow[];
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "YRC Member";
  const initials = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .map((s: string) => s[0])
    .join("")
    .toUpperCase() || "YRC";

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <Avatar className="size-20 text-xl">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={fullName} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-h3">{fullName}</h1>
            {(profile.city || profile.country) && (
              <p className="text-caption text-muted-foreground">
                {[profile.city, profile.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 p-4">
            <div className="text-center">
              <p className="text-h2 font-bold text-yrc-accent">{totalPoints}</p>
              <p className="text-caption tracking-[0.2em] text-muted-foreground uppercase">
                YRC Points
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              render={<Link href="/profile/settings" />}
              nativeButton={false}
            >
              <Settings className="size-3.5" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              render={<a href="/auth/logout" />}
              nativeButton={false}
            >
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-body-small mb-4 font-semibold">Events attended</h2>
          {visits.length === 0 ? (
            <p className="text-caption text-muted-foreground">
              No check-ins yet. Scan the QR code at your next YRC event to earn points.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {visits.map((visit) => (
                <li key={visit.checked_in_at} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-body-small truncate font-medium">
                      {visit.events?.title ?? "Event"}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {visit.events ? `${formatDate(visit.events.event_date)} · ${visit.events.city}` : ""}
                    </p>
                  </div>
                  <Link
                    href={visit.events ? `/events/${visit.events.slug}` : "/events/all"}
                    className="text-caption shrink-0 text-yrc-accent hover:underline"
                  >
                    View
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

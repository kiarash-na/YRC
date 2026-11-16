import { ArrowUpRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminMemberDangerZone } from "@/components/admin-member-danger-zone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/admin";
import { setMemberLeaderboardHidden, updateMember } from "@/lib/actions/members-admin";
import { formatDate } from "@/lib/content-shared";

type EventRef = { title: string; slug: string; event_date?: string } | null;

/** Supabase returns a to-one join as an object (typed loosely as an array). */
function one<T>(value: unknown): T | null {
  return (Array.isArray(value) ? value[0] : value) as T | null;
}

const SYNTHETIC_EMAIL = /@strava\.yasrise\.run$/;

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Profile ids are auth uuids; anything else is simply not a member.
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { admin, user } = await requireAdmin();

  const [
    { data: profile },
    { data: authData },
    { data: score },
    { data: ledger },
    { data: registrations },
    { data: attendance },
    { data: seats },
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).maybeSingle(),
    admin.auth.admin.getUserById(id),
    admin.from("profile_scores").select("total_points").eq("profile_id", id).maybeSingle(),
    admin
      .from("score_entries")
      .select("id, action_key, points, created_at, events(title, slug)")
      .eq("profile_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("event_registrations")
      .select("id, created_at, events(title, slug, event_date)")
      .eq("profile_id", id)
      .order("created_at", { ascending: false }),
    admin
      .from("event_attendance")
      .select("id, checked_in_at, events(title, slug)")
      .eq("profile_id", id)
      .order("checked_in_at", { ascending: false }),
    admin.from("admins").select("email, strava_athlete_id"),
  ]);

  if (!profile) notFound();

  const authUser = authData?.user ?? null;
  const email = authUser?.email ?? null;
  const realEmail = email && !SYNTHETIC_EMAIL.test(email) ? email : null;
  const name = `${profile.first_name} ${profile.last_name}`.trim();
  const displayName = name || "Unnamed member";
  const initials =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .map((s: string) => s[0])
      .join("")
      .toUpperCase() || "YRC";

  const isAdmin = (seats ?? []).some(
    (s) =>
      (profile.strava_athlete_id != null && s.strava_athlete_id === profile.strava_athlete_id) ||
      (email != null && s.email.toLowerCase() === email.toLowerCase()),
  );
  const isSelf = user.id === id;

  const facts: [string, React.ReactNode][] = [
    ["Email", realEmail ?? <span className="text-muted-foreground">None (Strava sign-in)</span>],
    [
      "Strava",
      profile.strava_athlete_id ? (
        <a
          href={`https://www.strava.com/athletes/${profile.strava_athlete_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 underline-offset-4 hover:underline"
        >
          Athlete {profile.strava_athlete_id}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      ) : (
        <span className="text-muted-foreground">Not linked</span>
      ),
    ],
    ["Joined", formatDate(profile.created_at.slice(0, 10))],
    [
      "Last sign-in",
      authUser?.last_sign_in_at ? formatDate(authUser.last_sign_in_at.slice(0, 10)) : "—",
    ],
    ["Member ID", <code key="id" className="text-caption break-all">{profile.id}</code>],
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/admin/members"
        className="flex w-fit items-center gap-1 text-caption text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to members
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-16">
          {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-h2 break-words">{displayName}</h1>
          <p className="text-caption text-muted-foreground">
            {[profile.city, profile.country].filter(Boolean).join(", ") || "No location"}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {isAdmin && <Badge>Admin</Badge>}
            {isSelf && <Badge variant="secondary">You</Badge>}
            {profile.leaderboard_opt_out && <Badge variant="outline">Hidden from leaderboard</Badge>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-h2 font-bold text-yrc-accent">{score?.total_points ?? 0}</p>
          <p className="text-caption text-muted-foreground">points</p>
        </div>
      </div>

      {/* Account facts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[8rem_1fr]">
            {facts.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-caption text-muted-foreground sm:pt-0.5">{label}</dt>
                <dd className="-mt-2 text-body-small sm:mt-0">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form action={updateMember.bind(null, profile.id)} className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["first_name", "First name", profile.first_name],
                ["last_name", "Last name", profile.last_name],
                ["city", "City", profile.city ?? ""],
                ["country", "Country", profile.country ?? ""],
              ] as const
            ).map(([field, label, value]) => (
              <label key={field} className="flex flex-col gap-1.5 text-caption font-medium">
                {label}
                <Input name={field} defaultValue={value} maxLength={100} className="h-10" />
              </label>
            ))}
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">
                Save profile
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <div>
              <p className="text-body-small font-medium">Public leaderboard</p>
              <p className="text-caption text-muted-foreground">
                {profile.leaderboard_opt_out
                  ? "Hidden: their points still count, but they don't appear on the boards."
                  : "Visible on the home and community leaderboards."}
              </p>
            </div>
            <form
              action={setMemberLeaderboardHidden.bind(null, profile.id, !profile.leaderboard_opt_out)}
            >
              <Button type="submit" variant="outline" size="sm">
                {profile.leaderboard_opt_out ? "Show on leaderboard" : "Hide from leaderboard"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">
            Registrations ({registrations?.length ?? 0}) · Check-ins ({attendance?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <ActivityList
            title="Registered for"
            empty="No registrations."
            rows={(registrations ?? []).map((r) => {
              const event = one<EventRef>(r.events);
              return {
                key: r.id,
                label: event?.title ?? "Deleted event",
                href: event ? `/events/${event.slug}` : undefined,
                meta: event?.event_date ? formatDate(event.event_date) : "",
              };
            })}
          />
          <ActivityList
            title="Checked in at"
            empty="No check-ins."
            rows={(attendance ?? []).map((a) => {
              const event = one<EventRef>(a.events);
              return {
                key: a.id,
                label: event?.title ?? "Deleted event",
                href: event ? `/events/${event.slug}` : undefined,
                meta: formatDate(a.checked_in_at.slice(0, 10)),
              };
            })}
          />
        </CardContent>
      </Card>

      {/* Points ledger */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Points history</CardTitle>
        </CardHeader>
        <CardContent>
          {!ledger || ledger.length === 0 ? (
            <p className="text-caption text-muted-foreground">No points yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {ledger.map((entry) => {
                const event = one<EventRef>(entry.events);
                return (
                  <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-body-small font-medium">
                        {entry.action_key.replaceAll("_", " ")}
                      </p>
                      <p className="truncate text-caption text-muted-foreground">
                        {formatDate(entry.created_at.slice(0, 10))}
                        {event ? ` · ${event.title}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-body-small font-semibold text-yrc-accent">
                      +{entry.points}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          {ledger && ledger.length === 50 && (
            <p className="pt-3 text-caption text-muted-foreground">Showing the latest 50 entries.</p>
          )}
        </CardContent>
      </Card>

      <AdminMemberDangerZone
        profileId={profile.id}
        confirmText={name || "DELETE"}
        blockedReason={
          isSelf
            ? "This is your own account. It can't be deleted from here."
            : isAdmin
              ? "This member holds an admin seat. Remove the seat under Admins before deleting them."
              : undefined
        }
      />
    </div>
  );
}

function ActivityList({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: { key: string; label: string; href?: string; meta: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="text-caption text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <li key={row.key} className="flex items-baseline justify-between gap-3 py-2">
              {row.href ? (
                <Link href={row.href} className="truncate text-body-small font-medium hover:underline">
                  {row.label}
                </Link>
              ) : (
                <span className="truncate text-body-small text-muted-foreground">{row.label}</span>
              )}
              <span className="shrink-0 text-caption text-muted-foreground">{row.meta}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

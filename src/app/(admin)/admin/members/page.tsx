import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin";

export default async function AdminMembersPage() {
  const { admin } = await requireAdmin();

  const [{ data: members }, { data: scores }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, first_name, last_name, avatar_url, city, country, created_at")
      .order("created_at", { ascending: false }),
    admin.from("profile_scores").select("profile_id, total_points"),
  ]);

  const scoreByProfile = new Map((scores ?? []).map((s) => [s.profile_id, s.total_points]));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="text-h2">Members</h1>

      <Card>
        <CardContent className="pt-6">
          {!members || members.length === 0 ? (
            <p className="text-caption text-muted-foreground">
              No members yet — they appear here after their first Strava login.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {members.map((member) => {
                const name = `${member.first_name} ${member.last_name}`.trim() || "Member";
                const initials =
                  [member.first_name, member.last_name]
                    .filter(Boolean)
                    .map((s: string) => s[0])
                    .join("")
                    .toUpperCase() || "YRC";
                return (
                  <li key={member.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar>
                        {member.avatar_url && <AvatarImage src={member.avatar_url} alt={name} />}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-body-small truncate font-medium">{name}</p>
                        <p className="text-caption text-muted-foreground">
                          {[member.city, member.country].filter(Boolean).join(", ") || "—"}
                        </p>
                      </div>
                    </div>
                    <p className="text-body-small shrink-0 font-semibold text-yrc-accent">
                      {scoreByProfile.get(member.id) ?? 0} pts
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

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/admin";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { admin } = await requireAdmin();
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 60) ?? "";

  let query = admin
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, city, country, created_at, leaderboard_opt_out")
    .order("created_at", { ascending: false });
  // Strip PostgREST filter syntax characters before building the .or().
  const term = q.replace(/[%,().*\\]/g, "");
  if (term) {
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,city.ilike.%${term}%`,
    );
  }

  const [{ data: members }, { data: scores }] = await Promise.all([
    query,
    admin.from("profile_scores").select("profile_id, total_points"),
  ]);

  const scoreByProfile = new Map((scores ?? []).map((s) => [s.profile_id, s.total_points]));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Members</h1>
          <p className="text-caption text-muted-foreground">
            {members?.length ?? 0} {term ? "matching" : "total"}. Open a member to see their
            details, edit them or delete them.
          </p>
        </div>
        <form role="search" className="flex w-full gap-2 sm:w-auto">
          <label htmlFor="member-search" className="sr-only">
            Search members
          </label>
          <Input
            id="member-search"
            name="q"
            defaultValue={q}
            placeholder="Name or city"
            className="h-9 sm:w-60"
          />
          <Button type="submit" variant="outline" size="sm" className="h-9 gap-1.5">
            <Search aria-hidden="true" />
            Search
          </Button>
        </form>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!members || members.length === 0 ? (
            <p className="text-caption text-muted-foreground">
              {term
                ? `No members match "${q}".`
                : "No members yet. They appear here after their first login."}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {members.map((member) => {
                const name = `${member.first_name} ${member.last_name}`.trim() || "Unnamed member";
                const initials =
                  [member.first_name, member.last_name]
                    .filter(Boolean)
                    .map((s: string) => s[0])
                    .join("")
                    .toUpperCase() || "YRC";
                return (
                  <li key={member.id}>
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="-mx-3 flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar>
                          {member.avatar_url && <AvatarImage src={member.avatar_url} alt="" />}
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-body-small font-medium">{name}</p>
                          <p className="text-caption text-muted-foreground">
                            {[member.city, member.country].filter(Boolean).join(", ") || "—"}
                          </p>
                        </div>
                        {member.leaderboard_opt_out && (
                          <Badge variant="outline" className="hidden sm:inline-flex">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="text-body-small font-semibold text-yrc-accent">
                          {scoreByProfile.get(member.id) ?? 0} pts
                        </p>
                        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                      </div>
                    </Link>
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

import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addAdminSeat, linkAdminSeat, removeAdminSeat } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/admin";

export default async function AdminSeatsPage() {
  const { admin, seat: mySeat } = await requireAdmin();

  const { data: seats } = await admin
    .from("admins")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-h2">Admins</h1>
      <p className="text-body-small text-muted-foreground">
        At most 3 admin seats (enforced by the database). A seat grants access
        immediately when its email matches the member&apos;s login email, and
        also to the linked Strava athlete ID — the athlete ID is visible on a
        member&apos;s profile settings page after their first Strava login.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Seats ({seats?.length ?? 0}/3)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {(seats ?? []).map((seat) => {
            const isMe = seat.id === mySeat.id;
            const linked = seat.strava_athlete_id !== null;
            return (
              <div key={seat.id} className="flex flex-col gap-3 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body-small truncate font-medium">{seat.email}</p>
                    <p className="text-caption text-muted-foreground">
                      {linked ? `Strava athlete #${seat.strava_athlete_id}` : "Access via matching login email"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isMe && <Badge>you</Badge>}
                    <Badge variant={linked ? "default" : "secondary"}>
                      {linked ? "Strava linked" : "Email match"}
                    </Badge>
                    {!isMe && (
                      <form action={removeAdminSeat.bind(null, seat.id)}>
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
                {!linked && (
                  <form action={linkAdminSeat.bind(null, seat.id)} className="flex items-end gap-2">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <label className="text-caption font-medium">Link Strava athlete ID</label>
                      <Input
                        name="strava_athlete_id"
                        inputMode="numeric"
                        placeholder="e.g. 12345678"
                        required
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm">
                      Link
                    </Button>
                  </form>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {(seats?.length ?? 0) < 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-body font-semibold">Add seat</CardTitle>
            <CardDescription>
              The email both labels the seat and grants access to whoever logs
              in with it — optionally link a Strava athlete ID too.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addAdminSeat} className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="email" className="text-caption font-medium">Email label</label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" required />
              </div>
              <Button type="submit" size="sm" className="gap-1.5">
                <Plus className="size-4" />
                Add
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

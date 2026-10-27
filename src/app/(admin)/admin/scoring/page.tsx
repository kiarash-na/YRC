import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createScoreAction, updateScoreAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/admin";

export default async function AdminScoringPage() {
  const { admin } = await requireAdmin();

  const { data: actions } = await admin
    .from("score_actions")
    .select("*")
    .order("key", { ascending: true });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-h2">Scoring</h1>
      <p className="text-body-small text-muted-foreground">
        How many points each action is worth. Changes apply to future awards
        only — points already earned never change.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {(actions ?? []).map((action) => (
            <form
              key={action.key}
              action={updateScoreAction.bind(null, action.key)}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="text-body-small font-medium">{action.key}</p>
                {action.description && (
                  <p className="text-caption text-muted-foreground">{action.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Input
                  name="points"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={action.points}
                  className="w-24 text-right"
                  aria-label={`Points for ${action.key}`}
                />
                <Button type="submit" variant="outline" size="sm">
                  Save
                </Button>
              </div>
            </form>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">New action</CardTitle>
          <CardDescription>
            Add a future way to earn points (e.g. challenge_completed). It only
            takes effect once the app awards it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createScoreAction} className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-40 flex-col gap-1.5">
              <label htmlFor="key" className="text-caption font-medium">Key</label>
              <Input id="key" name="key" placeholder="challenge_completed" required />
            </div>
            <div className="flex w-28 flex-col gap-1.5">
              <label htmlFor="points" className="text-caption font-medium">Points</label>
              <Input id="points" name="points" type="number" min={0} step={1} defaultValue={10} required />
            </div>
            <div className="flex min-w-48 flex-1 flex-col gap-1.5">
              <label htmlFor="description" className="text-caption font-medium">Description</label>
              <Input id="description" name="description" placeholder="Finishing a monthly challenge" />
            </div>
            <Button type="submit" size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

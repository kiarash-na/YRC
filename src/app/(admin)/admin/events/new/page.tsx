import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { AdminEventForm } from "@/components/admin-event-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEvent } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/admin";

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/admin/events"
        className="flex w-fit items-center gap-1 text-caption text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to events
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">New event</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEventForm action={createEvent} />
        </CardContent>
      </Card>
    </div>
  );
}

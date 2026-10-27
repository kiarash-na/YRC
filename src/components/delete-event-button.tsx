"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/lib/actions/admin";

/** Delete button with a browser confirm before calling the server action. */
export function DeleteEventButton({ eventId, title }: { eventId: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-destructive hover:bg-destructive/10"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(`Delete "${title}"? This also removes its QR codes and check-ins.`)) {
          startTransition(() => deleteEvent(eventId));
        }
      }}
    >
      <Trash2 className="size-3.5" />
      {isPending ? "Deleting…" : "Delete"}
    </Button>
  );
}

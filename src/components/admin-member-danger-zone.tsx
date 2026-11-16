"use client";

import { Trash2 } from "lucide-react";
import { useId, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteMember } from "@/lib/actions/members-admin";

/**
 * Danger zone on the member detail page: the admin types the member's name
 * (or DELETE) to unlock permanent deletion. The server checks it again.
 */
export function AdminMemberDangerZone({
  profileId,
  confirmText,
  blockedReason,
}: {
  profileId: string;
  confirmText: string;
  /** When set, deletion is unavailable and this explains why. */
  blockedReason?: string;
}) {
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const matches = value.trim() === confirmText;

  const onDelete = () => {
    setError(null);
    startTransition(async () => {
      // On success the action redirects to the member list.
      const result = await deleteMember(profileId, value);
      if (result?.status === "error") setError(result.message);
    });
  };

  return (
    <section
      aria-labelledby={`${inputId}-title`}
      className="flex flex-col gap-4 rounded-xl border border-destructive/40 p-5 md:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id={`${inputId}-title`} className="text-h4 text-destructive">
          Danger zone
        </h2>
        <p className="text-body-small text-muted-foreground">
          Deleting a member permanently removes their account, points, event
          registrations and check-ins. It can&apos;t be undone. Their newsletter
          subscription, if any, is managed under Newsletter.
        </p>
      </div>

      {blockedReason ? (
        <p className="rounded-lg bg-muted px-4 py-3 text-body-small">{blockedReason}</p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (matches) onDelete();
          }}
          className="flex flex-col gap-3"
        >
          <label htmlFor={inputId} className="text-body-small">
            Type <span className="font-semibold select-all">{confirmText}</span> to confirm.
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id={inputId}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="h-10 sm:max-w-xs"
            />
            <Button
              type="submit"
              variant="destructive"
              className="h-10 gap-1.5 bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/90"
              disabled={!matches || isPending}
            >
              <Trash2 aria-hidden="true" />
              {isPending ? "Deleting…" : "Delete member"}
            </Button>
          </div>
          {error && (
            <p id={errorId} role="alert" className="text-caption text-destructive">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

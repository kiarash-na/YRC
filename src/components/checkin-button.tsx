"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { checkIn, type CheckInResult } from "@/lib/actions/checkin";

/** The confirm button on the QR check-in page. */
export function CheckInButton({ token }: { token: string }) {
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckIn() {
    startTransition(async () => {
      setResult(await checkIn(token));
    });
  }

  if (result?.status === "checked_in") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="size-10 text-green-600" />
        <p className="text-body-small font-semibold">You&apos;re checked in!</p>
        {typeof result.points === "number" && result.points > 0 && (
          <p className="text-h3 font-bold text-yrc-accent">+{result.points} points</p>
        )}
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/profile" />}
          nativeButton={false}
        >
          View my profile
        </Button>
      </div>
    );
  }

  if (result?.status === "already_checked_in") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="size-10 text-green-600" />
        <p className="text-body-small font-semibold">You&apos;re already checked in</p>
        <p className="text-caption text-muted-foreground">
          Points were awarded on your first scan.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/profile" />}
          nativeButton={false}
        >
          View my profile
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {result && (
        <p className="text-center text-caption text-destructive">
          {result.status === "invalid_token"
            ? "This QR code is no longer active — ask the run leader."
            : "Something went wrong. Please try again."}
        </p>
      )}
      <Button size="lg" className="w-full" onClick={handleCheckIn} disabled={isPending}>
        {isPending ? "Checking in…" : "Check in"}
      </Button>
    </div>
  );
}

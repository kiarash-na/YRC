"use client";

import { useState, useTransition } from "react";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendLoginEmail } from "@/lib/actions/auth-email";

/** Magic-link email form on the login page (secondary to Strava). */
export function EmailLoginForm({ next }: { next: string }) {
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    startTransition(async () => {
      const result = await sendLoginEmail(email, next);
      setState(result.status === "sent" ? "sent" : "error");
      setMessage(result.status === "sent" ? "" : result.message);
    });
  }

  if (state === "sent") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-6 text-center">
        <MailCheck className="size-6 text-yrc-accent" />
        <p className="text-body-small font-semibold">Check your inbox</p>
        <p className="text-caption text-muted-foreground">
          We sent you a login link. It expires shortly — open it on this device.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-caption font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>
      {state === "error" && (
        <p className="text-center text-caption text-destructive">{message}</p>
      )}
      <Button type="submit" variant="outline" disabled={isPending} className="w-full">
        {isPending ? "Sending…" : "Email me a login link"}
      </Button>
    </form>
  );
}

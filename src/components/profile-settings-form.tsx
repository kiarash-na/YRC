"use client";

import { useState, useTransition } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions/profile";

interface ProfileSettingsFormProps {
  profile: {
    first_name: string;
    last_name: string;
    city: string | null;
    country: string | null;
    avatar_url: string | null;
    strava_athlete_id: number;
  };
}

/** Single-card profile settings (settings-profile2a structure, YRC-adapted). */
export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const initials =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "YRC";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      setStatus(result.status === "ok" ? "saved" : "error");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar className="size-20 text-xl">
          {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="Profile photo" />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <p className="text-caption text-muted-foreground">
          Photo synced from Strava at each login.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="first_name" className="text-caption font-medium">
            First name
          </label>
          <Input id="first_name" name="first_name" defaultValue={profile.first_name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="last_name" className="text-caption font-medium">
            Last name
          </label>
          <Input id="last_name" name="last_name" defaultValue={profile.last_name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-caption font-medium">
            City
          </label>
          <Input id="city" name="city" defaultValue={profile.city ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="country" className="text-caption font-medium">
            Country
          </label>
          <Input id="country" name="country" defaultValue={profile.country ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium">Connected account</label>
        <Input
          readOnly
          disabled
          value={`Strava · athlete #${profile.strava_athlete_id}`}
          className="text-muted-foreground"
        />
      </div>

      {status === "saved" && (
        <p className="text-center text-caption text-green-600">Saved — your profile is up to date.</p>
      )}
      {status === "error" && (
        <p className="text-center text-caption text-destructive">
          Couldn&apos;t save. Please try again.
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile Settings — YRC",
};

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, city, country, avatar_url, strava_athlete_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login?error=profile");

  const { linked, error } = await searchParams;

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Link
        href="/profile"
        className="mb-4 flex w-fit items-center gap-1 text-caption text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to profile
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Profile settings</CardTitle>
          <CardDescription>
            How you appear in YRC. Your photo and login come from Strava.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Strava connection</CardTitle>
          <CardDescription>
            Link Strava to sync your runs, points and profile — and to log in
            with one tap.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {linked === "strava" && (
            <p className="text-caption text-green-600">
              Strava connected — you can now also log in with the Strava button.
            </p>
          )}
          {error === "strava_taken" && (
            <p className="text-caption text-destructive">
              That Strava account is already linked to a different YRC member.
              Contact an admin if you think this is wrong.
            </p>
          )}
          {error === "link_failed" && (
            <p className="text-caption text-destructive">
              Couldn&apos;t link Strava. Please try again.
            </p>
          )}
          {profile.strava_athlete_id ? (
            <p className="text-body-small">
              Connected as athlete{" "}
              <span className="font-mono font-medium">{profile.strava_athlete_id}</span>
            </p>
          ) : (
            <Button
              variant="outline"
              className="w-fit"
              render={<a href="/auth/strava?mode=link&next=/profile/settings" />}
              nativeButton={false}
            >
              Connect Strava
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

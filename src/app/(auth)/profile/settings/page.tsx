import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

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

export default async function ProfileSettingsPage() {
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

  return (
    <div className="w-full max-w-lg">
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
    </div>
  );
}

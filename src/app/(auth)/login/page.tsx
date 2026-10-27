import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiStrava } from "react-icons/si";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Login — YRC",
};

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "You declined the Strava authorization — no worries, try again anytime.",
  oauth_state: "The login session expired. Please try again.",
  exchange: "We couldn't reach Strava. Please try again.",
  account: "We couldn't create your account. Please contact the YRC team.",
  profile: "We couldn't set up your profile. Please try again.",
  session: "We couldn't start your session. Please try again.",
  confirm: "The login link is invalid or expired. Please try again.",
};

/** Centered-card login (login7 structure) — Strava is the only method. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeTarget = next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile";

  // already signed in? go straight to the destination
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect(safeTarget);
  }

  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.") : null;

  return (
    <div className="w-full max-w-[380px]">
      <Card>
        <CardHeader className="items-center text-center">
          <Link href="/" className="text-h3 font-bold tracking-tight">
            YRC
          </Link>
          <CardTitle className="text-h3">Member login</CardTitle>
          <CardDescription>
            One button, no passwords — we use your Strava account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {errorMessage && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-caption text-destructive">
              {errorMessage}
            </p>
          )}
          <Button
            size="lg"
            className="w-full gap-2 bg-[#FC4C02] text-white hover:bg-[#e04402]"
            render={<a href={`/auth/strava?next=${encodeURIComponent(safeTarget)}`} />}
            nativeButton={false}
          >
            <SiStrava className="size-5" />
            Continue with Strava
          </Button>
          <p className="text-center text-caption text-muted-foreground">
            We only read your public Strava profile — never your activities.
          </p>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-caption text-muted-foreground">
        <Link href="/" className="underline underline-offset-4 hover:text-foreground">
          Back to yasrise.run
        </Link>
      </p>
    </div>
  );
}

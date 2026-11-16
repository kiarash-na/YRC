import { CalendarCheck, Link2, MailPlus, UserRoundCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLeaderboard } from "@/lib/leaderboard";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * YRC Strides — the public leaderboard section on /community. Points are
 * priced live from the admin-editable score_actions table (with a label-only
 * fallback when the fetch fails); the board itself comes from the
 * get_leaderboard RPC via @/lib/leaderboard.
 */

interface EarnRule {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const earnRules: EarnRule[] = [
  { key: "event_attendance", label: "Check in at an event", icon: CalendarCheck },
  { key: "newsletter_subscribe", label: "Subscribe to the newsletter", icon: MailPlus },
  { key: "strava_connect", label: "Connect your Strava", icon: Link2 },
  { key: "profile_complete", label: "Complete your profile", icon: UserRoundCheck },
];

interface ScoreActionRow {
  key: string;
  points: number;
}

/** Live point values per action key; null when unavailable (never throws). */
async function getEarnPoints(): Promise<Map<string, number> | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null;
  }
  try {
    const { data, error } = await createPublicClient()
      .from("score_actions")
      .select("key, points")
      .eq("is_active", true);
    if (error) {
      console.error("Failed to load score actions:", error.message);
      return null;
    }
    return new Map(
      ((data as ScoreActionRow[] | null) ?? []).map((row) => [
        row.key,
        Number(row.points),
      ]),
    );
  } catch (error) {
    console.error("Failed to load score actions:", error);
    return null;
  }
}

interface StridesLeaderboardProps {
  className?: string;
}

const StridesLeaderboard = async ({ className }: StridesLeaderboardProps) => {
  const [entries, earnPoints] = await Promise.all([
    getLeaderboard(),
    getEarnPoints(),
  ]);

  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            YRC Strides
          </p>
          <h2 className="text-h2 md:text-h1">
            The board rewards <span className="text-yrc-accent">showing up</span>.
          </h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            Every check-in earns strides. No podiums for pace.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {earnRules.map((rule) => {
            const points = earnPoints?.get(rule.key);
            return (
              <div
                key={rule.key}
                className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-6"
              >
                <rule.icon className="size-6 text-foreground" />
                <p className="text-body-small font-semibold">{rule.label}</p>
                {points != null && (
                  <p className="text-caption font-bold tracking-[0.2em] text-yrc-accent uppercase">
                    +{points} strides
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {entries.length === 0 ? (
          <div className="mt-14 rounded-xl border border-border bg-muted/40 p-8 md:p-14">
            <p className="text-body text-muted-foreground">
              The board is waiting for its first strides — see you at the next
              run.
            </p>
          </div>
        ) : (
          <ol className="mt-14 flex flex-col divide-y divide-border border-y border-border">
            {entries.map((entry, index) => (
              <li
                key={`${index}-${entry.firstName}`}
                className="flex items-center gap-4 py-4 md:gap-6 md:py-5"
              >
                <span className="w-10 shrink-0 text-h4 font-bold text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Avatar size="lg">
                  {entry.avatarUrl && (
                    <AvatarImage
                      src={entry.avatarUrl}
                      alt={`${entry.firstName}'s avatar`}
                    />
                  )}
                  <AvatarFallback>
                    {entry.firstName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-h4 font-semibold">
                  {entry.firstName}
                </span>
                <span className="hidden shrink-0 text-body-small text-muted-foreground sm:block">
                  {entry.eventsAttended} events
                </span>
                <span className="shrink-0 text-h4 font-semibold text-yrc-accent">
                  {entry.totalPoints} strides
                </span>
              </li>
            ))}
          </ol>
        )}

        <p className="mt-10 max-w-2xl text-body-small text-muted-foreground">
          Members can hide themselves anytime in profile settings.
        </p>
      </div>
    </section>
  );
};

export { StridesLeaderboard };

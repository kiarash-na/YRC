import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCommunityStats, getLeaderboard } from "@/lib/leaderboard";

interface StridesStripProps {
  className?: string;
}

/**
 * Slim homepage band with the YRC Strides top 5 and community totals,
 * mirroring WeeklyStrip. Renders nothing while the board is empty.
 */
const StridesStrip = async ({ className }: StridesStripProps) => {
  const [entries, stats] = await Promise.all([
    getLeaderboard(5),
    getCommunityStats(),
  ]);
  if (entries.length === 0) return null;

  return (
    <section
      className={cn("border-y border-border bg-muted/40 py-10", className)}
    >
      <div className="container flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="min-w-0">
          <h2 className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            YRC Strides
          </h2>
          <ol className="mt-6 flex gap-x-8 gap-y-4 overflow-x-auto md:flex-wrap md:overflow-visible">
            {entries.map((entry, index) => (
              <li
                key={`${index}-${entry.firstName}`}
                className="flex shrink-0 items-center gap-2.5"
              >
                <span className="text-caption font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <Avatar size="sm">
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
                <span className="text-body-small font-semibold">
                  {entry.firstName}
                </span>
                <span className="text-caption font-bold text-yrc-accent uppercase">
                  {entry.totalPoints} strides
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex shrink-0 flex-col gap-3 lg:items-end">
          {stats && (
            <p className="text-body-small text-muted-foreground">
              {stats.members} members · {stats.totalStrides} strides ·{" "}
              {stats.totalCheckins} check-ins
            </p>
          )}
          <Link
            href="/community"
            className="group flex w-fit items-center gap-1.5 text-caption font-bold tracking-[0.2em] text-yrc-accent uppercase"
          >
            See the full board
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export { StridesStrip };

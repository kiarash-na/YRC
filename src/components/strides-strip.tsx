import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";

import { Reveal } from "@/components/reveal";
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
      className={cn("border-b border-border bg-muted/40 py-14 md:py-16", className)}
    >
      <Reveal className="container grid gap-8 md:grid-cols-12 md:gap-10">
        <div className="flex flex-col gap-3 md:col-span-3">
          <h2 className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            YRC Strides
          </h2>
          {stats && (
            <p className="text-body-small text-muted-foreground">
              {stats.members} members · {stats.totalStrides} strides ·{" "}
              {stats.totalCheckins} check-ins
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6 md:col-span-9 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <ol className="-mx-4 flex gap-x-8 gap-y-4 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
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

          <Link
            href="/community"
            className="group flex w-fit shrink-0 items-center gap-1.5 text-caption font-bold tracking-[0.2em] text-yrc-accent uppercase"
          >
            See the full board
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
};

export { StridesStrip };

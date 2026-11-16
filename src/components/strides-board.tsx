import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { Reveal } from "@/components/reveal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getCommunityStats,
  getLeaderboard,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { CountUp } from "@/components/count-up";

/*
 * Homepage YRC Strides board — podium (top 3) + ranked rows, structured after
 * a "team leaderboard" slide but drawn in the YRC language: flat bordered
 * surfaces, 3px radius (rows are NOT pills), Poppins scale, the yellow accent
 * reserved for 1st place and the strides figures. Only public-safe fields
 * from get_leaderboard() are shown (first name, avatar, events, strides).
 * The full board lives on /community.
 */

const BOARD_SIZE = 7; // 3 on the podium + 4 rows
const rankLabel = (rank: number) => String(rank).padStart(2, "0");

/** Grid shared by the column header and every row so they always align. */
const ROW_GRID =
  "grid grid-cols-[2rem_minmax(0,1fr)_4.5rem] items-center gap-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_5rem_6rem] md:grid-cols-[3rem_minmax(0,1fr)_8rem_8rem] md:gap-6";

interface StridesBoardProps {
  className?: string;
}

const StridesBoard = async ({ className }: StridesBoardProps) => {
  const [entries, stats] = await Promise.all([
    getLeaderboard(BOARD_SIZE),
    getCommunityStats(),
  ]);
  if (entries.length === 0) return null;

  const podium = entries.slice(0, 3);
  const rows = entries.slice(3);

  return (
    <section
      className={cn("border-b border-border bg-muted/40 py-24 md:py-32", className)}
    >
      <div className="container">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <h2 className="text-h1 font-bold uppercase md:text-display">
            YRC Strides
          </h2>
          {stats && (
            <p className="text-body-small text-muted-foreground md:text-body">
              {stats.members} members · {stats.totalStrides} strides ·{" "}
              {stats.totalCheckins} check-ins
            </p>
          )}
        </Reveal>

        {/* Podium: 2nd · 1st · 3rd on md+, 1st first when stacked */}
        <ol className="mx-auto mt-14 grid max-w-5xl gap-4 md:mt-20 md:grid-cols-3 md:items-end md:gap-6">
          {podium.map((entry, index) => (
            <PodiumCard key={`${index}-${entry.firstName}`} entry={entry} rank={index + 1} />
          ))}
        </ol>

        {rows.length > 0 && (
          <Reveal delay={120} className="mx-auto mt-14 max-w-5xl md:mt-16">
            <div
              aria-hidden="true"
              className={cn(
                ROW_GRID,
                "px-4 pb-3 text-caption font-bold tracking-[0.15em] md:tracking-[0.2em] text-muted-foreground uppercase md:px-6",
              )}
            >
              <span>#</span>
              <span>Member</span>
              {/* Events drops on phones so names get the room */}
              <span className="hidden text-right sm:block md:text-center">
                Events
              </span>
              <span className="text-right">Strides</span>
            </div>
            <ol className="flex flex-col gap-3">
              {rows.map((entry, index) => {
                const rank = index + 4;
                return (
                  <li
                    key={`${rank}-${entry.firstName}`}
                    className={cn(
                      ROW_GRID,
                      "rounded-xl border border-border bg-background px-4 py-3 md:px-6 md:py-4",
                    )}
                  >
                    <span className="text-body-small font-bold text-muted-foreground">
                      {rankLabel(rank)}
                    </span>
                    <span className="flex min-w-0 items-center gap-3">
                      <MemberAvatar entry={entry} className="size-10 md:size-11" />
                      <span className="truncate text-body font-semibold md:text-h4">
                        {entry.firstName}
                      </span>
                    </span>
                    <span className="hidden text-right text-body-small text-muted-foreground sm:block md:text-center md:text-body">
                      {entry.eventsAttended}
                    </span>
                    <span className="text-right text-body font-semibold md:text-h4">
                      <CountUp value={entry.totalPoints} />
                    </span>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        )}

        <Reveal className="mt-10 flex justify-center md:mt-14">
          <Link
            href="/community"
            className="group flex w-fit items-center gap-1.5 text-caption font-bold tracking-[0.2em] text-yrc-accent uppercase"
          >
            See the full board
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: number;
}

const PodiumCard = ({ entry, rank }: PodiumCardProps) => {
  const first = rank === 1;
  return (
    <li
      className={cn(
        // Visual order 2 · 1 · 3 on md+; DOM order stays 1 · 2 · 3 for readers.
        rank === 1 && "md:order-2",
        rank === 2 && "md:order-1",
        rank === 3 && "md:order-3",
      )}
    >
      <Reveal delay={first ? 0 : 120}>
        <div
          className={cn(
            "flex flex-col items-center gap-4 rounded-xl border bg-background px-6 text-center",
            // 1st place is a dark card: yellow on white fails contrast,
            // yellow on the dark token set reads clearly.
            first
              ? "dark border-yrc-accent py-10 text-foreground md:py-14"
              : "border-border py-8 md:py-10",
          )}
        >
          <span
            className={cn(
              "text-caption font-bold tracking-[0.3em] uppercase",
              first ? "text-yrc-accent" : "text-muted-foreground",
            )}
          >
            {rankLabel(rank)}
          </span>
          <MemberAvatar
            entry={entry}
            className={cn(
              first ? "size-24 md:size-28" : "size-20",
              first && "ring-2 ring-yrc-accent ring-offset-4 ring-offset-background",
            )}
          />
          <div className="flex flex-col gap-1">
            <p className="text-h4 font-semibold uppercase md:text-h3">
              {entry.firstName}
            </p>
            <p className="text-caption font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {entry.eventsAttended}{" "}
              {entry.eventsAttended === 1 ? "event" : "events"}
            </p>
          </div>
          <p
            className={cn(
              "font-bold",
              first ? "text-h1 text-yrc-accent" : "text-h2",
            )}
          >
            <CountUp value={entry.totalPoints} />
            <span className="ml-1.5 text-caption font-bold tracking-[0.2em] text-muted-foreground uppercase">
              strides
            </span>
          </p>
        </div>
      </Reveal>
    </li>
  );
};

const MemberAvatar = ({
  entry,
  className,
}: {
  entry: LeaderboardEntry;
  className?: string;
}) => (
  <Avatar className={className}>
    {entry.avatarUrl && (
      <AvatarImage src={entry.avatarUrl} alt={`${entry.firstName}'s avatar`} />
    )}
    <AvatarFallback className="text-h4 font-semibold">
      {entry.firstName.charAt(0).toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

export { StridesBoard };

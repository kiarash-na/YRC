import { unstable_cache } from "next/cache";

import { createPublicClient } from "@/lib/supabase/public";

/**
 * YRC Strides leaderboard data layer — reads via the public SECURITY DEFINER
 * RPCs (get_leaderboard / get_community_stats), which already exclude
 * opted-out and zero-activity members. Never throws: a missing/unreachable
 * Supabase yields an empty board ([] or null) so pages degrade gracefully.
 *
 * Both readers are wrapped in unstable_cache (5 min) so the /community board
 * and the homepage strip share one cache across requests and deployments.
 */

export interface LeaderboardEntry {
  firstName: string;
  avatarUrl: string | null;
  totalPoints: number;
  eventsAttended: number;
}

export interface CommunityStats {
  members: number;
  totalStrides: number;
  totalCheckins: number;
}

interface LeaderboardRow {
  first_name: string | null;
  avatar_url: string | null;
  total_points: number;
  events_attended: number;
}

interface CommunityStatsRow {
  members: number;
  total_strides: number;
  total_checkins: number;
}

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

async function fetchLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  if (!configured()) return []; // Supabase not configured yet (e.g. fresh preview env)
  try {
    const { data, error } = await createPublicClient().rpc("get_leaderboard", {
      limit_count: limit,
    });

    if (error) {
      console.error("Failed to load leaderboard from Supabase:", error.message);
      return [];
    }
    return ((data as LeaderboardRow[] | null) ?? []).map((row) => ({
      firstName: row.first_name?.trim() || "YRC member",
      avatarUrl: row.avatar_url,
      totalPoints: Number(row.total_points),
      eventsAttended: Number(row.events_attended),
    }));
  } catch (error) {
    console.error("Failed to load leaderboard from Supabase:", error);
    return [];
  }
}

async function fetchCommunityStats(): Promise<CommunityStats | null> {
  if (!configured()) return null;
  try {
    const { data, error } = await createPublicClient().rpc(
      "get_community_stats",
    );

    if (error) {
      console.error("Failed to load community stats from Supabase:", error.message);
      return null;
    }
    // A table-returning RPC comes back as a one-element array.
    const rows = (data as CommunityStatsRow[] | null) ?? [];
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) return null;
    return {
      members: Number(row.members),
      totalStrides: Number(row.total_strides),
      totalCheckins: Number(row.total_checkins),
    };
  } catch (error) {
    console.error("Failed to load community stats from Supabase:", error);
    return null;
  }
}

const cachedLeaderboard = unstable_cache(
  fetchLeaderboard,
  ["yrc-leaderboard"], // the limit argument is part of the cache key automatically
  { revalidate: 300 },
);

const cachedCommunityStats = unstable_cache(
  fetchCommunityStats,
  ["yrc-community-stats"],
  { revalidate: 300 },
);

/** Top members by strides, then attendance. Cached for 5 minutes. */
export function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  return cachedLeaderboard(limit);
}

/** Community-wide totals for the homepage strip. Cached for 5 minutes. */
export function getCommunityStats(): Promise<CommunityStats | null> {
  return cachedCommunityStats();
}

import type { Metadata } from "next";

import { CommunityChallenges } from "@/components/community-challenges";
import { CommunityGallery } from "@/components/community-gallery";
import { CommunityHero } from "@/components/community-hero";
import { CommunityPhilosophy } from "@/components/community-philosophy";
import { JoinCta } from "@/components/join-cta";
import { StravaClub } from "@/components/strava-club";
import { StridesLeaderboard } from "@/components/strides-leaderboard";
import { WhoIsYrcFor } from "@/components/who-is-yrc-for";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Community — YRC",
  description:
    "Yas Rise Community — who it's for, what it believes, how to take part and where it's heading. Every pace welcome.",
};

// ISR: the Strides board refreshes every 5 min (its data layer caches on the
// same cadence, so the leaderboard + homepage strip share one Supabase read).
export const revalidate = 300;

export default function CommunityPage() {
  return (
    <main id="main" className="flex-1">
      <CommunityHero />
      <Reveal>
        <CommunityPhilosophy />
      </Reveal>
      <Reveal>
        <WhoIsYrcFor />
      </Reveal>
      <Reveal>
        <StridesLeaderboard />
      </Reveal>
      <Reveal>
        <CommunityChallenges />
      </Reveal>
      <Reveal>
        <CommunityGallery />
      </Reveal>
      <Reveal>
        <StravaClub />
      </Reveal>
      <Reveal>
        <JoinCta />
      </Reveal>
    </main>
  );
}

import type { Metadata } from "next";

import { CommunityChallenges } from "@/components/community-challenges";
import { CommunityGallery } from "@/components/community-gallery";
import { CommunityHero } from "@/components/community-hero";
import { CommunityPhilosophy } from "@/components/community-philosophy";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { StravaClub } from "@/components/strava-club";
import { StridesLeaderboard } from "@/components/strides-leaderboard";
import { WhoIsYrcFor } from "@/components/who-is-yrc-for";
import { Reveal } from "@/components/reveal";
import { getSlotsMedia } from "@/lib/site-media-db";

export const metadata: Metadata = {
  title: "Community — YRC",
  description:
    "Yas Rise Community — who it's for, what it believes, how to take part and where it's heading. Every pace welcome.",
};

// ISR: the Strides board refreshes every 5 min (its data layer caches on the
// same cadence, so the leaderboard + homepage strip share one Supabase read).
export const revalidate = 300;

export default async function CommunityPage() {
  const media = await getSlotsMedia(["community.hero", "community.who", "community.challenges", "community.gallery"]);
  return (
    <main id="main" className="flex-1">
      <CommunityHero media={media["community.hero"]} />
      <Reveal>
        <CommunityPhilosophy />
      </Reveal>
      <Reveal>
        <WhoIsYrcFor media={media["community.who"]} />
      </Reveal>
      <Reveal>
        <StridesLeaderboard />
      </Reveal>
      <Reveal>
        <CommunityChallenges media={media["community.challenges"]} />
      </Reveal>
      <Reveal>
        <CommunityGallery photos={media["community.gallery"]} />
      </Reveal>
      <Reveal>
        <StravaClub />
      </Reveal>
      <Reveal>
        <NewsletterSignup />
      </Reveal>
    </main>
  );
}

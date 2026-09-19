import type { Metadata } from "next";

import { CommunityChallenges } from "@/components/community-challenges";
import { CommunityGallery } from "@/components/community-gallery";
import { CommunityHero } from "@/components/community-hero";
import { CommunityPhilosophy } from "@/components/community-philosophy";
import { JoinCta } from "@/components/join-cta";
import { StravaClub } from "@/components/strava-club";
import { WhoIsYrcFor } from "@/components/who-is-yrc-for";
import { YrcPoints } from "@/components/yrc-points";

export const metadata: Metadata = {
  title: "Community — YRC",
  description:
    "Yas Rise Community — who it's for, what it believes, how to take part and where it's heading. Every pace welcome.",
};

export default function CommunityPage() {
  return (
    <main className="flex-1">
      <CommunityHero />
      <CommunityPhilosophy />
      <WhoIsYrcFor />
      <YrcPoints />
      <CommunityChallenges />
      <CommunityGallery />
      <StravaClub />
      <JoinCta />
    </main>
  );
}

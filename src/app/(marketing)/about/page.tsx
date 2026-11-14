import type { Metadata } from "next";

import { AboutHero } from "@/components/about-hero";
import { AboutPhilosophy } from "@/components/about-philosophy";
import { JoinCta } from "@/components/join-cta";
import { LivedJourney } from "@/components/lived-journey";
import { OurStory } from "@/components/our-story";
import { OurValues } from "@/components/our-values";
import { ServicesDefinition } from "@/components/services-definition";
import { Team } from "@/components/team";
import { WithoutBorders } from "@/components/without-borders";

// FounderSection and ShapersSection exist (src/components/) but stay OFF the
// page until the real founder/shapers/bio copy arrives — no placeholder text
// ships. Re-insert after OurStory / after ServicesDefinition when ready.

export const metadata: Metadata = {
  title: "About — YRC",
  description:
    "The story, philosophy and values behind Yas Rise Community — a running and endurance community built around the journey, not just the finish line.",
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <AboutHero />
      <OurStory />
      <LivedJourney />
      <AboutPhilosophy />
      <OurValues />
      <ServicesDefinition />
      <WithoutBorders />
      <Team />
      <JoinCta />
    </main>
  );
}

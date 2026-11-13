import type { Metadata } from "next";

import { AboutHero } from "@/components/about-hero";
import { AboutPhilosophy } from "@/components/about-philosophy";
import { FounderSection } from "@/components/founder-section";
import { JoinCta } from "@/components/join-cta";
import { LivedJourney } from "@/components/lived-journey";
import { OurStory } from "@/components/our-story";
import { OurValues } from "@/components/our-values";
import { ServicesDefinition } from "@/components/services-definition";
import { ShapersSection } from "@/components/shapers-section";
import { Team } from "@/components/team";
import { WithoutBorders } from "@/components/without-borders";

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
      <FounderSection />
      <LivedJourney />
      <AboutPhilosophy />
      <OurValues />
      <ServicesDefinition />
      <ShapersSection />
      <WithoutBorders />
      <Team />
      <JoinCta />
    </main>
  );
}

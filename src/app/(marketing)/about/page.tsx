import type { Metadata } from "next";

import { AboutHero } from "@/components/about-hero";
import { AboutPhilosophy } from "@/components/about-philosophy";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { LivedJourney } from "@/components/lived-journey";
import { OurStory } from "@/components/our-story";
import { OurValues } from "@/components/our-values";
import { ServicesDefinition } from "@/components/services-definition";
import { Team } from "@/components/team";
import { WithoutBorders } from "@/components/without-borders";
import { Reveal } from "@/components/reveal";
import { getSlotsMedia } from "@/lib/site-media-db";

// FounderSection and ShapersSection exist (src/components/) but stay OFF the
// page until the real founder/shapers/bio copy arrives — no placeholder text
// ships. Re-insert after OurStory / after ServicesDefinition when ready.

export const metadata: Metadata = {
  title: "About — YRC",
  description:
    "The story, philosophy and values behind Yas Rise Community — a running and endurance community built around the journey, not just the finish line.",
};

// Page media comes from /admin/media; saves refresh it on demand.
export const revalidate = 900;

export default async function AboutPage() {
  const media = await getSlotsMedia(["about.hero", "about.story", "about.journey", "about.borders", "about.coaches"]);
  return (
    <main id="main" className="flex-1">
      <AboutHero media={media["about.hero"]} />
      <Reveal>
        <OurStory media={media["about.story"]} />
      </Reveal>
      <Reveal>
        <LivedJourney media={media["about.journey"]} />
      </Reveal>
      <Reveal>
        <AboutPhilosophy />
      </Reveal>
      <Reveal>
        <OurValues />
      </Reveal>
      <Reveal>
        <ServicesDefinition />
      </Reveal>
      <Reveal>
        <WithoutBorders media={media["about.borders"]} />
      </Reveal>
      <Reveal>
        <Team media={media["about.coaches"]} />
      </Reveal>
      <Reveal>
        <NewsletterSignup />
      </Reveal>
    </main>
  );
}

import { Hero } from "@/components/hero";
import { UpcomingEvent } from "@/components/upcoming-event";
import { About } from "@/components/about";
import { Experiences } from "@/components/experiences";
import { Philosophy } from "@/components/philosophy";
import { Story } from "@/components/story";
import { Gallery } from "@/components/gallery";
import { JoinCta } from "@/components/join-cta";
import { upcomingEvent } from "@/data/events";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <UpcomingEvent event={upcomingEvent} />
      <About />
      <Experiences />
      <Philosophy />
      <Story />
      <Gallery />
      <JoinCta />
    </main>
  );
}

import { Hero } from "@/components/hero";
import { UpcomingEvent } from "@/components/upcoming-event";
import { About } from "@/components/about";
import { Experiences } from "@/components/experiences";
import { Philosophy } from "@/components/philosophy";
import { Story } from "@/components/story";
import { Gallery } from "@/components/gallery";
import { JoinCta } from "@/components/join-cta";
import { getUpcomingEvents, toEventSummary } from "@/lib/events-db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [nextEvent] = (await getUpcomingEvents()).map(toEventSummary);

  return (
    <main className="flex-1">
      <Hero />
      {nextEvent ? <UpcomingEvent event={nextEvent} /> : null}
      <About />
      <Experiences />
      <Philosophy />
      <Story />
      <Gallery />
      <JoinCta />
    </main>
  );
}

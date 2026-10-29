import { Hero } from "@/components/hero";
import { UpcomingEvent } from "@/components/upcoming-event";
import { About } from "@/components/about";
import { Experiences } from "@/components/experiences";
import { Philosophy } from "@/components/philosophy";
import { Story } from "@/components/story";
import { Gallery } from "@/components/gallery";
import { JoinCta } from "@/components/join-cta";
import { getUpcomingEvents, toEventSummary } from "@/lib/events-db";

// ISR: matches the 15-min event-lifecycle cron cadence; admin edits
// revalidate on demand via revalidateEventPaths().
export const revalidate = 900;

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

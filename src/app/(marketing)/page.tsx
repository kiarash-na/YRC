import { Hero } from "@/components/hero";
import { WeeklyStrip } from "@/components/weekly-strip";
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
  const upcoming = (await getUpcomingEvents()).map(toEventSummary);
  // Weekly recurring series get their own strip under the hero, so the
  // highlight card below always shows the soonest one-off event instead.
  const weekly = upcoming.filter((event) => event.recurrence === "weekly");
  const weeklySlugs = new Set(weekly.map((event) => event.slug));
  const nextEvent = upcoming.find((event) => !weeklySlugs.has(event.slug));

  return (
    <main className="flex-1">
      <Hero />
      {weekly.length > 0 ? <WeeklyStrip events={weekly} /> : null}
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

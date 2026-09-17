import { Hero } from "@/components/hero";
import { Pillars } from "@/components/pillars";
import { UpcomingEvent } from "@/components/upcoming-event";
import { upcomingEvent } from "@/data/events";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <UpcomingEvent event={upcomingEvent} />
      <Pillars />
    </main>
  );
}

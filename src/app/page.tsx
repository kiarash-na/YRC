import { Hero } from "@/components/hero";
import { Pillars } from "@/components/pillars";
import { UpcomingEvent } from "@/components/upcoming-event";
import { About } from "@/components/about";
import { Experiences } from "@/components/experiences";
import { Philosophy } from "@/components/philosophy";
import { upcomingEvent } from "@/data/events";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <UpcomingEvent event={upcomingEvent} />
      <Pillars />
      <About />
      <Experiences />
      <Philosophy />
    </main>
  );
}

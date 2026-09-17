import type { Metadata } from "next";

import { EventsHero } from "@/components/events-hero";
import { UpcomingEvents } from "@/components/upcoming-events";
import { InternationalEvents } from "@/components/international-events";
import { TrainingCamps } from "@/components/training-camps";
import { upcomingEvents } from "@/data/events";

export const metadata: Metadata = {
  title: "Events — YRC",
  description:
    "Community runs, international races, training camps and experiences built around running and endurance sports.",
};

export default function EventsPage() {
  return (
    <main className="flex-1">
      <EventsHero />
      <UpcomingEvents events={upcomingEvents} />
      <InternationalEvents />
      <TrainingCamps />
    </main>
  );
}

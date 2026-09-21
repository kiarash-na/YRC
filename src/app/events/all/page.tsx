import type { Metadata } from "next";

import { EventsBrowser } from "@/components/events-browser";
import { JoinCta } from "@/components/join-cta";
import { getAllEvents, toEventSummary } from "@/lib/content";

export const metadata: Metadata = {
  title: "All Events — YRC",
  description:
    "Every YRC event in one place — upcoming and past community runs, races, training camps and social experiences.",
};

export default function AllEventsPage() {
  const events = getAllEvents().map(toEventSummary);

  return (
    <main className="flex-1">
      <section className="py-32">
        <div className="container">
          <div className="mx-auto flex max-w-6xl flex-col gap-14">
            <div className="flex max-w-3xl flex-col gap-7">
              <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
                Calendar
              </p>
              <h1 className="text-h1 md:text-display">All Events</h1>
              <p className="text-body-small text-muted-foreground md:text-body">
                Every YRC experience, upcoming and past. Filter by date,
                category or city — or search for something specific.
              </p>
            </div>

            <EventsBrowser events={events} />
          </div>
        </div>
      </section>
      <JoinCta />
    </main>
  );
}

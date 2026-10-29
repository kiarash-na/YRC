import type { Metadata } from "next";

import { EventsBrowser } from "@/components/events-browser";
import { JoinCta } from "@/components/join-cta";
import { getPastEvents, toEventSummary } from "@/lib/events-db";

export const metadata: Metadata = {
  title: "Past Events — YRC",
  description:
    "Every YRC event we've already run — community runs, races, training camps and social experiences from the archive.",
};

export const dynamic = "force-dynamic";

export default async function PastEventsPage() {
  const events = (await getPastEvents()).map(toEventSummary);

  return (
    <main className="flex-1">
      <section className="py-32">
        <div className="container">
          <div className="mx-auto flex max-w-6xl flex-col gap-14">
            <div className="flex max-w-3xl flex-col gap-7">
              <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
                Archive
              </p>
              <h1 className="text-h1 md:text-display">Past Events</h1>
              <p className="text-body-small text-muted-foreground md:text-body">
                Where we&apos;ve been — every finished YRC experience, most
                recent first.
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

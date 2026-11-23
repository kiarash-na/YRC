import { Hero } from "@/components/hero";
import { WeeklyStrip } from "@/components/weekly-strip";
import { StridesBoard } from "@/components/strides-board";
import { UpcomingEvent } from "@/components/upcoming-event";
import { About } from "@/components/about";
import { Experiences } from "@/components/experiences";
import { Philosophy } from "@/components/philosophy";
import { Story } from "@/components/story";
import { Gallery } from "@/components/gallery";
import { HomeEvents } from "@/components/home-events";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getUpcomingEvents, splitWeekly, toEventSummary } from "@/lib/events-db";
import { getSlotsMedia } from "@/lib/site-media-db";

// ISR: matches the 15-min event-lifecycle cron cadence; admin edits
// revalidate on demand via revalidateEventPaths().
export const revalidate = 900;

export default async function Home() {
  const media = await getSlotsMedia(["home.hero.reel", "home.hero.still", "home.about", "home.experiences", "home.story", "home.gallery"]);
  const upcoming = (await getUpcomingEvents()).map(toEventSummary);
  // Weekly series get their own strip under the hero (one row per series),
  // so the highlight card and the closing grid show one-off events only.
  const { oneOff, weekly } = splitWeekly(upcoming);
  const nextEvent = oneOff[0];
  // Closing card grid: the next events after the highlighted one (a cover's
  // view-transition name may appear only once per page).
  const moreEvents = oneOff.slice(1, 4);

  return (
    <main id="main" className="flex-1">
      <Hero media={{ reel: media["home.hero.reel"], still: media["home.hero.still"] }} />
      {weekly.length > 0 ? <WeeklyStrip events={weekly} /> : null}
      <StridesBoard />
      {nextEvent ? <UpcomingEvent event={nextEvent} /> : null}
      <About media={media["home.about"]} />
      <Experiences media={media["home.experiences"]} />
      <Philosophy />
      <Story media={media["home.story"]} />
      <Gallery media={media["home.gallery"]} />
      {moreEvents.length > 0 ? <HomeEvents events={moreEvents} /> : null}
      <NewsletterSignup />
    </main>
  );
}

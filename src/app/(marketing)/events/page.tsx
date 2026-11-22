import type { Metadata } from "next";

import { EventsHero } from "@/components/events-hero";
import { UpcomingEvents } from "@/components/upcoming-events";
import { InternationalEvents } from "@/components/international-events";
import { TrainingCamps } from "@/components/training-camps";
import { StructuredCourses } from "@/components/structured-courses";
import { TrainingProcess } from "@/components/training-process";
import { StrengthMobility } from "@/components/strength-mobility";
import { CourseDetails } from "@/components/course-details";
import { Faq } from "@/components/faq";
import { getContentBlock } from "@/lib/content-blocks";
import type { CourseDetail, FaqItem } from "@/lib/content-shared";
import { getUpcomingEvents, splitWeekly, toEventSummary } from "@/lib/events-db";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Events — YRC",
  description:
    "Community runs, international races, training camps and experiences built around running and endurance sports.",
};

// ISR: matches the 15-min event-lifecycle cron; admin edits revalidate on demand.
export const revalidate = 900;

export default async function EventsPage() {
  const { oneOff, weekly } = splitWeekly((await getUpcomingEvents()).map(toEventSummary));
  const [courseDetails, faqs] = await Promise.all([
    getContentBlock<CourseDetail>("events.course_details"),
    getContentBlock<FaqItem>("events.faqs"),
  ]);

  return (
    <main id="main" className="flex-1">
      <EventsHero />
      <UpcomingEvents events={oneOff.slice(0, 3)} weekly={weekly} />
      <Reveal>
        <InternationalEvents />
      </Reveal>
      <Reveal>
        <TrainingCamps />
      </Reveal>
      <Reveal>
        <StructuredCourses />
      </Reveal>
      <Reveal>
        <TrainingProcess />
      </Reveal>
      <Reveal>
        <StrengthMobility />
      </Reveal>
      <Reveal>
        <CourseDetails details={courseDetails} />
      </Reveal>
      <Reveal>
        <Faq items={faqs} />
      </Reveal>
    </main>
  );
}

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
import { courseDetails, faqs } from "@/data/events";
import { getUpcomingEvents, toEventSummary } from "@/lib/content";

export const metadata: Metadata = {
  title: "Events — YRC",
  description:
    "Community runs, international races, training camps and experiences built around running and endurance sports.",
};

export default function EventsPage() {
  const upcoming = getUpcomingEvents().slice(0, 3).map(toEventSummary);

  return (
    <main className="flex-1">
      <EventsHero />
      <UpcomingEvents events={upcoming} />
      <InternationalEvents />
      <TrainingCamps />
      <StructuredCourses />
      <TrainingProcess />
      <StrengthMobility />
      <CourseDetails details={courseDetails} />
      <Faq items={faqs} />
    </main>
  );
}

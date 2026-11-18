import { ViewTransition } from "react";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CoverImage } from "@/components/cover-image";
import { Reveal } from "@/components/reveal";
import { IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit";
import { EventDetailsBody, EventOverviewText } from "@/components/event-body";
import { EventDetails, EventOverview } from "@/components/event-brief";
import { EventGallery } from "@/components/event-gallery";
import { EventRegister } from "@/components/event-register";
import { EventSecondaryActions } from "@/components/event-actions";
import { EventRouteMap } from "@/components/event-route-map";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Badge } from "@/components/ui/badge";
import { EVENT_CATEGORY_LABELS, formatDate } from "@/lib/content-shared";
import { getAllEvents, getEventBySlug } from "@/lib/events-db";

const EYEBROW = "mb-6 text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase";

// ISR: matches the 15-min event-lifecycle cron; admin edits revalidate on demand.
export const revalidate = 900;

/** Prerender known events at build; new/duplicated slugs render on-demand (dynamicParams default). */
export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event not found — YRC" };
  }

  // Weekly copies share a title; the date keeps each page (and tab) distinct.
  const title =
    event.recurrence === "weekly"
      ? `${event.title} · ${formatDate(event.date)} — YRC`
      : `${event.title} — YRC`;

  return {
    title,
    description: event.excerpt,
    openGraph: {
      title,
      description: event.excerpt,
      type: "article",
      url: `/events/${event.slug}`,
      images: IMAGEKIT_URL_ENDPOINT
        ? [`${IMAGEKIT_URL_ENDPOINT}${event.cover}?tr=w-1200,h-630,fo-auto`]
        : undefined,
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const dateLabel = event.endDate
    ? `${formatDate(event.date)} – ${formatDate(event.endDate)}`
    : formatDate(event.date);

  return (
    <main id="main" className="flex-1">
      <section className="bg-background py-32">
        <div className="container">
          <div className="mx-auto flex max-w-6xl flex-col gap-16">
            <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:gap-16">
              <aside className="yrc-hero-in top-10 h-fit flex-shrink-0 lg:sticky lg:w-[300px] xl:w-[400px]">
                <Link
                  className="mb-7 flex w-fit items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-primary"
                  href="/events/all"
                >
                  <ChevronLeft className="size-4" />
                  Back to Events
                </Link>
                <Badge
                  variant="secondary"
                  className="text-caption mb-6 h-auto rounded-md px-2.5 py-1 font-bold tracking-[0.2em] uppercase"
                >
                  {EVENT_CATEGORY_LABELS[event.category] ?? event.category}
                </Badge>
                <h1 className="text-h2 mb-7 text-balance md:text-h1">
                  {event.title}
                </h1>
                <p className="text-body-small text-muted-foreground md:text-body">
                  {event.excerpt}
                </p>
                {/* Secondary actions: small buttons on one line under the description. */}
                <EventSecondaryActions
                  slug={event.slug}
                  registrationUrl={event.registrationUrl}
                  isPast={event.isPast}
                  className="pt-5 pb-8"
                />
                <div className="flex flex-col gap-2 border-t border-border pt-6">
                  <p className="text-body-small font-semibold">{dateLabel}</p>
                  <p className="text-caption text-muted-foreground uppercase">
                    {event.location} · {event.city}
                  </p>
                </div>
                {/* The one primary action on every upcoming event. */}
                {!event.isPast && (
                  <div className="pt-8">
                    <EventRegister eventId={event.id} eventSlug={event.slug} eventTitle={event.title} />
                  </div>
                )}
              </aside>

              <article className="min-w-0 flex-1">
                {/* Morph target for the event card / home feature image. */}
                <ViewTransition name={`event-cover-${event.slug}`} share="yrc-morph" default="none">
                  <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                    <CoverImage
                      src={event.cover}
                      alt={event.title}
                      sizes="(min-width: 1280px) 720px, (min-width: 1024px) 60vw, 100vw"
                      className="object-cover object-center"
                    />
                  </div>
                </ViewTransition>

                {/* Overview: the at-a-glance icon box, then the short lead. */}
                <section aria-labelledby="event-overview-heading">
                  <h2 id="event-overview-heading" className={EYEBROW}>
                    Overview
                  </h2>
                  <EventOverview event={event} />
                  {event.overview && <EventOverviewText source={event.overview} />}
                </section>

                {event.content.trim() && (
                  <Reveal>
                    <section aria-labelledby="event-details-heading" className="mt-16 md:mt-20">
                      <h2 id="event-details-heading" className={EYEBROW}>
                        Explore the details
                      </h2>
                      <EventDetailsBody source={event.content} />
                    </section>
                  </Reveal>
                )}

                <Reveal>
                  <EventDetails event={event} />
                </Reveal>

                {event.routeLine && (
                  <Reveal>
                    <EventRouteMap
                      line={event.routeLine}
                      gpxUrl={event.routeGpxUrl}
                      eventSlug={event.slug}
                    />
                  </Reveal>
                )}
              </article>
            </div>
          </div>
        </div>
      </section>
      {event.gallery && event.gallery.length > 0 && (
        <EventGallery items={event.gallery} eventTitle={event.title} className="border-t border-border" />
      )}
      <NewsletterSignup />
    </main>
  );
}

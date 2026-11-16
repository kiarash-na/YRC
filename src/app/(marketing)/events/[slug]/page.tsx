import type { Metadata } from "next";
import { ArrowUpRight, CalendarPlus, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";

import { CoverImage } from "@/components/cover-image";
import { EventDetails, EventOverview } from "@/components/event-brief";
import { EventRegister } from "@/components/event-register";
import { JoinCta } from "@/components/join-cta";
import { mdxComponents } from "@/components/mdx";
import { Badge } from "@/components/ui/badge";
import { EVENT_CATEGORY_LABELS, formatDate } from "@/lib/content-shared";
import { getAllEvents, getEventBySlug } from "@/lib/events-db";

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

  return {
    title: `${event.title} — YRC`,
    description: event.excerpt,
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

  const { content } = await compileMDX({
    source: event.content,
    components: mdxComponents,
  });

  const dateLabel = event.endDate
    ? `${formatDate(event.date)} – ${formatDate(event.endDate)}`
    : formatDate(event.date);

  return (
    <main className="flex-1">
      <section className="bg-background py-32">
        <div className="container">
          <div className="mx-auto flex max-w-6xl flex-col gap-16">
            <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:gap-16">
              <aside className="top-10 h-fit flex-shrink-0 lg:sticky lg:w-[300px] xl:w-[400px]">
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
                <p className="text-body-small mb-8 text-muted-foreground md:text-body">
                  {event.excerpt}
                </p>
                <div className="flex flex-col gap-2 border-t border-border pt-6">
                  <p className="text-body-small font-semibold">{dateLabel}</p>
                  <p className="text-caption text-muted-foreground uppercase">
                    {event.location} · {event.city}
                  </p>
                </div>
                {/* One primary action; everything else is a quiet link. */}
                {!event.isPast && (
                  <div className="pt-8">
                    <EventRegister eventId={event.id} eventSlug={event.slug} />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-5">
                  <a
                    href={`/events/${event.slug}/calendar.ics`}
                    download
                    className="inline-flex items-center gap-1.5 text-body-small font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    <CalendarPlus className="size-4" aria-hidden="true" />
                    Add to calendar
                  </a>
                  {!event.isPast && event.registrationUrl && (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 text-body-small font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      Official registration
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </aside>

              <article className="min-w-0 flex-1">
                <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                  <CoverImage
                    src={event.cover}
                    alt={event.title}
                    sizes="(min-width: 1280px) 720px, (min-width: 1024px) 60vw, 100vw"
                    className="object-cover object-center"
                  />
                </div>

                <EventOverview event={event} />

                <div className="flex flex-col">{content}</div>

                <EventDetails event={event} />
              </article>
            </div>
          </div>
        </div>
      </section>
      <JoinCta />
    </main>
  );
}

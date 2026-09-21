import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";

import { CoverImage } from "@/components/cover-image";
import { JoinCta } from "@/components/join-cta";
import { mdxComponents } from "@/components/mdx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, getAllEvents, getEventBySlug } from "@/lib/content";

export function generateStaticParams() {
  return getAllEvents().map((event) => ({ slug: event.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

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
  const event = getEventBySlug(slug);

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
                  {event.category}
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
                {event.registrationUrl && (
                  <div className="pt-6">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      render={<a href={event.registrationUrl} />}
                      nativeButton={false}
                    >
                      Register
                    </Button>
                  </div>
                )}
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

                <div className="flex flex-col">{content}</div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <JoinCta />
    </main>
  );
}

import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { YrcEvent } from "@/data/events";

interface UpcomingEventProps {
  event: YrcEvent;
  className?: string;
}

const UpcomingEvent = ({ event, className }: UpcomingEventProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col justify-center gap-7 md:text-center">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Upcoming Event
          </p>
          <h2 className="text-h3 md:text-h1">Next on the calendar</h2>
        </div>

        <Card className="group mx-auto mt-14 max-w-5xl gap-0 border-none bg-background p-0 shadow-none ring-1 ring-foreground/10">
          <CardContent className="grid gap-0 p-0 lg:grid-cols-2">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-t-xl bg-muted lg:aspect-auto lg:min-h-96 lg:rounded-t-none lg:rounded-l-xl">
              <Image
                src={event.image.src}
                alt={event.image.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                queryParameters={{ updatedAt: event.image.updatedAt }}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col gap-6 p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className="h-6 px-3 text-caption font-bold tracking-[0.2em] uppercase"
                >
                  {event.category}
                </Badge>
                <p className="text-caption font-medium tracking-[0.2em] text-muted-foreground uppercase">
                  {event.date} · {event.time}
                </p>
              </div>

              <h3 className="text-h2 md:text-h1">{event.title}</h3>

              <p className="text-body-small font-semibold tracking-[0.15em] text-yrc-accent uppercase">
                {event.location} · {event.distance} · {event.level}
              </p>

              <p className="text-body text-muted-foreground">
                {event.description}
              </p>

              <div className="mt-auto pt-2">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  render={<a href={event.href} />}
                  nativeButton={false}
                >
                  {event.cta}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export { UpcomingEvent };

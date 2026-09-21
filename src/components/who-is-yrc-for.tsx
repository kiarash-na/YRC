import { ChevronRight } from "lucide-react";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Persona {
  title: string;
  value: string;
  summary: string;
  image: {
    src: string;
    alt: string;
    updatedAt?: string;
    width?: number;
  };
}

const personas: Persona[] = [
  {
    title: "The first-timer",
    value: "first-timer",
    summary:
      "Never run a kilometer in your life? Perfect. Most of us started exactly there — with shoes that felt wrong and a pace that felt embarrassing. It wasn't. Nobody's watching your watch here.",
    image: {
      src: "/YRC/Community/pexels-emrah-yazicioglu-275583761-12918252.jpg",
      alt: "First-time runner lacing up for their first kilometers with YRC",
      width: 1600,
    },
  },
  {
    title: "The returner",
    value: "returner",
    summary:
      "Injury, kids, a job that ate your evenings, a few quiet years — whatever pressed pause, the community is the easiest way to press play again. Comeback seasons are our favorite seasons.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/pexels-stephen-leonardi-587681991-29840329.jpg",
      alt: "Runner back on the roads, returning to training and racing",
      updatedAt: "1789681314310",
    },
  },
  {
    title: "The regular",
    value: "regular",
    summary:
      "You already run — you just run alone, and the solo miles are starting to feel long. Bring your routine to the pack: same you, same runs, better company and a reason to keep the streak alive.",
    image: {
      src: "/YRC/Community/photo_5877443723178741687_w.jpg",
      alt: "Regular runner sharing the miles with the YRC pack",
    },
  },
  {
    title: "The chaser",
    value: "chaser",
    summary:
      "A first marathon, a faster 10K, a start line abroad — you have a goal with a date on it. Good. You'll find training partners here who take goals seriously without taking themselves too seriously.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/pexels-stephen-leonardi-587681991-29840316.jpg",
      alt: "Runner chasing a race-day goal at a marathon",
      updatedAt: "1789681346908",
    },
  },
];

interface WhoIsYrcForProps {
  className?: string;
}

const WhoIsYrcFor = ({ className }: WhoIsYrcForProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Who is YRC for?
          </p>
          <h2 className="text-h2 md:text-h1">
            If you move, you <span className="text-yrc-accent">belong</span>
          </h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            Every pace is welcome — that&apos;s not a slogan, it&apos;s the door
            policy. Most people find themselves in one of these four.
          </p>
        </div>

        {/* Mobile: accordion */}
        <Accordion
          defaultValue={[personas[0].value]}
          className="mt-14 overflow-hidden rounded-xl border border-border md:mt-20 lg:hidden"
        >
          {personas.map((persona, index) => (
            <AccordionItem
              key={persona.value}
              value={persona.value}
              className={cn(
                "border-0 bg-muted/50 px-6 py-4 data-open:bg-background",
                index !== personas.length - 1 && "border-b border-border",
              )}
            >
              <AccordionTrigger className="items-start text-left hover:no-underline">
                <div className="flex flex-col gap-2">
                  <span className="text-h4">{persona.title}</span>
                  <span className="text-body-small text-muted-foreground">
                    {persona.summary}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="!h-auto pt-4 [&>div]:!h-auto">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted">
                  <Image
                    src={persona.image.src}
                    alt={persona.image.alt}
                    fill
                    sizes="100vw"
                    queryParameters={
                      persona.image.updatedAt
                        ? { updatedAt: persona.image.updatedAt }
                        : undefined
                    }
                    transformation={
                      persona.image.width
                        ? [{ width: persona.image.width }]
                        : undefined
                    }
                    className="object-cover object-center grayscale"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Desktop: tabs */}
        <Tabs
          defaultValue={personas[0].value}
          className="mt-14 hidden grid-cols-3 overflow-hidden rounded-xl border border-border md:mt-20 lg:grid"
        >
          <TabsList
            variant="line"
            className="!h-auto !w-full flex-col !gap-0 !rounded-none !border-r !border-border !bg-muted/50 !p-0"
          >
            {personas.map((persona, index) => (
              <TabsTrigger
                key={persona.value}
                value={persona.value}
                className={cn(
                  "group relative !h-auto !w-full !flex-col !items-start !justify-start gap-2.5 !rounded-none !border-0 !bg-muted/50 !px-6 !py-6 !whitespace-normal !text-foreground !shadow-none !ring-0 transition-colors duration-300 after:!hidden data-active:!border-0 data-active:!bg-background data-active:!shadow-none data-active:!ring-0 data-active:after:!hidden",
                  index !== personas.length - 1 &&
                    "!border-b !border-b-border data-active:!border-b data-active:!border-b-border",
                )}
              >
                <span className="absolute top-0 bottom-0 left-0 h-full w-[3px] bg-yrc-accent transition-opacity duration-300 group-data-[state=inactive]:opacity-0" />
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-h4">{persona.title}</span>
                  <ChevronRight className="h-auto w-4 shrink-0 text-muted-foreground" />
                </div>
                <p className="w-full text-left text-body-small text-muted-foreground">
                  {persona.summary}
                </p>
              </TabsTrigger>
            ))}
          </TabsList>
          {personas.map((persona) => (
            <TabsContent
              key={persona.value}
              value={persona.value}
              className="col-span-2 bg-background p-10 data-[state=inactive]:hidden"
            >
              <div className="relative aspect-video max-h-[450px] w-full overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={persona.image.src}
                  alt={persona.image.alt}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  queryParameters={
                    persona.image.updatedAt
                      ? { updatedAt: persona.image.updatedAt }
                      : undefined
                  }
                  transformation={
                    persona.image.width
                      ? [{ width: persona.image.width }]
                      : undefined
                  }
                  className="object-cover object-center grayscale"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export { WhoIsYrcFor };

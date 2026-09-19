import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Persona {
  title: string;
  value: string;
  summary: string;
  image: {
    src: string;
    alt: string;
  };
}

const personas: Persona[] = [
  {
    title: "The first-timer",
    value: "first-timer",
    summary:
      "Never run a kilometer in your life? Perfect. Most of us started exactly there — with shoes that felt wrong and a pace that felt embarrassing. It wasn't. Nobody's watching your watch here.",
    image: {
      src: "/YRC/5.png",
      alt: "New runner finding their feet with the YRC community",
    },
  },
  {
    title: "The returner",
    value: "returner",
    summary:
      "Injury, kids, a job that ate your evenings, a few quiet years — whatever pressed pause, the community is the easiest way to press play again. Comeback seasons are our favorite seasons.",
    image: {
      src: "/YRC/14.png",
      alt: "Runner returning to training after time away",
    },
  },
  {
    title: "The regular",
    value: "regular",
    summary:
      "You already run — you just run alone, and the solo miles are starting to feel long. Bring your routine to the pack: same you, same runs, better company and a reason to keep the streak alive.",
    image: {
      src: "/YRC/24.png",
      alt: "Regular runner sharing miles with the group",
    },
  },
  {
    title: "The chaser",
    value: "chaser",
    summary:
      "A first marathon, a faster 10K, a start line abroad — you have a goal with a date on it. Good. You'll find training partners here who take goals seriously without taking themselves too seriously.",
    image: {
      src: "/YRC/33.png",
      alt: "Runner chasing a goal on a YRC training run",
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
            If you move, you{" "}
            <span className="text-yrc-accent">belong</span>
          </h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            Every pace is welcome — that&apos;s not a slogan, it&apos;s the
            door policy. Most people find themselves in one of these four.
          </p>
        </div>

        <Tabs
          defaultValue={personas[0].value}
          className="mt-14 flex-col gap-10 md:mt-20 lg:flex-row lg:gap-14"
        >
          <TabsList
            variant="line"
            className="h-fit w-full flex-col items-stretch gap-2 p-0 lg:max-w-md"
          >
            {personas.map((persona) => (
              <TabsTrigger
                key={persona.value}
                value={persona.value}
                className="flex-col items-start gap-2 rounded-xl border border-border p-5 text-left whitespace-normal transition-colors data-active:border-foreground data-active:bg-muted"
              >
                <span className="text-h4">{persona.title}</span>
                <span className="text-body-small text-muted-foreground">
                  {persona.summary}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {personas.map((persona) => (
            <TabsContent
              key={persona.value}
              value={persona.value}
              className="w-full"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={persona.image.src}
                  alt={persona.image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain grayscale"
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

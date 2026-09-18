import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface Pillar {
  number: string;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
    updatedAt: string;
  };
  first?: boolean;
  last?: boolean;
}

const pillars: Pillar[] = [
  {
    number: "01",
    title: "MOVE",
    description:
      "Build sustainable active habits that stick — week after week, at your own pace.",
    image: {
      src: "/YRC/Pillars/Pillars-move",
      alt: "YRC runners in motion on a group run",
      updatedAt: "1789641881097",
    },
    first: true,
  },
  {
    number: "02",
    title: "CONNECT",
    description:
      "Meet people who enjoy moving together — before, during and long after the run.",
    image: {
      src: "/YRC/Pillars/pillars-connect",
      alt: "YRC community members connecting after a run",
      updatedAt: "1789641870615",
    },
  },
  {
    number: "03",
    title: "GROW",
    description:
      "Become stronger physically and personally — one run, one step at a time.",
    image: {
      src: "/YRC/Pillars/pillars-grow",
      alt: "YRC runner pushing through a training session",
      updatedAt: "1789641875693",
    },
    last: true,
  },
];

interface PillarsProps {
  className?: string;
}

const Pillars = ({ className }: PillarsProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col justify-center gap-7 md:text-center">
          <h2 className="text-h3 md:text-h1">Why we run together</h2>
          <p className="text-body-small text-muted-foreground md:text-body">
            YRC is built on three pillars — the things that keep us showing up
            week after week, on the road and off it.
          </p>
        </div>
        <div className="mx-auto mt-14 flex max-w-5xl flex-col gap-4 lg:px-16">
          {pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="flex flex-col items-center justify-between min-[960px]:flex-row min-[960px]:gap-10"
            >
              <div className="flex gap-4 min-[960px]:max-w-md">
                <div className="relative flex flex-col items-center justify-between gap-1">
                  {pillar.first ? (
                    <span className="h-20 shrink-0"></span>
                  ) : (
                    <span className="absolute -top-8 mx-auto h-8 w-[3px] shrink-0 bg-yrc-accent opacity-70"></span>
                  )}
                  {!pillar.first && !pillar.last && (
                    <>
                      <span className="absolute -bottom-8 mx-auto h-8 w-[3px] shrink-0 bg-yrc-accent opacity-70"></span>
                      <span className="h-20 w-[3px] shrink-0 bg-yrc-accent opacity-70"></span>
                    </>
                  )}
                  {pillar.last && (
                    <span className="h-20 w-[3px] shrink-0 bg-yrc-accent opacity-70"></span>
                  )}
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted/50 text-body-small font-semibold">
                    {pillar.number}
                  </span>
                  {pillar.last ? (
                    <span className="h-20 shrink-0"></span>
                  ) : (
                    <span className="h-20 w-[3px] shrink-0 bg-yrc-accent opacity-70"></span>
                  )}
                </div>
                <div className="flex flex-col justify-center gap-5 px-0 min-[960px]:gap-6 min-[960px]:px-4 min-[960px]:py-4">
                  <h3 className="text-h4 min-[960px]:text-h3">
                    {pillar.title}
                  </h3>
                  <p className="text-body-small text-muted-foreground min-[960px]:text-body">
                    {pillar.description}
                  </p>
                </div>
              </div>
              <div className="relative z-10 aspect-video w-full overflow-hidden rounded-xl border min-[960px]:max-h-56 min-[960px]:w-auto">
                <Image
                  src={pillar.image.src}
                  alt={pillar.image.alt}
                  fill
                  sizes="(min-width: 960px) 400px, 100vw"
                  queryParameters={{ updatedAt: pillar.image.updatedAt }}
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Pillars };

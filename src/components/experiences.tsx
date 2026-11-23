import { cn } from "@/lib/utils";
import { slotDefaults, withMedia, type SiteMediaItem } from "@/lib/site-media";

import { Image } from "@/components/imagekit";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { TALLY_POPUP_HASH } from "@/lib/tally";

interface Experience {
  number: string;
  title: string;
  description: string;
}

const experiences: Experience[] = [
  {
    number: "01",
    title: "International Events",
    description:
      "Selected road, trail and endurance events chosen with attention to quality, experience and the needs of athletes.",
  },
  {
    number: "02",
    title: "Sports Trips & Camps",
    description:
      "Specialized camps and trips built around sporting experiences, preparation, motivation and meaningful time together.",
  },
  {
    number: "03",
    title: "Yas Rise Community",
    description:
      "A community built around sustainable training, shared goals, continuous growth and people moving forward together.",
  },
];

interface ExperiencesProps {
  /** The slot's media (from /admin/media); defaults to the built-in set. */
  media?: SiteMediaItem[];
  className?: string;
}

const Experiences = ({ className, media }: ExperiencesProps) => {
  const cards = withMedia(experiences, media ?? slotDefaults("home.experiences"));
  return (
    <section className={cn("py-24 md:py-32", className)}>
      <div className="container">
        <Reveal className="grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="flex flex-col gap-7 lg:col-span-7">
            <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
              Yas Rise Experiences
            </p>
            <h2 className="text-h2 md:text-h1">Three ways to move with us</h2>
          </div>
          <p className="text-body-small text-muted-foreground md:text-body lg:col-span-5">
            Events, trips and community — each one built to carry you further
            than you would go alone.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8">
          {cards.map((experience, index) => (
            <Reveal key={experience.number} delay={index * 120}>
              <div className="group flex flex-col gap-6">
                <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl border bg-muted">
                  <Image
                    src={experience.image.src}
                    alt={experience.image.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    queryParameters={
                      experience.image.updatedAt
                        ? { updatedAt: experience.image.updatedAt }
                        : undefined
                    }
                    transformation={[
                      {
                        aspectRatio: "4-5",
                        crop: "maintain_ratio",
                        focus: "auto",
                        ...(experience.image.width
                          ? { width: experience.image.width }
                          : {}),
                      },
                    ]}
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-3 border-t border-border pt-5">
                  <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                    {experience.number}
                  </p>
                  <h3 className="text-h4 md:text-h3">{experience.title}</h3>
                  <p className="text-body-small text-muted-foreground">
                    {experience.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 flex md:mt-20">
          <Button
            size="lg"
            className="h-12 w-full px-7 tracking-wider sm:w-auto"
            render={<a href={TALLY_POPUP_HASH} />}
            nativeButton={false}
          >
            START YOUR JOURNEY
          </Button>
        </Reveal>
      </div>
    </section>
  );
};

export { Experiences };

import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { TALLY_POPUP_HASH } from "@/lib/tally";

interface Experience {
  number: string;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
    updatedAt: string;
  };
}

const experiences: Experience[] = [
  {
    number: "01",
    title: "International Events",
    description:
      "Selected road, trail and endurance events chosen with attention to quality, experience and the needs of athletes.",
    image: {
      src: "/YRC/17.png",
      alt: "YRC runners in motion on a group run",
      updatedAt: "1789773525014",
    },
  },
  {
    number: "02",
    title: "Sports Trips & Camps",
    description:
      "Specialized camps and trips built around sporting experiences, preparation, motivation and meaningful time together.",
    image: {
      src: "/YRC/48.png",
      alt: "YRC community members connecting after a run",
      updatedAt: "1789773524236",
    },
  },
  {
    number: "03",
    title: "Yas Rise Community",
    description:
      "A community built around sustainable training, shared goals, continuous growth and people moving forward together.",
    image: {
      src: "/YRC/22.png",
      alt: "YRC runner pushing through a training session",
      updatedAt: "1789773524301",
    },
  },
];

interface ExperiencesProps {
  className?: string;
}

const Experiences = ({ className }: ExperiencesProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col justify-center gap-7 md:text-center">
          <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
            Yas Rise Experiences
          </p>
          <h2 className="text-h2 md:text-h1">Three ways to move with us</h2>
          <p className="text-body-small text-muted-foreground md:text-body">
            Events, trips and community — each one built to carry you further
            than you would go alone.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
          {experiences.map((experience) => (
            <div key={experience.number} className="flex flex-col gap-5">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border bg-muted">
                <Image
                  src={experience.image.src}
                  alt={experience.image.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  queryParameters={{ updatedAt: experience.image.updatedAt }}
                  transformation={[
                    { aspectRatio: "4-3", crop: "force", focus: "auto" },
                  ]}
                  className="object-cover object-center"
                />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                  {experience.number}
                </p>
                <h3 className="text-h4 md:text-h3">{experience.title}</h3>
                <p className="text-body-small text-muted-foreground">
                  {experience.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            render={<a href={TALLY_POPUP_HASH} />}
            nativeButton={false}
          >
            START YOUR JOURNEY
          </Button>
        </div>
      </div>
    </section>
  );
};

export { Experiences };

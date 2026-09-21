import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface AboutImage {
  src: string;
  alt: string;
  updatedAt: string;
  width?: number;
}

const images: AboutImage[] = [
  {
    src: "/YRC/Home/SRK09740%20(1).jpg",
    alt: "YRC community members connecting after a run",
    updatedAt: "1789992733219",
  },
  {
    src: "/YRC/Home/SRK09793.jpg",
    alt: "YRC runner pushing through a training session",
    updatedAt: "1789992741992",
    width: 1600,
  },
];

interface AboutProps {
  className?: string;
}

const About = ({ className }: AboutProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid gap-6 md:grid-cols-7 md:gap-10">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase md:col-span-2">
            Who we are
          </p>
          <div className="flex flex-col gap-5 md:col-span-4 md:col-start-4">
            <h2 className="text-h2 md:text-h1">Yas Rise Community</h2>
            <p className="text-body font-medium md:text-h4">
              Personal growth through a shared journey.
            </p>
            <p className="max-w-2xl text-body-small text-muted-foreground md:text-body">
              Yas Rise is an ecosystem built around endurance sports,
              community, travel and shared experiences. We bring together
              selected sporting events, training programs, sports camps and
              international trips with a community of people who believe the
              journey matters as much as the finish line.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20">
          {images.map((image) => (
            <div
              key={image.src}
              className="relative aspect-4/3 w-full overflow-hidden rounded-xl border bg-muted md:aspect-3/2"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                queryParameters={{ updatedAt: image.updatedAt }}
                transformation={[
                  {
                    aspectRatio: "3-2",
                    crop: "force",
                    focus: "auto",
                    ...(image.width ? { width: image.width } : {}),
                  },
                ]}
                className="object-cover object-center grayscale"
              />
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-7 md:gap-10">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase md:col-span-2">
            What drives us
          </p>
          <div className="flex flex-col gap-5 md:col-span-4 md:col-start-4">
            <h3 className="text-h3 md:text-h2">
              The journey matters as much as the finish line.
            </h3>
            <p className="max-w-2xl text-body-small text-muted-foreground md:text-body">
              Finishing a race is a moment. Everything around it — the early
              mornings, the people beside you, the places it takes you — is
              what stays. YRC exists to make that journey shared, sustainable
              and worth showing up for.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { About };

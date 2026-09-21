import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface GalleryImage {
  src: string;
  alt: string;
  updatedAt: string;
  className: string;
  /** Aspect ratio tokens, mobile-first like Tailwind: "4-3" or "4-3 md:3-4". */
  aspect: string;
  /** Cap source resolution for >25MP originals (ImageKit ELIMIT). */
  width?: number;
}

const basePath = "/YRC/Events/Upcoming/Istanbul%20Marathon%202025";

// Lookup keeps the class names literal so Tailwind's scanner picks them up.
const aspectClasses: Record<string, string> = {
  "4-3": "aspect-4/3",
  "3-4": "aspect-3/4",
  "3-2": "aspect-3/2",
  "1-1": "aspect-square",
};

const aspectClassName = (aspect: string) =>
  aspect
    .split(" ")
    .map((token) => {
      const [bp, ratio] = token.includes(":")
        ? token.split(":")
        : ["", token];
      const cls = aspectClasses[ratio] ?? "";
      return bp ? `${bp}:${cls}` : cls;
    })
    .join(" ");

// Server-side smart crop: use the card's largest-breakpoint ratio.
const smartCrop = (aspect: string, width?: number) => [
  {
    aspectRatio: aspect.split(" ").pop()!.split(":").pop()!,
    crop: "force" as const,
    focus: "auto",
    ...(width ? { width } : {}),
  },
];

const images: GalleryImage[] = [
  {
    src: `${basePath}/M06.JPG`,
    alt: "YRC runners on the course at Istanbul Marathon 2025",
    updatedAt: "1789681147875",
    className: "md:col-span-5 md:rotate-[-1.5deg]",
    aspect: "3-4",
  },
  {
    src: "/YRC/Home/Untitled%20design%20(6).png",
    alt: "Yas Rise community artwork",
    updatedAt: "1789993235481",
    className: "md:col-span-4 md:mt-16 md:rotate-[1.5deg]",
    aspect: "3-4",
  },
  {
    src: `${basePath}/09.jpg`,
    alt: "A YRC runner mid-race at Istanbul Marathon",
    updatedAt: "1789681141241",
    className: "hidden md:col-span-3 md:mt-32 md:block md:rotate-[-1deg]",
    aspect: "3-4",
  },
  {
    src: "/YRC/Home/SRK09793.jpg",
    alt: "The YRC pack together on a group run",
    updatedAt: "1789992741992",
    className: "md:col-span-4 md:col-start-2 md:-mt-10 md:rotate-[2deg]",
    aspect: "3-4",
    width: 1600,
  },
  {
    src: `${basePath}/M05.JPG`,
    alt: "YRC runners pushing through Istanbul Marathon 2025",
    updatedAt: "1789681152474",
    className: "md:col-span-4 md:-mt-6 md:rotate-[-2deg]",
    aspect: "1-1",
  },
  {
    src: `${basePath}/pexels-ciro-palomba-1275986148-31517243.jpg`,
    alt: "Runners sharing miles through the city",
    updatedAt: "1789681305377",
    className: "hidden md:col-span-4 md:col-start-2 md:block md:rotate-[1deg]",
    aspect: "1-1",
  },
  {
    src: `${basePath}/pexels-stephen-leonardi-587681991-29840316.jpg`,
    alt: "A runner alone with the road on a long run",
    updatedAt: "1789681346908",
    className: "hidden md:col-span-3 md:-mt-16 md:block md:rotate-[-1.5deg]",
    aspect: "1-1",
  },
  {
    src: "/YRC/Community/photo_5877443723178741687_w.jpg",
    alt: "The YRC community gathered after a run",
    updatedAt: "1790017039009",
    className: "hidden md:col-span-4 md:mt-8 md:block md:rotate-[2deg]",
    aspect: "1-1",
  },
];

interface GalleryProps {
  className?: string;
}

const Gallery = ({ className }: GalleryProps) => {
  return (
    <section className={cn("overflow-hidden py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col justify-center gap-7 md:text-center">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Community Gallery
          </p>
          <h2 className="text-h2 md:text-h1">Run. Explore. Rise.</h2>
          <p className="text-body-small text-muted-foreground md:text-body">
            A glimpse into the people, places and experiences that make Yas
            Rise what it is.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-4 md:mt-20 md:grid-cols-12 md:gap-6">
          {images.map((image) => (
            <div
              key={image.src}
              className={cn(
                "relative w-full overflow-hidden rounded-xl border bg-muted shadow-sm transition-transform duration-300 hover:z-10 hover:scale-[1.03] hover:rotate-0",
                aspectClassName(image.aspect),
                image.className,
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                queryParameters={{ updatedAt: image.updatedAt }}
                transformation={smartCrop(image.aspect, image.width)}
                className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Gallery };

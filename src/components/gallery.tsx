import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface GalleryImage {
  src: string;
  alt: string;
  updatedAt: string;
  className: string;
  aspect: string;
}

const basePath = "/YRC/Events/Upcoming/Istanbul%20Marathon%202025";

const images: GalleryImage[] = [
  {
    src: "/YRC/2.png",
    alt: "YRC runners together on race day",
    updatedAt: "1789773523821",
    className: "md:col-span-5 md:rotate-[-1.5deg]",
    aspect: "aspect-4/3",
  },
  {
    src: `${basePath}/M07.jpg`,
    alt: "YRC community member mid-run",
    updatedAt: "1789681140651",
    className: "md:col-span-4 md:mt-16 md:rotate-[1.5deg]",
    aspect: "aspect-4/3 md:aspect-3/4",
  },
  {
    src: "/YRC/50.png",
    alt: "Runner outdoors during a YRC trip",
    updatedAt: "1789773523340",
    className: "hidden md:col-span-3 md:mt-32 md:block md:rotate-[-1deg]",
    aspect: "aspect-3/4",
  },
  {
    src: `${basePath}/03.jpg`,
    alt: "YRC group sharing a moment after training",
    updatedAt: "1789681291699",
    className: "md:col-span-4 md:col-start-2 md:-mt-10 md:rotate-[2deg]",
    aspect: "aspect-4/3",
  },
  {
    src: `${basePath}/4.jpg`,
    alt: "Runners on the course during a YRC event",
    updatedAt: "1789681290358",
    className: "md:col-span-4 md:-mt-6 md:rotate-[-2deg]",
    aspect: "aspect-4/3",
  },
  {
    src: `${basePath}/pexels-roman-odintsov-5859136.jpg`,
    alt: "YRC community exploring a new place together",
    updatedAt: "1789681295806",
    className: "hidden md:col-span-4 md:col-start-2 md:block md:rotate-[1deg]",
    aspect: "aspect-3/2",
  },
  {
    src: `${basePath}/photo_5940647121873128959_x.jpg`,
    alt: "Shared moment between YRC runners",
    updatedAt: "1789681280915",
    className: "hidden md:col-span-3 md:-mt-16 md:block md:rotate-[-1.5deg]",
    aspect: "aspect-square",
  },
  {
    src: `${basePath}/M05.jpg`,
    alt: "YRC runners celebrating at the finish",
    updatedAt: "1789681303886",
    className: "hidden md:col-span-4 md:mt-8 md:block md:rotate-[2deg]",
    aspect: "aspect-4/3",
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
                image.aspect,
                image.className,
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                queryParameters={{ updatedAt: image.updatedAt }}
                className="object-cover object-center grayscale"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Gallery };

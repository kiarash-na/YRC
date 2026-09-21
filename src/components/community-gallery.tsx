import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface GalleryImage {
  src: string;
  alt: string;
  updatedAt: string;
  className: string;
  aspect: string;
  /** Cap source resolution for >25MP originals (ImageKit ELIMIT). */
  width?: number;
}

const images: GalleryImage[] = [
  {
    src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M06.JPG",
    alt: "YRC runners on the course at Istanbul Marathon 2025",
    updatedAt: "1789681147875",
    className: "md:col-span-5 md:rotate-[-1.5deg]",
    aspect: "aspect-4/3",
  },
  {
    src: "/YRC/Home/Untitled%20design%20(6).png",
    alt: "Yas Rise community artwork",
    updatedAt: "1789993235481",
    className: "md:col-span-4 md:mt-16 md:rotate-[1.5deg]",
    aspect: "aspect-4/3 md:aspect-3/4",
  },
  {
    src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/09.jpg",
    alt: "A YRC runner mid-race at Istanbul Marathon",
    updatedAt: "1789681141241",
    className: "hidden md:col-span-3 md:mt-32 md:block md:rotate-[-1deg]",
    aspect: "aspect-3/4",
  },
  {
    src: "/YRC/Home/SRK09793.jpg",
    alt: "The YRC pack together on a group run",
    updatedAt: "1789992741992",
    className: "md:col-span-4 md:col-start-2 md:-mt-10 md:rotate-[2deg]",
    aspect: "aspect-4/3",
    width: 1600,
  },
  {
    src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M05.JPG",
    alt: "YRC runners pushing through Istanbul Marathon 2025",
    updatedAt: "1789681152474",
    className: "md:col-span-4 md:-mt-6 md:rotate-[-2deg]",
    aspect: "aspect-4/3",
  },
  {
    src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/pexels-ciro-palomba-1275986148-31517243.jpg",
    alt: "Runners sharing miles through the city",
    updatedAt: "1789681305377",
    className: "hidden md:col-span-4 md:col-start-2 md:block md:rotate-[1deg]",
    aspect: "aspect-3/2",
  },
  {
    src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/pexels-stephen-leonardi-587681991-29840316.jpg",
    alt: "A runner alone with the road on a long run",
    updatedAt: "1789681346908",
    className: "hidden md:col-span-3 md:-mt-16 md:block md:rotate-[-1.5deg]",
    aspect: "aspect-square",
  },
  {
    src: "/YRC/Community/photo_5877443723178741687_w.jpg",
    alt: "The YRC community gathered after a run",
    updatedAt: "1790017039009",
    className: "hidden md:col-span-4 md:mt-8 md:block md:rotate-[2deg]",
    aspect: "aspect-4/3",
  },
];

interface CommunityGalleryProps {
  className?: string;
}

const CommunityGallery = ({ className }: CommunityGalleryProps) => {
  return (
    <section className={cn("overflow-hidden py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col justify-center gap-7 md:text-center">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Community Gallery
          </p>
          <h2 className="text-h2 md:text-h1">
            This is what <span className="text-yrc-accent">belonging</span>{" "}
            looks like.
          </h2>
          <p className="text-body-small text-muted-foreground md:text-body">
            Cold mornings, shared miles, finish-line noise. The community, as
            it actually is.
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
                transformation={image.width ? [{ width: image.width }] : undefined}
                className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { CommunityGallery };

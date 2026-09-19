import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface GalleryImage {
  src: string;
  alt: string;
  updatedAt: string;
  className: string;
  aspect: string;
}

const images: GalleryImage[] = [
  {
    src: "/YRC/8.png",
    alt: "YRC runners warming up before a group run",
    updatedAt: "1789773523944",
    className: "md:col-span-5 md:rotate-[-1.5deg]",
    aspect: "aspect-4/3",
  },
  {
    src: "/YRC/11.png",
    alt: "Two community members mid-conversation on an easy run",
    updatedAt: "1789773520930",
    className: "md:col-span-4 md:mt-16 md:rotate-[1.5deg]",
    aspect: "aspect-4/3 md:aspect-3/4",
  },
  {
    src: "/YRC/17.png",
    alt: "Early morning miles with the YRC pack",
    updatedAt: "1789773525014",
    className: "hidden md:col-span-3 md:mt-32 md:block md:rotate-[-1deg]",
    aspect: "aspect-3/4",
  },
  {
    src: "/YRC/22.png",
    alt: "The group catching its breath after intervals",
    updatedAt: "1789773524301",
    className: "md:col-span-4 md:col-start-2 md:-mt-10 md:rotate-[2deg]",
    aspect: "aspect-4/3",
  },
  {
    src: "/YRC/26.png",
    alt: "Runners pushing through the final stretch together",
    updatedAt: "1789773525964",
    className: "md:col-span-4 md:-mt-6 md:rotate-[-2deg]",
    aspect: "aspect-4/3",
  },
  {
    src: "/YRC/31.png",
    alt: "A quiet moment on a YRC weekend long run",
    updatedAt: "1789773521365",
    className: "hidden md:col-span-4 md:col-start-2 md:block md:rotate-[1deg]",
    aspect: "aspect-3/2",
  },
  {
    src: "/YRC/38.png",
    alt: "New faces joining the pack for the first time",
    updatedAt: "1789773525768",
    className: "hidden md:col-span-3 md:-mt-16 md:block md:rotate-[-1.5deg]",
    aspect: "aspect-square",
  },
  {
    src: "/YRC/43.png",
    alt: "The community celebrating after a shared finish",
    updatedAt: "1789773522891",
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
                className="object-contain grayscale"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { CommunityGallery };

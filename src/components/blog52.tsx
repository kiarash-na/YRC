"use client";

import { cn } from "@/lib/utils";

import { Image } from "@/components/imagekit";
import { lqip } from "@/lib/imagekit";

interface Blog52Image {
  src: string;
  alt: string;
  updatedAt: string;
}

interface Blog52Props {
  label?: string;
  heading?: string;
  description?: string;
  image?: Blog52Image;
  className?: string;
}

const defaultProps: Required<
  Pick<Blog52Props, "label" | "heading" | "description" | "image">
> = {
  label: "YRC Journal",
  heading: "RUN. MOVE. GROW.",
  description:
    "Stories, ideas and practical insights about running, training, movement and building a life around an active community.",
  image: {
    src: "/YRC/Community/SRK09740%20(1).jpg",
    alt: "The YRC crew running together along a ridge road at golden hour",
    updatedAt: "1790005645712",
  },
};

type Props = Partial<Blog52Props>;

const Blog52 = (props: Props) => {
  const { label, heading, description, image, className } = {
    ...defaultProps,
    ...props,
  };

  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col">
          <div className="mx-auto flex max-w-3xl flex-col justify-center gap-7 md:text-center">
            <p className="yrc-hero-in text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
              {label}
            </p>
            <h1 style={{ animationDelay: "80ms" }} className="yrc-hero-in text-h1 md:text-display">{heading}</h1>
            <p style={{ animationDelay: "160ms" }} className="yrc-hero-in mx-auto max-w-2xl text-body text-muted-foreground">
              {description}
            </p>
          </div>

          <div style={{ animationDelay: "260ms" }} className="yrc-hero-in relative mt-14 aspect-3/2 w-full overflow-hidden rounded-xl border border-border bg-muted md:mt-20 md:aspect-21/9">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              queryParameters={{ updatedAt: image.updatedAt }}
              className="yrc-drift object-cover object-center"
              style={{
                backgroundImage: `url(${lqip(image.src, image.updatedAt)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onLoad={(e) => {
                e.currentTarget.style.backgroundImage = "none";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Blog52 };

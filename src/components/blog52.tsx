"use client";

import { cn } from "cn";

import { buildSrc, Image } from "@/components/imagekit";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";

const lqip = (src: string, updatedAt: string) =>
  urlEndpoint
    ? buildSrc({
        src,
        urlEndpoint,
        transformation: [{ quality: 10, blur: 90 }],
        queryParameters: { updatedAt },
      })
    : "";

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
    src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M06.jpg",
    alt: "YRC runners together on race day",
    updatedAt: "1789681293386",
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
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <div className="mx-auto flex max-w-3xl flex-col justify-center gap-7 md:text-center">
            <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
              {label}
            </p>
            <h1 className="text-h1 md:text-display">{heading}</h1>
            <p className="text-body-small text-muted-foreground md:text-body">
              {description}
            </p>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted md:aspect-21/9">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              queryParameters={{ updatedAt: image.updatedAt }}
              className="object-cover object-center"
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

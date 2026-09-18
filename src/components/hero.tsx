"use client";

import { cn } from "cn";

import { buildSrc, Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { TALLY_POPUP_HASH } from "@/lib/tally";

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

interface HeroImage {
  src: string;
  alt: string;
  updatedAt: string;
}
interface HeroButton {
  text: string;
  url: string;
  icon?: React.ReactNode;
}
interface Buttons {
  primary?: HeroButton;
  secondary?: HeroButton;
}
interface Badge {
  text: string;
  announcement?: string;
  url?: string;
}

interface HeroProps {
  heading: string;
  description: string;
  badge?: Badge;
  buttons?: Buttons;
  imageProduct?: HeroImage;
  imagesPortrait?: HeroImage[];
  className?: string;
  subheading?: string;
}
type Props = Partial<HeroProps>;

const defaultProps: HeroProps = {
  badge: {
    text: "Yas Rise Community Munich",
    url: "/community",
  },
  heading: "RUN TOGETHER.",
  subheading: "GROW TOGETHER.",
  description:
    "Weekly runs · training · outdoor adventures · good people. YRC is a running community in Munich for every pace — show up, run together, grow together.",
  buttons: {
    primary: {
      text: "JOIN THE COMMUNITY",
      url: TALLY_POPUP_HASH,
    },
    secondary: {
      text: "SEE UPCOMING RUNS",
      url: "/events",
    },
  },
  imageProduct: {
    src: "/YRC/Home page/Hero-left",
    alt: "YRC runners training together in Munich",
    updatedAt: "1789641774014",
  },
  imagesPortrait: [
    {
      src: "/YRC/Home page/Hero-right",
      alt: "YRC community member out on a run",
      updatedAt: "1789641779716",
    },
  ],
};

const Hero = (props: Props) => {
  const {
    badge,
    heading,
    subheading,
    description,
    buttons,
    imageProduct,
    imagesPortrait,
    className,
  } = {
    ...defaultProps,
    ...props,
  };

  const portrait = imagesPortrait?.[0];

  return (
    <section className={cn("relative overflow-hidden py-32", className)}>
      <div className="relative z-10 container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {badge && (
              <a
                href={badge.url ?? "#"}
                className="my-6 text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase hover:underline"
              >
                {badge.text}
              </a>
            )}

            <h1 className="md:text-display">
              {heading}
              {subheading && (
                <>
                  <br />
                  <span className="text-muted-foreground">{subheading}</span>
                </>
              )}
            </h1>

            <p className="my-8 max-w-xl text-body text-muted-foreground">
              {description}
            </p>

            <div className="flex w-full flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              {buttons?.primary && (
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  render={<a href={buttons.primary.url} />}
                  nativeButton={false}
                >
                  {buttons.primary.text}
                </Button>
              )}
              {buttons?.secondary && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  render={<a href={buttons.secondary.url} />}
                  nativeButton={false}
                >
                  {buttons.secondary.text}
                </Button>
              )}
            </div>
          </div>

          <div className="relative grid gap-4 lg:grid-cols-2">
            {imageProduct && (
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={imageProduct.src}
                  alt={imageProduct.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  queryParameters={{ updatedAt: imageProduct.updatedAt }}
                  className="object-cover object-top-left transition-transform duration-300 hover:scale-105"
                  style={{
                    backgroundImage: `url(${lqip(imageProduct.src, imageProduct.updatedAt)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "top left",
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.backgroundImage = "none";
                  }}
                />
              </div>
            )}
            {portrait && (
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-muted shadow-sm lg:mt-8">
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  queryParameters={{ updatedAt: portrait.updatedAt }}
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  style={{
                    backgroundImage: `url(${lqip(portrait.src, portrait.updatedAt)})`,
                    backgroundSize: "cover",
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.backgroundImage = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };

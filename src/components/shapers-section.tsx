import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface Shaper {
  name: string;
  role: string;
  image: string;
  alt: string;
  bio: string[];
}

// TODO(user): replace every [BRACKETED] placeholder below with final copy and
// real photo paths before launch — nothing here is final text.
const shapers: Shaper[] = [
  {
    name: "[SHAPER 1]",
    role: "[SHAPER 1 ROLE]",
    image: "/YRC/About/Team/[SHAPER 1 PHOTO]",
    alt: "[SHAPER 1 PHOTO]",
    bio: [
      "[SHAPER 1 BIO 1 — who they are and how they shaped YRC]",
      "[SHAPER 1 BIO 2 — what they brought to the community]",
    ],
  },
  {
    name: "[SHAPER 2]",
    role: "[SHAPER 2 ROLE]",
    image: "/YRC/About/Team/[SHAPER 2 PHOTO]",
    alt: "[SHAPER 2 PHOTO]",
    bio: [
      "[SHAPER 2 BIO 1 — who they are and how they shaped YRC]",
      "[SHAPER 2 BIO 2 — what they brought to the community]",
    ],
  },
];

interface ShapersSectionProps {
  className?: string;
}

const ShapersSection = ({ className }: ShapersSectionProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            The shapers
          </p>
          <h2 className="text-h2 md:text-h1">The people who shaped YRC.</h2>
          {/* TODO(user): final intro paragraph for the shapers section. */}
          <p className="max-w-2xl text-body text-muted-foreground">
            [SHAPERS INTRO — one or two sentences about the people who helped
            shape YRC into what it is]
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20">
          {shapers.map((shaper) => (
            <article
              key={shaper.name}
              className="flex flex-col gap-5 rounded-xl border border-border p-6 lg:p-8"
            >
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={shaper.image}
                  alt={shaper.alt}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
                />
              </div>
              <h3 className="text-h4 md:text-h3">{shaper.name}</h3>
              <p className="text-body-small font-semibold">{shaper.role}</p>
              {/* TODO(user): two final bio paragraphs per shaper. */}
              <div className="flex flex-col gap-4 text-body-small text-muted-foreground">
                {shaper.bio.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export { ShapersSection };

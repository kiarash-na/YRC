import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface Founder {
  name: string;
  role: string;
  image: string;
  alt: string;
  bio: string[];
}

// TODO(user): replace every [BRACKETED] placeholder below with final copy and
// the real portrait path before launch — nothing here is final text.
const founder: Founder = {
  name: "[FOUNDER NAME]",
  role: "[FOUNDER ROLE — e.g. Founder & Head Coach]",
  image: "/YRC/About/Team/[FOUNDER PHOTO]",
  alt: "[FOUNDER PHOTO]",
  bio: [
    "[FOUNDER BIO 1 — why they started YRC]",
    "[FOUNDER BIO 2 — the story behind the brand]",
    "[FOUNDER BIO 3 — what they want members to feel]",
  ],
};

interface FounderSectionProps {
  className?: string;
}

const FounderSection = ({ className }: FounderSectionProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <article className="grid items-center gap-8 rounded-xl border border-border p-6 lg:grid-cols-[2fr_3fr] lg:gap-12 lg:p-12">
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={founder.image}
              alt={founder.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
            />
          </div>
          <div className="flex flex-col gap-7">
            <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
              The founder
            </p>
            <h2 className="text-h2 md:text-h1">{founder.name}</h2>
            {/* TODO(user): final role line for the founder. */}
            <p className="text-body-small font-semibold">{founder.role}</p>
            {/* TODO(user): three final bio paragraphs — why they started YRC,
                the story behind the brand, what they want members to feel. */}
            <div className="flex max-w-2xl flex-col gap-5 text-body text-muted-foreground">
              {founder.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export { FounderSection };

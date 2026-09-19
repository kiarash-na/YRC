import { cn } from "cn";

import { Image } from "@/components/imagekit";

interface Coach {
  name: string;
  role: string;
  image: string;
  alt: string;
  online?: boolean;
  bio: string[];
}

const coaches: Coach[] = [
  {
    name: "Reza",
    role: "Running, Marathon, Half Marathon & Functional Training for Runners",
    image: "/YRC/About/Team/Reza-couch.jpg",
    alt: "Reza, YRC running coach",
    bio: [
      "Reza focuses on Running, Marathon, Half Marathon, and Functional Training for Runners. His primary focus is helping runners build the physical and mental readiness they need to perform at their best. His approach combines a structured training plan with strength development, endurance, and functional exercises.",
      "He believes that every runner is different and should have a training plan based on their goals, level of readiness, and physical capacity — a path that leads to a stronger body and more sustainable performance.",
    ],
  },
  {
    name: "Erfan",
    role: "Running & Functional Training",
    image: "/YRC/About/Team/Erfan-couch.jpg",
    alt: "Erfan, YRC running and functional training coach",
    bio: [
      "Erfan began his athletic journey with sports such as football, volleyball, boxing, and bodybuilding, before turning his focus to running. Along the way, he gained experience in competitions and professional training, as well as a deeper understanding of nutrition and sports performance.",
      "He believes that progress doesn't require a complicated formula; it requires a strong mind and the ability to maintain consistency and discipline. Today, Erfan brings this perspective to Running and Functional Training, helping runners become stronger, more focused, and more consistent.",
    ],
  },
  {
    name: "Kamyar",
    role: "Hybrid Endurance & Strength Coach (Online)",
    image: "/YRC/About/Team/Kambiz-coach.jpg",
    alt: "Kamyar, YRC online hybrid endurance and strength coach",
    online: true,
    bio: [
      "Kamyar is a Hybrid Endurance and Strength Coach with extensive experience in endurance sports and competitions. He has participated in more than 150 races, ranging from Trail, Ultra, and SwimRun to Ironman.",
      "Today, as an Online Endurance Coach at TrainingPeaks, he uses his experience and knowledge to design personalized training programs for Running, Road Racing, and Marathon.",
      "His experience has taught him that running is not simply about reaching the finish line; it is a journey toward building discipline, developing structure, and discovering your own abilities.",
    ],
  },
  {
    name: "Amirhossein",
    role: "Strength & Conditioning Coach | Movement & Corrective Exercise (Online)",
    image: "/YRC/About/Team/AmirHossein-coach.jpg",
    alt: "Amirhossein, YRC online strength and conditioning coach",
    online: true,
    bio: [
      "Amirhossein is a strength and conditioning coach specializing in Mobility, Functional Training, Strength, and corrective exercises. His approach focuses on evaluating movement, improving movement quality, increasing strength and performance, and preventing injuries.",
      "He designs training programs tailored to the individual needs of each runner. At YRC, Amirhossein focuses on helping runners build the physical foundations they need to move better, train more effectively, and perform more consistently.",
      "The goal is not simply to become faster; it is to build a body that is prepared to move better, train better, and run more sustainably.",
    ],
  },
];

interface TeamProps {
  className?: string;
}

const Team = ({ className }: TeamProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
            The coaches
          </p>
          <h2 className="text-h2 md:text-h1">The people behind the pace.</h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            Structure doesn&rsquo;t come from an app — it comes from people
            who&rsquo;ve run the miles themselves. Meet the coaches who turn
            showing up into getting better.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20">
          {coaches.map((coach) => (
            <article
              key={coach.name}
              className="flex flex-col gap-5 rounded-xl border border-border p-6 lg:p-8"
            >
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={coach.image}
                  alt={coach.alt}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-center grayscale"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-h4 md:text-h3">{coach.name}</h3>
                {coach.online && (
                  <span className="rounded-sm border border-border px-2 py-0.5 text-caption font-bold tracking-[0.2em] text-yrc-accent uppercase">
                    Online
                  </span>
                )}
              </div>
              <p className="text-body-small font-semibold">{coach.role}</p>
              <div className="flex flex-col gap-4 text-body-small text-muted-foreground">
                {coach.bio.map((paragraph, i) => (
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

export { Team };

import { cn } from "cn";

import { Image } from "@/components/imagekit";

const landscape = {
  src: "/YRC/Home/SRK09740%20(1).jpg",
  alt: "YRC community running together on a group run",
  updatedAt: "1789992733219",
};

const markers = [
  {
    title: "International races",
    description: "Start lines in cities we've never run before.",
  },
  {
    title: "Training camps abroad",
    description: "Shared effort in places worth remembering.",
  },
  {
    title: "One community",
    description: "Different streets, different languages — same people beside you.",
  },
];

interface WithoutBordersProps {
  className?: string;
}

const WithoutBorders = ({ className }: WithoutBordersProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-last aspect-4/3 w-full overflow-hidden rounded-xl border bg-muted lg:order-first">
            <Image
              src={landscape.src}
              alt={landscape.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              queryParameters={{ updatedAt: landscape.updatedAt }}
              className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
            />
          </div>

          <div className="flex flex-col gap-7">
            <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
              Without borders
            </p>
            <h2 className="text-h2 md:text-h1">
              One community. Many start lines.
            </h2>
            <div className="flex max-w-2xl flex-col gap-5 text-body text-muted-foreground">
              <p>
                YRC was never meant to stop at the edge of a city. The same
                spirit that meets for a weekly run travels — to international
                marathons, trail races and camps in places we&rsquo;ve never
                run before.
              </p>
              <p>
                Borders divide maps, not communities. Wherever there&rsquo;s a
                road worth running and people worth running it with,
                that&rsquo;s where YRC goes.
              </p>
            </div>
            <div className="mt-2 flex flex-col divide-y divide-border border-t border-b border-border">
              {markers.map((marker) => (
                <div key={marker.title} className="flex flex-col gap-1 py-4">
                  <h3 className="text-h4">{marker.title}</h3>
                  <p className="text-body-small text-muted-foreground">
                    {marker.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { WithoutBorders };

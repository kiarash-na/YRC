import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { featuredStory, secondaryStories } from "@/data/blog";

interface Blog22Props {
  className?: string;
}

const Blog22 = ({ className }: Blog22Props) => {
  return (
    <section className={cn("bg-background pb-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-xl flex-col gap-7">
              <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                Featured Stories
              </p>
              <h2 className="text-h2 md:text-h1">From the journal</h2>
            </div>
            <p className="text-body-small max-w-sm text-muted-foreground md:text-body">
              Training notes, race lessons and community stories from the
              people who run with YRC.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <Link
              href={`/blogs/${featuredStory.slug}`}
              className="group flex flex-col gap-6"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={featuredStory.image.src}
                  alt={featuredStory.image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  queryParameters={{ updatedAt: featuredStory.image.updatedAt }}
                  className="object-contain grayscale transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                  {featuredStory.category} · {featuredStory.date}
                </p>
                <h3 className="text-h3 md:text-h2">{featuredStory.title}</h3>
                <p className="text-body-small text-muted-foreground md:text-body">
                  {featuredStory.summary}
                </p>
                <span className="inline-flex w-fit items-center gap-1 pt-2 font-medium text-primary underline underline-offset-4 transition-opacity group-hover:opacity-75">
                  Read story <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>

            <div className="flex flex-col divide-y divide-border border-y border-border">
              {secondaryStories.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blogs/${post.slug}`}
                  className="group flex items-start gap-5 py-6 first:pt-0 last:pb-0 md:gap-7 md:py-8"
                >
                  <span className="text-caption pt-2 font-bold tracking-[0.3em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted md:w-32">
                    <Image
                      src={post.image.src}
                      alt={post.image.alt}
                      fill
                      sizes="(min-width: 768px) 128px, 96px"
                      queryParameters={{ updatedAt: post.image.updatedAt }}
                      className="object-contain grayscale transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                      {post.category} · {post.date}
                    </p>
                    <h3 className="text-h4 md:text-h3">{post.title}</h3>
                    <p className="text-body-small hidden text-muted-foreground md:block">
                      {post.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Blog22 };

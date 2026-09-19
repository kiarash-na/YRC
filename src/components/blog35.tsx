import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { moreArticles, type BlogPost } from "@/data/blog";

interface Blog35Props {
  label?: string;
  heading?: string;
  description?: string;
  posts?: BlogPost[];
  className?: string;
}

const defaultProps: Required<
  Pick<Blog35Props, "label" | "heading" | "description" | "posts">
> = {
  label: "Latest Articles",
  heading: "Keep reading",
  description:
    "Practical training advice, race-day lessons and honest stories from the YRC community.",
  posts: moreArticles,
};

type Props = Partial<Blog35Props>;

const Blog35 = (props: Props) => {
  const { label, heading, description, posts, className } = {
    ...defaultProps,
    ...props,
  };

  return (
    <section className={cn("bg-background pb-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-xl flex-col gap-7">
              <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                {label}
              </p>
              <h2 className="text-h2 md:text-h1">{heading}</h2>
            </div>
            <p className="text-body-small max-w-sm text-muted-foreground md:text-body">
              {description}
            </p>
          </div>

          <div className="flex flex-col">
            {posts.map((post, index) => {
              const imageFirst = index % 2 === 0;

              return (
                <div key={post.slug}>
                  <Card className="gap-0 border-0 bg-transparent p-0">
                    <div
                      className={cn(
                        "grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16",
                        !imageFirst && "md:[&>*:first-child]:order-2",
                      )}
                    >
                      <Link
                        href={post.href}
                        className="group block overflow-hidden rounded-xl border border-border bg-muted"
                      >
                        <div className="relative aspect-16/9 w-full">
                          <Image
                            src={post.image.src}
                            alt={post.image.alt}
                            fill
                            sizes="(min-width: 1024px) 40vw, 100vw"
                            queryParameters={{
                              updatedAt: post.image.updatedAt,
                            }}
                            className="object-contain grayscale transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      </Link>

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="text-caption h-auto rounded-md px-2.5 py-1 font-bold tracking-[0.2em] uppercase"
                          >
                            {post.category}
                          </Badge>
                          <span className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                            {post.date} · {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-h3 md:text-h2">
                          <Link
                            href={post.href}
                            className="transition-opacity hover:opacity-75"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-body-small text-muted-foreground md:text-body">
                          {post.summary}
                        </p>
                        <Link
                          href={post.href}
                          className="inline-flex w-fit items-center gap-1 pt-2 font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
                        >
                          Read article <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </Card>

                  {index < posts.length - 1 && (
                    <Separator className="my-12 md:my-16" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Blog35 };

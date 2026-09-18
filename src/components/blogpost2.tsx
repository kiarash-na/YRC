"use client";

import { ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

import { buildSrc, Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/data/blog";

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

interface Blogpost2Props {
  post: BlogPost;
  related: BlogPost[];
  className?: string;
}

const Blogpost2 = ({ post, related, className }: Blogpost2Props) => {
  const author = post.author ?? "YRC Editorial";
  const sections = post.sections ?? [
    { heading: post.title, paragraphs: [post.summary] },
  ];

  return (
    <section className={cn("bg-background py-32", className)}>
      <div className="container">
        <div className="mx-auto flex max-w-6xl flex-col gap-16">
          <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:gap-16">
            <aside className="top-10 h-fit flex-shrink-0 lg:sticky lg:w-[300px] xl:w-[400px]">
              <Link
                className="mb-7 flex w-fit items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-primary"
                href="/blogs"
              >
                <ChevronLeft className="size-4" />
                Back to Blogs
              </Link>
              <Badge
                variant="secondary"
                className="text-caption mb-6 h-auto rounded-md px-2.5 py-1 font-bold tracking-[0.2em] uppercase"
              >
                {post.category}
              </Badge>
              <h1 className="text-h2 mb-7 text-balance md:text-h1">
                {post.title}
              </h1>
              <p className="text-body-small mb-8 text-muted-foreground md:text-body">
                {post.summary}
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-6">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-caption font-bold text-primary-foreground">
                  Y
                </div>
                <div>
                  <p className="text-body-small font-semibold">{author}</p>
                  <p className="text-caption text-muted-foreground">
                    {post.date} · {post.readTime}
                  </p>
                </div>
              </div>
            </aside>

            <article className="min-w-0 flex-1">
              <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={post.image.src}
                  alt={post.image.alt}
                  fill
                  priority
                  sizes="(min-width: 1280px) 720px, (min-width: 1024px) 60vw, 100vw"
                  queryParameters={{ updatedAt: post.image.updatedAt }}
                  className="object-cover grayscale"
                  style={{
                    backgroundImage: `url(${lqip(post.image.src, post.image.updatedAt)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.backgroundImage = "none";
                  }}
                />
              </div>

              <div className="flex flex-col">
                {sections.map((section, index) => (
                  <div
                    key={section.heading}
                    className="flex flex-col gap-4 border-b border-border py-8 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="text-caption font-bold tracking-[0.3em] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-h3 md:text-h2">{section.heading}</h2>
                    </div>
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 40)}
                        className="text-body-small text-muted-foreground md:text-body"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </article>
          </div>

          {related.length > 0 && (
            <div className="flex flex-col gap-12 border-t border-border pt-16">
              <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
                <div className="flex max-w-xl flex-col gap-7">
                  <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                    Related Stories
                  </p>
                  <h2 className="text-h2 md:text-h1">Keep reading</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
                {related.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={relatedPost.href}
                    className="group flex flex-col gap-5"
                  >
                    <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl border border-border bg-muted">
                      <Image
                        src={relatedPost.image.src}
                        alt={relatedPost.image.alt}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        queryParameters={{
                          updatedAt: relatedPost.image.updatedAt,
                        }}
                        className="object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                        {relatedPost.category} · {relatedPost.date}
                      </p>
                      <h3 className="text-h4 md:text-h3">
                        {relatedPost.title}
                      </h3>
                      <span className="inline-flex w-fit items-center gap-1 pt-1 font-medium text-primary underline underline-offset-4 transition-opacity group-hover:opacity-75">
                        Read article <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { Blogpost2 };

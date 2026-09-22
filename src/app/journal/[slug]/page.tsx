import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";

import { CoverImage } from "@/components/cover-image";
import { Image, Video } from "@/components/imagekit";
import { JoinCta } from "@/components/join-cta";
import { mdxComponents } from "@/components/mdx";
import { PostCard } from "@/components/post-card";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  getAllPosts,
  getPostBySlug,
  toPostSummary,
} from "@/lib/content";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Article not found — YRC" };
  }

  return {
    title: `${post.title} — YRC`,
    description: post.excerpt,
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { content } = await compileMDX({
    source: post.content,
    components: mdxComponents,
  });

  const related = getAllPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3)
    .map(toPostSummary);

  return (
    <main className="flex-1">
      <section className="bg-background py-32">
        <div className="container">
          <div className="mx-auto flex max-w-6xl flex-col gap-16">
            <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:gap-16">
              <aside className="top-10 h-fit flex-shrink-0 lg:sticky lg:w-[300px] xl:w-[400px]">
                <Link
                  className="mb-7 flex w-fit items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-primary"
                  href="/journal"
                >
                  <ChevronLeft className="size-4" />
                  Back to Journal
                </Link>
                <div className="mb-6 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-caption h-auto rounded-md px-2.5 py-1 font-bold tracking-[0.2em] uppercase"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-h2 mb-7 text-balance md:text-h1">
                  {post.title}
                </h1>
                <p className="text-body-small mb-8 text-muted-foreground md:text-body">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 border-t border-border pt-6">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary text-caption font-bold text-primary-foreground">
                    Y
                  </div>
                  <div>
                    <p className="text-body-small font-semibold">
                      {post.author}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {formatDate(post.date)}
                    </p>
                  </div>
                </div>
              </aside>

              <article className="min-w-0 flex-1">
                <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                  <CoverImage
                    src={post.cover}
                    alt={post.title}
                    sizes="(min-width: 1280px) 720px, (min-width: 1024px) 60vw, 100vw"
                    className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
                  />
                </div>

                <div className="flex flex-col">{content}</div>
              </article>
            </div>

            {post.highlights && post.highlights.length > 0 && (
              <div className="flex flex-col gap-12 border-t border-border pt-16">
                <div className="flex max-w-xl flex-col gap-7">
                  <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                    Highlights
                  </p>
                  <h2 className="text-h2 md:text-h1">Moments from the run</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {post.highlights.map((media) => (
                    <div
                      key={media.src}
                      className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-muted"
                    >
                      {media.type === "image" ? (
                        <Image
                          src={media.src}
                          alt={`${post.title} highlight`}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover object-center grayscale transition-[filter] duration-500 hover:filter-none active:filter-none"
                        />
                      ) : (
                        <Video
                          src={media.src}
                          queryParameters={{ tr: "orig-true" }}
                          preload="none"
                          controls
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div className="flex flex-col gap-12 border-t border-border pt-16">
                <div className="flex max-w-xl flex-col gap-7">
                  <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                    Related Stories
                  </p>
                  <h2 className="text-h2 md:text-h1">Keep reading</h2>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  {related.map((relatedPost) => (
                    <PostCard
                      key={relatedPost.slug}
                      post={relatedPost}
                      className="sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <JoinCta />
    </main>
  );
}

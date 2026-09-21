import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

import { Image } from "@/components/imagekit";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/content-shared";
import type { PostSummary } from "@/lib/content";

interface PostCardProps {
  post: PostSummary;
  className?: string;
}

const PostCard = ({ post, className }: PostCardProps) => {
  return (
    <article
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background",
        className,
      )}
    >
      <Link
        href={`/journal/${post.slug}`}
        className="relative block aspect-16/9 overflow-hidden bg-muted"
      >
        <Image
          src={post.cover}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-center grayscale transition-transform duration-700 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="h-6 px-3 text-caption font-bold tracking-[0.2em] uppercase"
            >
              {tag}
            </Badge>
          ))}
          <p className="text-caption font-medium tracking-[0.3em] text-muted-foreground uppercase">
            {formatDate(post.date)}
          </p>
        </div>

        <h3 className="text-h4 md:text-h3">{post.title}</h3>

        <p className="text-body-small text-muted-foreground">{post.excerpt}</p>

        <Link
          href={`/journal/${post.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-1 pt-2 font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
        >
          Read article <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
};

export { PostCard };

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Blogpost2 } from "@/components/blogpost2";
import { JoinCta } from "@/components/join-cta";
import { latestArticles } from "@/data/blog";

const getPost = (slug: string) =>
  latestArticles.find((post) => post.slug === slug);

export function generateStaticParams() {
  return latestArticles.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: "Article not found — YRC" };
  }

  return {
    title: `${post.title} — YRC`,
    description: post.summary,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const related = latestArticles
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);

  return (
    <main className="flex-1">
      <Blogpost2 post={post} related={related} />
      <JoinCta />
    </main>
  );
}

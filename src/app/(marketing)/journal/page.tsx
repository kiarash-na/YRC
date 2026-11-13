import type { Metadata } from "next";

import { Blog52 } from "@/components/blog52";
import { Blog56 } from "@/components/blog56";
import { JoinCta } from "@/components/join-cta";
import { PostCard } from "@/components/post-card";
import { getAllTags, getPostSummaries, getPostsByTag } from "@/lib/posts-db";

export const metadata: Metadata = {
  title: "Journal — YRC",
  description:
    "Stories, training notes and race recaps from the Yas Rise Community journal.",
};

// ISR: journal posts change rarely; admin edits revalidate on demand.
export const revalidate = 900;

export default async function JournalPage() {
  const summaries = await getPostSummaries();
  const tags = getAllTags(summaries);

  return (
    <main className="flex-1">
      <Blog52 />

      <section className="bg-background pb-32">
        <div className="container">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <div className="flex max-w-xl flex-col gap-7">
              <p className="text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase">
                Latest
              </p>
              <h2 className="text-h2 md:text-h1">Fresh from the journal</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {summaries.slice(0, 9).map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  className="sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {tags.map((tag) => {
        const posts = getPostsByTag(summaries, tag);
        return (
          <section key={tag} className="bg-background pb-32">
            <div className="container">
              <div className="mx-auto flex max-w-6xl flex-col gap-12 border-t border-border pt-16">
                <div className="flex max-w-xl flex-col gap-7">
                  <p className="text-caption font-bold tracking-[0.3em] text-muted-foreground uppercase">
                    Topic
                  </p>
                  <h2 className="text-h2 md:text-h1">{tag}</h2>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  {posts.slice(0, 3).map((post) => (
                    <PostCard
                      key={post.slug}
                      post={post}
                      className="sm:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <Blog56 />
      <JoinCta />
    </main>
  );
}

import type { ComponentProps, ReactNode } from "react";
import { Check, Coffee, TriangleAlert } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { compileMDX } from "next-mdx-remote/rsc";

import { mdxComponents } from "@/components/mdx";
import { remarkEventBody } from "@/lib/mdx-event";

/*
 * The two Markdown parts of the event page template:
 *
 *   EventOverviewText — `events.overview`, the short lead under the
 *                       at-a-glance icon box.
 *   EventDetailsBody  — `events.body`, "Explore the details". remarkEventBody
 *                       tags the template patterns (kicker, timeline,
 *                       checklist, sign-off) and the components below render
 *                       them; everything else falls back to the shared
 *                       article styles in mdx.tsx.
 */

type Variant = { "data-variant"?: string; children?: ReactNode };
const variantOf = (props: object) => (props as Variant)["data-variant"];

/**
 * "YRC Community Trail Session · Farchant · 5 December 2026" → the session
 * name as the title, the rest as a meta line under it.
 */
function Kicker({ children }: { children?: ReactNode }) {
  const [title, ...meta] = typeof children === "string" ? children.split(" · ") : [];
  if (!title) return <p className="text-h4 text-balance md:text-h3">{children}</p>;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-h4 text-balance md:text-h3">{title}</p>
      {meta.length > 0 && (
        <p className="text-caption font-bold tracking-[0.2em] text-muted-foreground uppercase">
          {meta.join(" · ")}
        </p>
      )}
    </div>
  );
}

const overviewComponents: MDXComponents = {
  ...mdxComponents,
  p: ({ children }) => (
    <p className="mt-4 text-body text-muted-foreground first:mt-0 md:text-[1.1875rem] md:leading-[1.6]">
      {children}
    </p>
  ),
};

const detailComponents: MDXComponents = {
  ...mdxComponents,
  // Sections inside "Explore the details" sit one level below its heading.
  h2: ({ children }) => (
    <h3 className="mt-14 border-t border-border pt-10 text-h4 first:mt-0 first:border-t-0 first:pt-0 md:text-h3">
      {children}
    </h3>
  ),
  h3: (props: ComponentProps<"h3">) =>
    variantOf(props) === "kicker" ? (
      <Kicker>{props.children}</Kicker>
    ) : (
      <h4 className="mt-10 text-h4 first:mt-0">{props.children}</h4>
    ),
  ol: (props: ComponentProps<"ol">) =>
    variantOf(props) === "timeline" ? (
      <ol className="mt-8 flex flex-col">{props.children}</ol>
    ) : (
      <ol className="mt-5 list-decimal space-y-2 pl-6 text-body-small text-muted-foreground marker:text-foreground md:text-body">
        {props.children}
      </ol>
    ),
  ul: (props: ComponentProps<"ul">) =>
    variantOf(props) === "checklist" ? (
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">{props.children}</ul>
    ) : (
      <ul className="mt-5 list-disc space-y-2 pl-6 text-body-small text-muted-foreground marker:text-foreground md:text-body">
        {props.children}
      </ul>
    ),
  li: (props: ComponentProps<"li">) => {
    const variant = variantOf(props);
    if (variant === "timeline" || variant === "timeline-labelled") {
      return (
        <li data-variant={variant} className="group/step grid grid-cols-[4rem_1fr] gap-x-4 md:grid-cols-[5rem_1fr] md:gap-x-6">
          {props.children}
        </li>
      );
    }
    if (variant === "checklist-required") {
      // A must-have (e.g. "the GPX on your watch is mandatory"): full width,
      // accent frame, warning mark and a "Mandatory" tag above the text.
      return (
        <li className="flex items-start gap-3.5 rounded-xl border-2 border-yrc-accent bg-yrc-accent/10 px-4 py-4 text-body-small font-semibold text-foreground sm:col-span-2 md:px-5 md:text-body">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-yrc-accent text-yrc-accent-foreground">
            <TriangleAlert className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-caption font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Mandatory
            </span>
            <span>{props.children}</span>
          </span>
        </li>
      );
    }
    if (variant === "checklist") {
      return (
        <li className="flex items-start gap-3 rounded-xl border border-border px-4 py-3.5 text-body-small text-foreground md:text-body">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background md:mt-1">
            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="min-w-0">{props.children}</span>
        </li>
      );
    }
    return <li className="pl-1">{props.children}</li>;
  },
  time: (props: ComponentProps<"time">) =>
    variantOf(props) === "timeline" ? (
      <time className="pt-0.5 text-h4 font-semibold tabular-nums md:text-h3">{props.children}</time>
    ) : (
      <time>{props.children}</time>
    ),
  span: (props: ComponentProps<"span">) =>
    variantOf(props) === "step-label" ? (
      // "Meet 1" — names a step, e.g. one of several meet spots.
      <span className="mb-2 flex w-fit items-center rounded-full bg-foreground px-2.5 py-1 text-[0.6875rem] leading-none font-bold tracking-[0.18em] text-background uppercase">
        {props.children}
      </span>
    ) : variantOf(props) === "timeline" ? (
      // The rail: a line down the left with a yellow stop per step; the
      // last step's line stops at its dot.
      <span className="relative border-l border-border pb-8 pl-6 text-body-small text-muted-foreground group-last/step:border-transparent group-last/step:pb-0 md:pl-8 md:text-body">
        <span
          className="absolute top-2 -left-[5px] size-[9px] rounded-full bg-yrc-accent ring-4 ring-background group-data-[variant=timeline-labelled]/step:-left-[7px] group-data-[variant=timeline-labelled]/step:size-[13px] group-data-[variant=timeline-labelled]/step:ring-yrc-accent/25 md:top-2.5"
          aria-hidden="true"
        />
        <span className="block pt-0.5 md:pt-1">{props.children}</span>
      </span>
    ) : (
      <span {...props} />
    ),
  blockquote: (props: ComponentProps<"blockquote">) =>
    variantOf(props) === "signoff" ? (
      <blockquote className="mt-14 flex flex-col items-center gap-4 rounded-xl bg-muted/60 px-6 py-10 text-center [&_p]:mt-0 [&_p]:text-h4 [&_p]:font-semibold [&_p]:text-balance [&_p]:text-foreground md:[&_p]:text-h3">
        <span className="flex size-11 items-center justify-center rounded-full bg-yrc-accent text-yrc-accent-foreground">
          <Coffee className="size-5" aria-hidden="true" />
        </span>
        {props.children}
      </blockquote>
    ) : (
      <blockquote className="mt-6 border-l-2 border-yrc-accent pl-5">{props.children}</blockquote>
    ),
};

export async function EventOverviewText({ source }: { source: string }) {
  const { content } = await compileMDX({ source, components: overviewComponents });
  return <div className="mt-8">{content}</div>;
}

export async function EventDetailsBody({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    components: detailComponents,
    options: { mdxOptions: { remarkPlugins: [remarkEventBody] } },
  });
  return <div className="flex flex-col">{content}</div>;
}

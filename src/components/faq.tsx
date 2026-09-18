"use client";

import { Accordion } from "@base-ui/react/accordion";
import { MessageCircleQuestionMark, Plus } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import type { FaqItem } from "@/data/events";

interface FaqProps {
  items: FaqItem[];
  className?: string;
}

const Faq = ({ items, className }: FaqProps) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div className="flex max-w-xl flex-col items-start gap-5">
            <Badge
              variant="outline"
              className="flex h-6 items-center gap-1.5 px-3 text-caption font-bold tracking-[0.3em] text-yrc-accent uppercase"
            >
              <MessageCircleQuestionMark className="size-3.5" />
              FAQ
            </Badge>
            <h2 className="text-h2 text-balance md:text-h1">
              Frequently Asked Questions
            </h2>
            <p className="text-body-small text-pretty text-muted-foreground md:text-body">
              The essentials about YRC — who it is for, what the community
              offers and how to get involved.
            </p>
          </div>

          <Accordion.Root className="border-t border-border">
            {items.map((item, index) => (
              <Accordion.Item
                key={item.question}
                value={index}
                className="border-b border-border"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-h4 transition-colors hover:text-muted-foreground">
                    {item.question}
                    <Plus className="size-4 shrink-0 transition-transform duration-200 group-data-[open]:rotate-45" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="pr-8 pb-6 text-body-small text-muted-foreground md:text-body">
                  {item.answer}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
};

export { Faq };

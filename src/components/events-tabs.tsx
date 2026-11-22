"use client";

import { Repeat, Ticket } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventsTabsProps {
  oneOff: ReactNode;
  weekly: ReactNode;
  oneOffCount: number;
  weeklyCount: number;
}

const TRIGGER =
  "h-11 flex-none gap-2 rounded-none px-1 text-caption font-bold tracking-[0.2em] uppercase data-active:text-foreground";

/**
 * "Events" (one-off) and "Weekly runs" on the events page. /events#weekly
 * opens straight on the weekly tab (the home strip links there).
 */
export function EventsTabs({ oneOff, weekly, oneOffCount, weeklyCount }: EventsTabsProps) {
  const [tab, setTab] = useState("events");

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#weekly") setTab("weekly");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(String(value))} className="mt-12 gap-0 md:mt-16">
      <TabsList variant="line" className="h-auto w-full justify-start gap-8 border-b border-border p-0">
        <TabsTrigger value="events" className={TRIGGER}>
          <Ticket aria-hidden="true" />
          Events
          <Count n={oneOffCount} />
        </TabsTrigger>
        <TabsTrigger value="weekly" className={TRIGGER}>
          <Repeat aria-hidden="true" />
          Weekly runs
          <Count n={weeklyCount} />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="events" className="pt-10 md:pt-14">
        {oneOff}
      </TabsContent>
      <TabsContent value="weekly" id="weekly" className="scroll-mt-28 pt-10 md:pt-14">
        {weekly}
      </TabsContent>
    </Tabs>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[0.6875rem] tracking-normal text-muted-foreground tabular-nums">
      {n}
    </span>
  );
}

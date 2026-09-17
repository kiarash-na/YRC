export interface YrcEventImage {
  src: string;
  alt: string;
  updatedAt: string;
}

export interface YrcEvent {
  category: string;
  date: string;
  time: string;
  title: string;
  location: string;
  distance: string;
  level: string;
  description: string;
  image: YrcEventImage;
  cta: string;
  href: string;
}

export const upcomingEvent: YrcEvent = {
  category: "Community Run",
  date: "Sunday · 27 September 2026",
  time: "08:00",
  title: "YRC Community Run",
  location: "Munich",
  distance: "5K / 10K",
  level: "All Levels",
  description:
    "Start the week together. A relaxed community run for every level, followed by time to connect.",
  image: {
    src: "/YRC/Pillars/Pillars-move",
    alt: "YRC runners in motion on a group run",
    updatedAt: "1789641881097",
  },
  cta: "VIEW EVENT",
  href: "#runs",
};

export const upcomingEvents: YrcEvent[] = [upcomingEvent];

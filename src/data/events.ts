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
  href: "/events",
};

export const upcomingEvents: YrcEvent[] = [upcomingEvent];

export interface CourseDetail {
  title: string;
  value: string;
  description: string;
}

// No final course data exists yet — values stay generic until real program
// data is confirmed. Swap entries here once course data is available.
export const courseDetails: CourseDetail[] = [
  {
    title: "Format",
    value: "Varies by course",
    description:
      "YRC running programs are built around structured preparation, consistency and progression. The exact format is defined per course.",
  },
  {
    title: "Duration",
    value: "Varies by course",
    description:
      "Program duration depends on the course and what it builds toward. Timelines are shared together with each program.",
  },
  {
    title: "Participation",
    value: "Details announced with each program",
    description:
      "Participation details are published with each program announcement, together with everything needed to take part.",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "Who is Yas Rise Community for?",
    answer:
      "YRC is for people who want to run, train, explore and grow through shared experiences and an active community.",
  },
  {
    question: "What kind of events does YRC offer?",
    answer:
      "YRC brings together community runs, international events, training camps, structured running programs and other shared sporting experiences.",
  },
  {
    question: "Do I need to be an experienced runner to join?",
    answer:
      "YRC includes experiences designed for different levels. The requirements and difficulty can vary depending on the specific event or program.",
  },
  {
    question: "How can I join YRC?",
    answer:
      "You can join the YRC community and explore available events and activities through the website.",
  },
  {
    question: "Are YRC events only about running?",
    answer:
      "Running is at the heart of YRC, but the community also includes travel, outdoor experiences, training, mobility, strength and shared activities.",
  },
  {
    question: "Where do YRC events take place?",
    answer:
      "YRC connects people through local and international experiences. The location depends on the specific event or program.",
  },
];

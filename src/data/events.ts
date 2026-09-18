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

export const upcomingEvents: YrcEvent[] = [
  {
    category: "Community Run",
    date: "Sunday · 4 October 2026",
    time: "08:00",
    title: "YRC Community Run",
    location: "Location to be announced",
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
  },
  {
    category: "Trail Run",
    date: "Saturday · 17 October 2026",
    time: "07:30",
    title: "YRC Trail Escape",
    location: "Trailhead to be announced",
    distance: "12K",
    level: "Intermediate",
    description:
      "Off the road and into the landscape. A guided trail run through uneven terrain, built around effort, focus and the outdoors.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/pexels-roman-odintsov-5859136.jpg",
      alt: "Open landscape on a YRC trail run",
      updatedAt: "1789641870615",
    },
    cta: "VIEW EVENT",
    href: "/events",
  },
  {
    category: "Sunrise Run",
    date: "Sunday · 1 November 2026",
    time: "06:30",
    title: "YRC Sunrise Miles",
    location: "Meeting point to be announced",
    distance: "8K",
    level: "All Levels",
    description:
      "The city before it wakes. An early run that starts in the dark and finishes with the light — quiet streets, steady pace, shared silence.",
    image: {
      src: "/YRC/Home page/Hero-right",
      alt: "Runner moving through early morning light",
      updatedAt: "1789641779716",
    },
    cta: "VIEW EVENT",
    href: "/events",
  },
  {
    category: "Speed Session",
    date: "Wednesday · 11 November 2026",
    time: "19:00",
    title: "YRC Interval Night",
    location: "Track to be announced",
    distance: "Interval Sets",
    level: "Intermediate / Advanced",
    description:
      "Structured speed work under the lights. Repeats, recoveries and progression — a session designed to make you faster, together.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M05.jpg",
      alt: "YRC athletes pushing the pace during a speed session",
      updatedAt: "1789681291699",
    },
    cta: "VIEW EVENT",
    href: "/events",
  },
  {
    category: "International Event",
    date: "Sunday · 6 December 2026",
    time: "08:30",
    title: "YRC Race Meetup — Valencia",
    location: "Valencia, Spain",
    distance: "Marathon / 10K",
    level: "All Levels",
    description:
      "YRC travels together. A community meetup around race day in Valencia — shared preparation, shared experience, one start line.",
    image: {
      src: "/YRC/Events/Upcoming/Istanbul%20Marathon%202025/3.jpg",
      alt: "YRC runners together at an international race",
      updatedAt: "1789641875693",
    },
    cta: "VIEW EVENT",
    href: "/events",
  },
];

export const upcomingEvent: YrcEvent = upcomingEvents[0];

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

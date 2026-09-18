export interface BlogPostImage {
  src: string;
  alt: string;
  updatedAt: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  image: BlogPostImage;
  href: string;
}

const basePath = "/YRC/Events/Upcoming/Istanbul%20Marathon%202025";

export const featuredStory: BlogPost = {
  slug: "build-the-habit-not-just-the-pace",
  title: "BUILD THE HABIT, NOT JUST THE PACE",
  summary:
    "How consistent running turns scattered workouts into a sustainable routine.",
  category: "Training",
  date: "September 2026",
  readTime: "6 min read",
  image: {
    src: `${basePath}/M07.jpg`,
    alt: "YRC runners celebrating together at the finish",
    updatedAt: "1789681140651",
  },
  href: "/blogs/build-the-habit-not-just-the-pace",
};

export const secondaryStories: BlogPost[] = [
  {
    slug: "strength-for-runners-what-actually-matters",
    title: "STRENGTH FOR RUNNERS: WHAT ACTUALLY MATTERS",
    summary:
      "The few strength fundamentals that keep runners healthy, durable and progressing — without living in the gym.",
    category: "Training",
    date: "September 2026",
    readTime: "8 min read",
    image: {
      src: `${basePath}/pexels-roman-odintsov-5859136.jpg`,
      alt: "Runner training outdoors during a YRC trip",
      updatedAt: "1789681295806",
    },
    href: "/blogs/strength-for-runners-what-actually-matters",
  },
  {
    slug: "from-5k-to-your-first-half-marathon",
    title: "FROM 5K TO YOUR FIRST HALF MARATHON",
    summary:
      "A realistic path from comfortable 5K runs to standing on your first half marathon start line with confidence.",
    category: "Running",
    date: "August 2026",
    readTime: "10 min read",
    image: {
      src: `${basePath}/03-1.jpg`,
      alt: "Runners on the course during a YRC event",
      updatedAt: "1789681290358",
    },
    href: "/blogs/from-5k-to-your-first-half-marathon",
  },
  {
    slug: "why-running-with-other-people-changes-the-journey",
    title: "WHY RUNNING WITH OTHER PEOPLE CHANGES THE JOURNEY",
    summary:
      "Shared miles, shared motivation — how community turns running from a task into something you look forward to.",
    category: "Community",
    date: "August 2026",
    readTime: "5 min read",
    image: {
      src: `${basePath}/photo_5953857689656346515_w.jpg`,
      alt: "YRC community member mid-run with the group",
      updatedAt: "1789681284418",
    },
    href: "/blogs/why-running-with-other-people-changes-the-journey",
  },
];

export const latestArticles: BlogPost[] = [
  featuredStory,
  ...secondaryStories,
  {
    slug: "what-to-expect-from-your-first-community-run",
    title: "WHAT TO EXPECT FROM YOUR FIRST COMMUNITY RUN",
    summary:
      "No bibs, no pressure, no one left behind — what actually happens when you show up to a YRC group run for the first time.",
    category: "Events",
    date: "July 2026",
    readTime: "4 min read",
    image: {
      src: `${basePath}/photo_5953857689656346514_w.jpg`,
      alt: "YRC runners gathering before a community run",
      updatedAt: "1789681310000",
    },
    href: "/blogs/what-to-expect-from-your-first-community-run",
  },
  {
    slug: "training-beyond-the-starting-line",
    title: "TRAINING BEYOND THE STARTING LINE",
    summary:
      "Recovery, sleep and the boring weeks nobody posts about — the invisible work that decides how far your running actually goes.",
    category: "Running",
    date: "July 2026",
    readTime: "7 min read",
    image: {
      src: `${basePath}/M05.jpg`,
      alt: "YRC runner pushing through the final stretch of a long run",
      updatedAt: "1789681320000",
    },
    href: "/blogs/training-beyond-the-starting-line",
  },
];

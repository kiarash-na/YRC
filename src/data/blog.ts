export interface BlogPostImage {
  src: string;
  alt: string;
  updatedAt: string;
}

export interface BlogSection {
  heading: string;
  paragraphs: string[];
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
  author?: string;
  sections?: BlogSection[];
}

const basePath = "/YRC/Events/Upcoming/Istanbul%20Marathon%202025";

export const featuredStory: BlogPost = {
  slug: "build-the-habit-not-just-the-pace",
  title: "BUILD THE HABIT, NOT JUST THE PACE",
  summary:
    "How consistent running turns scattered workouts into a sustainable routine.",
  category: "Running",
  date: "September 2026",
  readTime: "6 min read",
  image: {
    src: `${basePath}/M07.jpg`,
    alt: "YRC runners celebrating together at the finish",
    updatedAt: "1789681140651",
  },
  href: "/blogs/build-the-habit-not-just-the-pace",
  author: "YRC Editorial",
  sections: [
    {
      heading: "Why consistency matters",
      paragraphs: [
        "Most running plans don't fail because they were too hard. They fail because they never became part of the week. A heroic long run followed by ten quiet days moves you less than three ordinary runs that actually happen, every week, without negotiation.",
        "Consistency is what turns running from an event into a habit. When the run is simply what you do on Tuesday and Saturday morning, you stop spending energy deciding whether to go — and that energy goes into the miles instead.",
      ],
    },
    {
      heading: "Start with a realistic routine",
      paragraphs: [
        "The routine you keep beats the routine you admire. Look at your actual week — work, family, sleep — and find the slots where running fits without a fight. Two or three fixed days is enough to begin.",
        "Anchor those runs to something that already exists: before breakfast, straight after work, with the group on Sunday. The fewer decisions between you and the door, the more often you'll get through it.",
      ],
    },
    {
      heading: "Build gradually",
      paragraphs: [
        "Once the routine holds, let it grow slowly. Add a little time, a little distance, or one extra day — not all three at once. The goal is a workload your body and your calendar can absorb without resentment.",
        "Progress in running is quiet. Weeks that feel unremarkable are usually the ones doing the work, so resist the urge to rush them.",
      ],
    },
    {
      heading: "Combine running with strength and mobility",
      paragraphs: [
        "Running alone builds runners who run well until something hurts. A short strength session and a few minutes of mobility work each week keep the machine that does the running in good order.",
        "It doesn't need to be elaborate. A handful of fundamental movements, done consistently — the same principle as the running itself — is enough to keep you durable through the season.",
      ],
    },
    {
      heading: "Let the race be a milestone, not the entire purpose",
      paragraphs: [
        "A race on the calendar is a useful thing: it gives the weeks a shape and a reason. But if the race is the only reason you run, the habit ends at the finish line.",
        "Treat race day as a checkpoint in a longer story. The fitness, the friends and the routine you built on the way there are the real result — the medal is just the receipt.",
      ],
    },
    {
      heading: "Keep the journey sustainable",
      paragraphs: [
        "Sustainable running leaves room for life. Missed weeks, tired days and seasons where running takes a back seat are not failures — they're part of any routine that lasts years instead of months.",
        "Build the habit gently enough that you can return to it after any break. That's what turns running from a phase into something you simply do, for as long as you want to keep doing it.",
      ],
    },
  ],
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
      src: `${basePath}/M01.jpg`,
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
      src: `${basePath}/4.jpg`,
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
      src: `${basePath}/03.jpg`,
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

// blog22 already renders featuredStory + secondaryStories on /blogs, so
// latestArticles (blog35) must exclude them to avoid duplicate images on
// the page. latestArticles stays the full list for /blogs/[slug] routing.
const featuredSlugs = new Set([
  featuredStory.slug,
  ...secondaryStories.map((post) => post.slug),
]);

export const moreArticles: BlogPost[] = latestArticles.filter(
  (post) => !featuredSlugs.has(post.slug),
);

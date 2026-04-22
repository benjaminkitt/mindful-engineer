export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export interface Article {
  kind: "article";
  slug: string;
  title: string;
  deck: string;
  summary: string;
  date: string;
  updated?: string;
  readMinutes: number;
  tags: string[];
  featured: boolean;
  blocks: ArticleBlock[];
}

export interface Note {
  kind: "note";
  slug: string;
  date: string;
  body: string;
}

export interface LinkEntry {
  kind: "link";
  slug: string;
  date: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  body: string;
}

export interface Snippet {
  kind: "snippet";
  slug: string;
  date: string;
  title: string;
  language: string;
  summary: string;
  body: string;
  code: string;
}

export type StreamEntry = Article | Note | LinkEntry | Snippet;

export const siteMeta = {
  name: "The Mindful Engineer",
  domain: "mindful.engineer",
  siteUrl: "https://mindful.engineer",
  author: "Benjamin Kitt",
  email: "mail@mindful.engineer",
  repository: "https://github.com/benjaminkitt/mindful-engineer",
  tagline: "Moving fast. Being present.",
  description:
    "A monastery-first public reading site for articles, notes, links, snippets, and durable working notes about software and the people living inside it.",
};

export const navigation = [
  { href: "/", label: "Index", description: "Return to the front page" },
  { href: "/articles", label: "Articles", description: "Long-form writing" },
  { href: "/notes", label: "Notes", description: "Short-form notebook entries" },
  { href: "/links", label: "Links", description: "Annotated references" },
  { href: "/archive", label: "Archive", description: "Chronological archive" },
  { href: "/about", label: "About", description: "About Benjamin and the site" },
  { href: "/now", label: "Now", description: "Current snapshot" },
] as const;

const sortByDateDesc = <T extends { date: string }>(items: T[]) =>
  [...items].sort((left, right) => {
    return new Date(right.date).getTime() - new Date(left.date).getTime();
  });

const articleSeed: Article[] = [
  {
    kind: "article",
    slug: "fast-and-present",
    title: "Fast and Present Are Not Opposites",
    deck: "On shipping quickly without leaving anyone behind.",
    summary:
      "Mindful engineering is not slow engineering. It is fast engineering done with both eyes open: to the work and to the people the work lands on.",
    date: "2026-04-12",
    updated: "2026-04-16",
    readMinutes: 7,
    tags: ["practice", "teams", "care"],
    featured: true,
    blocks: [
      {
        type: "paragraph",
        text: "There is a version of mindful engineering I reject on sight. It treats care as delay, patience as hesitation, and thoughtfulness as an excuse to ship less. I do not believe that version helps anyone.",
      },
      {
        type: "paragraph",
        text: "The best engineers I know are fast. They merge constantly. They cut away dead work early. They do not admire churn, but they are not sentimental about it either. What makes them mindful is not the pace. It is that they stay awake to what their pace is doing.",
      },
      { type: "heading", text: "Speed is the easy part now" },
      {
        type: "paragraph",
        text: "Modern tools will carry a competent engineer an astonishing distance. The hard part is no longer movement. The hard part is orientation. What are we moving toward, and who has to live with the consequences after we move?",
      },
      {
        type: "quote",
        text: "A codebase is not just a machine. It is also a place people are trying to arrive inside.",
      },
      {
        type: "paragraph",
        text: "When a team ships quickly, someone is always learning the behavior you already replaced. Someone in support is writing a sentence that explains the thing you merged this morning. Someone who trusted the old shape of the product is quietly feeling left behind.",
      },
      { type: "heading", text: "Presence is how care stays real" },
      {
        type: "list",
        items: [
          "Ship the change as soon as it is ready instead of sandbagging it for optics.",
          "Write the one-paragraph explanation before you close the pull request.",
          "Notice who the change is hardest on and tell them you noticed.",
          "Make the new path legible enough that the next person does not have to reverse-engineer your intent.",
        ],
      },
      {
        type: "paragraph",
        text: "Fast and present are not competing virtues. They are the same discipline seen from different angles. One governs movement. The other governs consequence.",
      },
    ],
  },
  {
    kind: "article",
    slug: "fomo-as-compass",
    title: "FOMO as a Compass, Not a Whip",
    deck: "The feeling is information. The reflex is usually the mistake.",
    summary:
      "There is too much to learn. That is the permanent condition of software, not a temporary problem to outrun.",
    date: "2026-03-28",
    readMinutes: 5,
    tags: ["practice", "change"],
    featured: true,
    blocks: [
      {
        type: "paragraph",
        text: "I have never had a year in this profession where I was caught up. Something new has always just shipped. Someone else has always already built a sharper version of the thing I am still learning.",
      },
      {
        type: "paragraph",
        text: "The useful move is not to outrun that feeling. The useful move is to ask what it is pointing at. Sometimes it points at a genuine shift you should investigate. More often it points at fatigue, loneliness, or the anxiety of being visible while still incomplete.",
      },
      { type: "heading", text: "Deliberate exclusion is part of learning" },
      {
        type: "paragraph",
        text: "I keep a list of things I have intentionally not learned this quarter. That list is not a moral document. It is a map of where my attention is already committed.",
      },
      {
        type: "quote",
        text: "The point is not to be current. The point is to be chosen on purpose.",
      },
      {
        type: "paragraph",
        text: "When FOMO shows up, I try to name it before obeying it. Naming it breaks the spell long enough to make a real choice.",
      },
    ],
  },
  {
    kind: "article",
    slug: "nobody-wants-to-be-left-behind",
    title: "Nobody Wants to Be the Person Left Behind",
    deck: "A note to the teammate who joined on the wrong week.",
    summary:
      "Every fast team generates, as a byproduct, people who feel one version behind. Pretending otherwise is its own kind of carelessness.",
    date: "2026-03-14",
    readMinutes: 4,
    tags: ["teams", "onboarding"],
    featured: false,
    blocks: [
      {
        type: "paragraph",
        text: "Every fast team accidentally creates someone who feels late. Usually it is the new hire. Sometimes it is the person who took a week off. Sometimes it is the person who was helping another team while the architecture shifted underneath them.",
      },
      {
        type: "paragraph",
        text: "The fix is rarely to stop moving. The fix is to stop treating legibility as optional. Explain the rename. Keep the migration note. Leave behind the breadcrumbs that would have helped you when you were new.",
      },
      { type: "heading", text: "Make your speed legible" },
      {
        type: "list",
        items: [
          "Prefer public explanations over private clarifications.",
          "Leave changelog context with the code, not just in chat.",
          "Turn local lore into reusable notes before it hardens into hierarchy.",
        ],
      },
      {
        type: "paragraph",
        text: "Nobody wants to be the person who joined on the wrong week. Good teams act like they remember that.",
      },
    ],
  },
];

const noteSeed: Note[] = [
  {
    kind: "note",
    slug: "speed-without-presence",
    date: "2026-04-15T09:14:00",
    body: "Speed without presence is just chaos with a deploy pipeline.",
  },
  {
    kind: "note",
    slug: "changelog-as-care",
    date: "2026-04-14T16:02:00",
    body: "A good changelog entry is the cheapest act of care a fast team can perform.",
  },
  {
    kind: "note",
    slug: "they-are-arriving",
    date: "2026-04-11T07:40:00",
    body: "Paired for an hour with the teammate who joined last month. They are not behind. They are arriving.",
  },
  {
    kind: "note",
    slug: "fomo-weather",
    date: "2026-04-08T22:11:00",
    body: "FOMO showed up on schedule this morning. Named it, thanked it, kept shipping the thing I had already chosen.",
  },
];

const linkSeed: LinkEntry[] = [
  {
    kind: "link",
    slug: "worse-is-better",
    date: "2026-04-10",
    title: "Worse Is Better, twenty-five years on",
    source: "gabriellipman.net",
    url: "https://gabriellipman.net/worse-is-better-twenty-five-years-on",
    summary: "A revisit of the essay everyone cites and fewer people actually read.",
    body: "Worth revisiting every couple of years. What felt contrarian in 2000 reads like common sense now, which is itself the point.",
  },
  {
    kind: "link",
    slug: "attention-is-debt",
    date: "2026-04-05",
    title: "The Attention Economy Is a Debt",
    source: "new.public",
    url: "https://new.public/attention-economy-is-a-debt",
    summary: "A useful frame for notifications, interruption, and borrowed focus.",
    body: "The line that stuck with me is that every push notification is a small loan against your future concentration. Once you see it that way, a lot of product decisions get easier to judge.",
  },
];

const snippetSeed: Snippet[] = [
  {
    kind: "snippet",
    slug: "retry-with-jitter",
    title: "Retry with jitter, honestly",
    date: "2026-04-07",
    language: "python",
    summary: "Exponential backoff, full jitter, and no pretend sophistication.",
    body: "This is the version I actually ship. Backoff, jitter, and one place to stop lying to yourself about how many retries you need.",
    code: `def retry(fn, attempts=5, base=0.25):\n    for index in range(attempts):\n        try:\n            return fn()\n        except Retryable:\n            if index == attempts - 1:\n                raise\n            sleep(base * (2 ** index) + random() * base)`,
  },
  {
    kind: "snippet",
    slug: "git-graph-alias",
    title: "The only git alias I have kept",
    date: "2026-03-30",
    language: "gitconfig",
    summary: "Everything else I tried was more clever than useful.",
    body: "Every fancier shell helper I have invented eventually collapsed under its own ceremony. This one survived because it answers the question I actually ask.",
    code: `[alias]\n    graph = log --oneline --graph --decorate --all`,
  },
];

export const articles = sortByDateDesc(articleSeed);
export const notes = sortByDateDesc(noteSeed);
export const links = sortByDateDesc(linkSeed);
export const snippets = sortByDateDesc(snippetSeed);

export const aboutPage = {
  title: "I'm Benjamin.",
  deck: "Tech is my craft. People are my concern. This site is where those two facts get forced into the same sentence.",
  body: [
    "I have spent most of my career around fast-moving software teams: startups, platform work, internal tools, product systems that changed weekly and still needed to remain humane.",
    "Mindful, in the name, is not a plea for slower engineering. It is a commitment to staying awake while moving quickly: to choices, tradeoffs, consequences, and to the teammate who may be arriving one version behind the rest of the room.",
    "This public site is the durable reading surface for that practice. Articles when a thought earns the space. Notes when it does not. Links and snippets when the useful thing is smaller than an essay but still worth keeping.",
  ],
  facts: [
    ["Currently", "Independent, Austin, Texas"],
    ["Previously", "Stripe, a compiler startup, and a research lab"],
    ["Writing in", "A serif voice with mono structure"],
    ["Built with", "Astro, static files, and a stubborn preference for ownership"],
    ["Publishing rhythm", "Weekly-ish, never on schedule"],
    ["Contact", "mail@mindful.engineer"],
  ],
};

export const nowPage = {
  updated: "2026-04-16",
  location: "Austin, Texas",
  working:
    "Building a durable publishing home for Mindful Engineer while continuing to ship internal tools quickly and with fewer surprises.",
  learning:
    "Rust again, properly this time. Also how to give feedback sooner without making it rougher than it needs to be.",
  listening: "Mostly Arvo Part and Nils Frahm. A little too much ambient rain in between.",
  reading: [
    { title: "The Art of Doing Science and Engineering", author: "Richard Hamming" },
    { title: "A Pattern Language", author: "Christopher Alexander et al." },
    { title: "The Making of the Atomic Bomb", author: "Richard Rhodes" },
  ],
  focus: [
    "Keeping the public site static-first while leaving clean seams for the later content pipeline.",
    "Writing the first batch of representative pieces so the design can be reviewed in something closer to reality.",
    "Turning more private team lessons into public notes before they harden into folklore.",
  ],
};

export const getFeaturedArticles = () => articles.filter((article) => article.featured);

export const getCounts = () => ({
  article: articles.length,
  note: notes.length,
  link: links.length,
  snippet: snippets.length,
});

export const getRecentStream = (limit?: number) => {
  const entries = sortByDateDesc<StreamEntry>([
    ...articles,
    ...notes,
    ...links,
    ...snippets,
  ]);
  return typeof limit === "number" ? entries.slice(0, limit) : entries;
};

export const getArchiveGroups = () => {
  const groups = new Map<string, StreamEntry[]>();

  for (const entry of getRecentStream()) {
    const year = new Date(entry.date).getFullYear().toString();
    const bucket = groups.get(year) ?? [];
    bucket.push(entry);
    groups.set(year, bucket);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => Number(right) - Number(left))
    .map(([year, entries]) => ({ year, entries }));
};

export const getEntryPath = (entry: StreamEntry) => {
  switch (entry.kind) {
    case "article":
      return `/articles/${entry.slug}`;
    case "note":
      return `/notes/${entry.slug}`;
    case "link":
      return `/links/${entry.slug}`;
    case "snippet":
      return `/snippets/${entry.slug}`;
  }
};

export const formatDisplayDate = (value: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export const formatDisplayDateTime = (value: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatArchiveDate = (value: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  })
    .format(new Date(value))
    .toLowerCase();
};

export const formatDisplayDateShort = (value: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  })
    .format(new Date(value))
    .toLowerCase();
};

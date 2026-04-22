export type EntryType = 'article' | 'note' | 'link' | 'snippet';

export type BaseEntry = {
  id: string;
  type: EntryType;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
};

export type ArticleEntry = BaseEntry & {
  type: 'article';
  title: string;
  subtitle: string;
  summary: string;
  readMinutes: number;
  featured?: boolean;
  body: Array<
    | { kind: 'paragraph'; text: string }
    | { kind: 'heading'; text: string }
    | { kind: 'pullquote'; text: string }
    | { kind: 'ordered-list'; items: string[] }
  >;
};

export type NoteEntry = BaseEntry & {
  type: 'note';
  body: string;
  title?: string;
};

export type LinkEntry = BaseEntry & {
  type: 'link';
  title: string;
  url: string;
  source: string;
  commentary: string;
};

export type SnippetEntry = BaseEntry & {
  type: 'snippet';
  title: string;
  language: string;
  code: string;
  summary: string;
};

export type Entry = ArticleEntry | NoteEntry | LinkEntry | SnippetEntry;

export const entries: Entry[] = [
  {
    id: 'fast-and-present-are-not-opposites',
    type: 'article',
    slug: 'fast-and-present-are-not-opposites',
    title: 'Fast and Present Are Not Opposites',
    subtitle: 'On shipping quickly without leaving anyone behind.',
    summary:
      'Mindful engineering is not slow engineering. It is fast engineering done with both eyes open — to the work, and to the people doing it.',
    publishedAt: '2026-04-12T09:00:00Z',
    readMinutes: 7,
    featured: true,
    tags: ['practice', 'teams'],
    body: [
      {
        kind: 'paragraph',
        text: 'There is a version of mindful engineering I want to reject on sight. It is the one that implies we should slow down, take a breath, write fewer lines, ship less often. I have seen teams adopt it and grow worse — not kinder, not more humane, just slower, with all the same politics.',
      },
      {
        kind: 'paragraph',
        text: 'The best engineers I know ship constantly. They merge multiple times a day. They rewrite things on Fridays. They treat velocity as a form of respect for the problem. What makes them mindful is not their pace. It is that they are awake to the choices they are making at that pace.',
      },
      { kind: 'heading', text: 'Speed is the easy part' },
      {
        kind: 'paragraph',
        text: 'If you have been doing this for long enough, you can go fast. Modern tools will carry you a stunning distance. The hard part is no longer how to move quickly. It is what to point that speed at, and who to bring with you while you do.',
      },
      {
        kind: 'pullquote',
        text: 'FOMO never goes away. There is always more to learn, more to try, more being built next door. The question is not whether you feel it. It is what you do inside that feeling.',
      },
      {
        kind: 'paragraph',
        text: 'Shipping fast creates a shockwave behind you. Someone on your team is learning the tool you already mastered. Someone on the support side is answering for the change you made this morning. Someone who loved the old behavior is, quietly, feeling left behind.',
      },
      {
        kind: 'ordered-list',
        items: [
          'Ship the change today. Do not sandbag to make it easier on yourself.',
          'Write the one-paragraph explanation before you close the PR. Not after.',
          'Notice who the change is hardest on. Tell them you noticed.',
          'Ask the person who was learning the old way what would help now. Do the thing they said.',
        ],
      },
      {
        kind: 'paragraph',
        text: 'Fast and present are not opposites. They are the same practice. The engineers I want to work with — and the engineer I am trying to be — move decisively, ship relentlessly, and never forget that a codebase is a thing people live inside.',
      },
    ],
  },
  {
    id: 'fomo-as-a-compass-not-a-whip',
    type: 'article',
    slug: 'fomo-as-a-compass-not-a-whip',
    title: 'FOMO as a Compass, Not a Whip',
    subtitle: 'The feeling is information. What you do with it is the practice.',
    summary:
      'There is too much to learn. That is the permanent condition of working in software, not a problem to outrun. But the feeling can still be useful.',
    publishedAt: '2026-03-28T09:00:00Z',
    readMinutes: 5,
    featured: true,
    tags: ['practice', 'change'],
    body: [
      {
        kind: 'paragraph',
        text: 'There has never been a year in my career where I was not behind. Something new has always just shipped. Someone has always been using it already. This is not a problem to solve. It is the permanent condition of the job.',
      },
      {
        kind: 'paragraph',
        text: 'What changed for me was treating the fear of missing out as data. When it shows up, it is telling me something. Sometimes it is telling me there is a real shift I should chase. More often it is telling me I am lonely, or tired, or that my team has been heads-down for too long.',
      },
      { kind: 'heading', text: 'The list stays open' },
      {
        kind: 'paragraph',
        text: 'I keep a running list of things I have deliberately chosen not to learn this quarter. Not because they are bad. Because I am pointing my speed somewhere else right now. The list is not a moral document. It is a map of my attention.',
      },
    ],
  },
  {
    id: 'nobody-wants-to-be-the-person-left-behind',
    type: 'article',
    slug: 'nobody-wants-to-be-the-person-left-behind',
    title: 'Nobody Wants to Be the Person Left Behind',
    subtitle: 'A short note to the team member who joined the wrong week.',
    summary:
      'Every fast team produces, as a byproduct, people who feel a version behind. Here is what I try to do about it.',
    publishedAt: '2026-03-14T09:00:00Z',
    readMinutes: 4,
    tags: ['teams', 'care'],
    body: [
      {
        kind: 'paragraph',
        text: 'Every fast team, as a byproduct of being fast, produces people who feel a version behind. You did not mean to leave them there. You were just shipping. But they are there, and pretending otherwise is its own kind of carelessness.',
      },
    ],
  },
  {
    id: '2026-04-15-speed-without-presence',
    type: 'note',
    slug: '2026-04-15-speed-without-presence',
    publishedAt: '2026-04-15T09:14:00Z',
    body: 'Speed without presence is just chaos with a deploy pipeline.',
    tags: ['practice'],
  },
  {
    id: '2026-04-14-good-changelog-entry',
    type: 'note',
    slug: '2026-04-14-good-changelog-entry',
    publishedAt: '2026-04-14T16:02:00Z',
    body: 'A good changelog entry is the cheapest act of care a fast team can perform.',
    tags: ['teams'],
  },
  {
    id: '2026-04-11-they-are-arriving',
    type: 'note',
    slug: '2026-04-11-they-are-arriving',
    publishedAt: '2026-04-11T07:40:00Z',
    body: 'Paired for an hour today with the teammate who joined last month. They are not behind. They are arriving.',
    tags: ['care'],
  },
  {
    id: 'worse-is-better-twenty-five-years-on',
    type: 'link',
    slug: 'worse-is-better-twenty-five-years-on',
    publishedAt: '2026-04-10T09:00:00Z',
    title: 'Worse is Better, twenty-five years on',
    source: 'gabriellipman.net',
    url: 'https://gabriellipman.net/',
    commentary:
      'The essay everyone cites and fewer have read. Worth revisiting every couple of years; what felt like contrarianism in 2000 reads like common sense now, which is itself the point.',
    tags: ['links'],
  },
  {
    id: 'the-attention-economy-is-a-debt',
    type: 'link',
    slug: 'the-attention-economy-is-a-debt',
    publishedAt: '2026-04-05T09:00:00Z',
    title: 'The Attention Economy is a Debt',
    source: 'new.public',
    url: 'https://new.public/',
    commentary:
      'A piece on notifications as borrowed time. The framing — that every push notification is a loan against your future focus — has stuck with me for weeks.',
    tags: ['attention'],
  },
  {
    id: 'retry-with-jitter-honestly',
    type: 'snippet',
    slug: 'retry-with-jitter-honestly',
    publishedAt: '2026-04-07T09:00:00Z',
    title: 'Retry with jitter, honestly',
    language: 'python',
    code: "def retry(fn, attempts=5, base=0.25):\n    for i in range(attempts):\n        try:\n            return fn()\n        except Retryable:\n            if i == attempts - 1:\n                raise\n            sleep(base * (2 ** i) + random() * base)",
    summary:
      'The version I actually ship. Exponential backoff, full jitter, one line of randomness. Everything else is a configuration option I did not need.',
    tags: ['python', 'reliability'],
  },
  {
    id: 'the-only-git-alias-i-have-kept',
    type: 'snippet',
    slug: 'the-only-git-alias-i-have-kept',
    publishedAt: '2026-03-30T09:00:00Z',
    title: 'The only git alias I have kept',
    language: 'bash',
    code: '# ~/.gitconfig\n[alias]\n    graph = log --oneline --graph --decorate --all',
    summary:
      "Everything else I've tried — elaborate prompts, custom scripts — I've abandoned within a month. This one has survived three laptops.",
    tags: ['git', 'tooling'],
  },
];

export const staticPages = {
  about: {
    title: 'About',
    summary: 'A short note on the person and practice behind Mindful Engineer.',
    intro:
      'I ship quickly, think carefully, and keep returning to the human consequences of technical change.',
    body: [
      'Mindful Engineer is a publishing home for essays, notes, links, and code fragments about software, organizational change, and the people who live inside systems while they are being rebuilt.',
      'The tone is monastery-first: warm paper, deep ink, visible structure, and enough quiet to think in public without turning the site into a generic product blog.',
      'This is where I work out what I think before the thought has to become a process, a standard, or a slide deck.',
    ],
    facts: [
      { label: 'Based in', value: 'Lisbon, Portugal' },
      { label: 'Works on', value: 'Software delivery, change leadership, product engineering' },
      { label: 'Interested in', value: 'Calm systems, humane velocity, careful tooling' },
      { label: 'Elsewhere', value: 'GitHub, RSS, and long walks without notifications' },
    ],
  },
  now: {
    title: 'Now',
    summary: 'What has my attention right now.',
    updatedAt: '2026-04-16',
    blocks: [
      {
        title: 'Working on',
        body: 'Shipping a new internal tool every week, and being honest about which ones stick.',
      },
      {
        title: 'Learning',
        body: 'Rust, properly this time. Also: how to give feedback faster without being careless.',
      },
      {
        title: 'Reading',
        list: ['The Art of Doing Science and Engineering — Hamming', 'A Pattern Language — Alexander et al.'],
      },
      {
        title: 'Listening',
        body: 'Mostly Arvo Pärt. Some Nils Frahm. Podcasts at 1.6x.',
      },
    ],
  },
} as const;

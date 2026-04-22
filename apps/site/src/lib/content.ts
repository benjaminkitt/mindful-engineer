import { entries, type ArticleEntry, type Entry, type EntryType, staticPages } from '@/content/entries';

const typeOrder: EntryType[] = ['article', 'note', 'link', 'snippet'];

export function sortByPublishedDesc<T extends Entry>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getEntriesByType<T extends EntryType>(type: T) {
  return sortByPublishedDesc(entries.filter((entry) => entry.type === type)) as Extract<Entry, { type: T }>[];
}

export function getFeaturedArticles() {
  return getEntriesByType('article').filter((entry) => entry.featured);
}

export function getRecentStream() {
  return sortByPublishedDesc(entries);
}

export function getArchiveGroups() {
  const groups = new Map<number, Entry[]>();
  for (const entry of sortByPublishedDesc(entries)) {
    const year = new Date(entry.publishedAt).getUTCFullYear();
    const bucket = groups.get(year) ?? [];
    bucket.push(entry);
    groups.set(year, bucket);
  }
  return [...groups.entries()].map(([year, items]) => ({ year, items }));
}

export function getEntryUrl(entry: Entry) {
  switch (entry.type) {
    case 'article':
      return `/articles/${entry.slug}`;
    case 'note':
      return `/notes/${entry.slug}`;
    case 'link':
      return `/links/${entry.slug}`;
    case 'snippet':
      return `/snippets/${entry.slug}`;
  }
}

export function getEntryLabel(type: EntryType) {
  return {
    article: 'Article',
    note: 'Note',
    link: 'Link',
    snippet: 'Snippet',
  }[type];
}

export function getArticleNeighbors(article: ArticleEntry) {
  const articles = getEntriesByType('article');
  const index = articles.findIndex((item) => item.id === article.id);
  return {
    newer: index > 0 ? articles[index - 1] : undefined,
    older: index >= 0 && index < articles.length - 1 ? articles[index + 1] : undefined,
  };
}

export function getStaticPage<T extends keyof typeof staticPages>(slug: T): (typeof staticPages)[T] {
  return staticPages[slug];
}

export function getContentCounts() {
  return typeOrder.map((type) => ({ type, count: entries.filter((entry) => entry.type === type).length }));
}

export function formatDate(value: string, includeTime = false) {
  const date = new Date(value);
  const day = date.getUTCDate();
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const year = date.getUTCFullYear();

  if (!includeTime) {
    return `${day} ${month} ${year}`;
  }

  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

  return `${day} ${month} ${year} · ${time} UTC`;
}

export function formatDateShort(value: string) {
  const date = new Date(value);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toLowerCase();
  return `${day} ${month}`;
}

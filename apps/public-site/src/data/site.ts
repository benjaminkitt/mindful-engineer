import { type CollectionEntry, getCollection } from "astro:content";

export interface BaseEntry {
	id: string;
	slug: string;
	date: string;
}

export interface Article extends BaseEntry {
	kind: "article";
	title: string;
	deck: string;
	summary: string;
	updated?: string;
	readMinutes: number;
	tags: string[];
	featured: boolean;
}

export interface Note extends BaseEntry {
	kind: "note";
	body: string;
}

export interface LinkEntry extends BaseEntry {
	kind: "link";
	title: string;
	source: string;
	url: string;
	summary: string;
	body: string;
	titleInferred: boolean;
}

export interface Snippet extends BaseEntry {
	kind: "snippet";
	title: string;
	language: string;
	summary: string;
	body: string;
	code: string;
}

export interface AboutPage {
	title: string;
	deck: string;
	body: string[];
	facts: Array<[string, string]>;
}

export interface NowPage {
	title: string;
	deck: string;
	updated: string;
	location: string;
	working: string;
	learning: string;
	listening: string;
	reading: Array<{ title: string; author: string }>;
	focus: string[];
}

interface LoadedContent {
	articles: Article[];
	articleSources: Map<string, CollectionEntry<"articles">>;
	notes: Note[];
	links: LinkEntry[];
	snippets: Snippet[];
	aboutPage: AboutPage;
	nowPage: NowPage;
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
	{
		href: "/notes",
		label: "Notes",
		description: "Short-form notebook entries",
	},
	{ href: "/links", label: "Links", description: "Annotated references" },
	{
		href: "/snippets",
		label: "Snippets",
		description: "Code-centered entries",
	},
	{ href: "/archive", label: "Archive", description: "Chronological archive" },
	{
		href: "/about",
		label: "About",
		description: "About Benjamin and the site",
	},
	{ href: "/now", label: "Now", description: "Current snapshot" },
] as const;

const sortByDateDesc = <T extends BaseEntry>(items: T[]) =>
	[...items].sort((left, right) => {
		return new Date(right.date).getTime() - new Date(left.date).getTime();
	});

const requireSlug = (slug: string, entryLabel: string) => {
	const normalized = slug.trim();
	if (!normalized) {
		throw new Error(`Missing slug for ${entryLabel}`);
	}
	return normalized;
};

const toInlineText = (value: string) =>
	value
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/\[(.*?)\]\(.*?\)/g, "$1")
		.replace(/^\s*#+\s+/gm, "")
		.replace(/^\s*(?:[-*+]\s+|\d+\.\s+)/gm, "")
		.replace(/\s+/g, " ")
		.trim();

const requireInlineText = (value: string, entryLabel: string) => {
	const text = toInlineText(value);
	if (!text) {
		throw new Error(`Missing body content for ${entryLabel}`);
	}
	return text;
};

const assertUniqueSlugs = <T extends BaseEntry>(
	entries: T[],
	entryTypeLabel: string,
) => {
	const slugs = new Set<string>();

	for (const entry of entries) {
		if (slugs.has(entry.slug)) {
			throw new Error(
				`Duplicate slug "${entry.slug}" detected in ${entryTypeLabel} content`,
			);
		}

		slugs.add(entry.slug);
	}
};

const toSummary = (value: string, length = 180) => {
	const text = toInlineText(value);
	return text.length <= length
		? text
		: `${text.slice(0, length - 1).replace(/\s+$/, "")}…`;
};

const inferSource = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return "external";
	}
};

const inferTitleFromUrl = (url: string) => {
	try {
		const parsed = new URL(url);
		const fallbackHost = parsed.hostname.replace(/^www\./, "");
		const segment = parsed.pathname.split("/").filter(Boolean).pop();

		if (!segment) {
			return fallbackHost;
		}

		return decodeURIComponent(segment)
			.replace(/[-_]+/g, " ")
			.replace(/\.[a-z0-9]+$/i, "")
			.replace(/\b\w/g, (character) => character.toUpperCase());
	} catch {
		return "Untitled link";
	}
};

const resolveLinkTitle = (title: string | undefined, url: string) => {
	if (title && title.trim().length > 0) {
		return { title: title.trim(), inferred: false };
	}

	return { title: inferTitleFromUrl(url), inferred: true };
};

let loadedContentPromise: Promise<LoadedContent> | undefined;

const contentCollectionFilters = {
	articles: (entry: CollectionEntry<"articles">) =>
		entry.data.published !== false,
	notes: (entry: CollectionEntry<"notes">) => entry.data.published !== false,
	links: (entry: CollectionEntry<"links">) => entry.data.published !== false,
	snippets: (entry: CollectionEntry<"snippets">) =>
		entry.data.published !== false,
	pages: (entry: CollectionEntry<"pages">) => entry.data.published !== false,
} as const;

const loadContent = async (): Promise<LoadedContent> => {
	const [
		articleEntries,
		noteEntries,
		linkEntries,
		snippetEntries,
		pageEntries,
	] = await Promise.all([
		getCollection("articles", contentCollectionFilters.articles),
		getCollection("notes", contentCollectionFilters.notes),
		getCollection("links", contentCollectionFilters.links),
		getCollection("snippets", contentCollectionFilters.snippets),
		getCollection("pages", contentCollectionFilters.pages),
	]);

	const articleSources = new Map<string, CollectionEntry<"articles">>();
	const articles: Article[] = sortByDateDesc(
		articleEntries.map((entry: CollectionEntry<"articles">): Article => {
			const slug = requireSlug(entry.slug, `article "${entry.id}"`);
			articleSources.set(slug, entry);

			return {
				kind: "article" as const,
				id: entry.id,
				slug,
				title: entry.data.title,
				deck: entry.data.deck,
				summary: entry.data.summary,
				date: entry.data.publishedAt.toISOString(),
				updated: entry.data.updatedAt?.toISOString(),
				readMinutes: entry.data.readMinutes,
				tags: entry.data.tags,
				featured: entry.data.featured,
			};
		}),
	);
	assertUniqueSlugs(articles, "article");

	const notes: Note[] = sortByDateDesc(
		noteEntries.map(
			(entry: CollectionEntry<"notes">): Note => ({
				kind: "note" as const,
				id: entry.id,
				slug: requireSlug(entry.slug, `note "${entry.id}"`),
				date: entry.data.publishedAt.toISOString(),
				body: requireInlineText(entry.body, `note "${entry.id}"`),
			}),
		),
	);
	assertUniqueSlugs(notes, "note");

	const links: LinkEntry[] = sortByDateDesc(
		linkEntries.map((entry: CollectionEntry<"links">): LinkEntry => {
			const resolved = resolveLinkTitle(entry.data.title, entry.data.url);
			return {
				kind: "link" as const,
				id: entry.id,
				slug: requireSlug(entry.slug, `link "${entry.id}"`),
				date: entry.data.publishedAt.toISOString(),
				title: resolved.title,
				titleInferred: resolved.inferred,
				source: entry.data.source ?? inferSource(entry.data.url),
				url: entry.data.url,
				summary: entry.data.summary ?? toSummary(entry.body, 160),
				body: toInlineText(entry.body),
			};
		}),
	);
	assertUniqueSlugs(links, "link");

	const snippets: Snippet[] = sortByDateDesc(
		snippetEntries.map(
			(entry: CollectionEntry<"snippets">): Snippet => ({
				kind: "snippet" as const,
				id: entry.id,
				slug: requireSlug(entry.slug, `snippet "${entry.id}"`),
				title: entry.data.title,
				date: entry.data.publishedAt.toISOString(),
				language: entry.data.language,
				summary: entry.data.summary,
				body: toInlineText(entry.body),
				code: entry.data.code,
			}),
		),
	);
	assertUniqueSlugs(snippets, "snippet");

	const pageBySlug = new Map<string, CollectionEntry<"pages">>(
		pageEntries.map((entry: CollectionEntry<"pages">) => [
			requireSlug(entry.slug, `page "${entry.id}"`),
			entry,
		]),
	);

	const aboutEntry = pageBySlug.get("about");
	if (!aboutEntry) {
		throw new Error("Missing required page content: about");
	}

	const nowEntry = pageBySlug.get("now");
	if (!nowEntry) {
		throw new Error("Missing required page content: now");
	}

	const aboutBody = aboutEntry.body
		.split(/\n{2,}/)
		.map((paragraph: string) => toInlineText(paragraph))
		.filter(Boolean);
	if (aboutBody.length === 0) {
		throw new Error("About page must include body content");
	}

	const aboutPage: AboutPage = {
		title: aboutEntry.data.title,
		deck: aboutEntry.data.deck,
		body: aboutBody,
		facts: aboutEntry.data.facts ?? [],
	};

	if (!nowEntry.data.updatedAt) {
		throw new Error("Now page must define updatedAt metadata");
	}

	const nowPage: NowPage = {
		title: nowEntry.data.title,
		deck: nowEntry.data.deck,
		updated: nowEntry.data.updatedAt.toISOString(),
		location: nowEntry.data.location ?? "",
		working: nowEntry.data.working ?? "",
		learning: nowEntry.data.learning ?? "",
		listening: nowEntry.data.listening ?? "",
		reading: nowEntry.data.reading ?? [],
		focus: nowEntry.data.focus ?? [],
	};

	return {
		articles,
		articleSources,
		notes,
		links,
		snippets,
		aboutPage,
		nowPage,
	};
};

const getLoadedContent = () => {
	if (!loadedContentPromise) {
		loadedContentPromise = loadContent();
	}

	return loadedContentPromise;
};

export const getArticles = async () => (await getLoadedContent()).articles;
export const getNotes = async () => (await getLoadedContent()).notes;
export const getLinks = async () => (await getLoadedContent()).links;
export const getSnippets = async () => (await getLoadedContent()).snippets;
export const getAboutPage = async () => (await getLoadedContent()).aboutPage;
export const getNowPage = async () => (await getLoadedContent()).nowPage;

export const getFeaturedArticles = async () =>
	(await getArticles()).filter((article) => article.featured);

export const getCounts = async () => {
	const [articles, notes, links, snippets] = await Promise.all([
		getArticles(),
		getNotes(),
		getLinks(),
		getSnippets(),
	]);

	return {
		article: articles.length,
		note: notes.length,
		link: links.length,
		snippet: snippets.length,
	};
};

const getStreamEntries = async () => {
	const [articles, notes, links, snippets] = await Promise.all([
		getArticles(),
		getNotes(),
		getLinks(),
		getSnippets(),
	]);

	return sortByDateDesc<StreamEntry>([
		...articles,
		...notes,
		...links,
		...snippets,
	]);
};

export const getRecentStream = async (limit?: number) => {
	const entries = await getStreamEntries();
	return typeof limit === "number" ? entries.slice(0, limit) : entries;
};

export const getArchiveGroups = async () => {
	const groups = new Map<string, StreamEntry[]>();

	for (const entry of await getStreamEntries()) {
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

export const getCanonicalUrl = (entry: StreamEntry) =>
	new URL(getEntryPath(entry), siteMeta.siteUrl).toString();

export const getArticleContentBySlug = async (slug: string) => {
	const { articles, articleSources } = await getLoadedContent();
	const article = articles.find((candidate) => candidate.slug === slug);
	if (!article) {
		return undefined;
	}

	const sourceEntry = articleSources.get(slug);
	if (!sourceEntry) {
		return undefined;
	}

	const rendered = await sourceEntry.render();
	return {
		article,
		Content: rendered.Content,
	};
};

export const formatDisplayDate = (value: string) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
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
		timeZone: "UTC",
	})
		.format(new Date(value))
		.toLowerCase();
};

export const formatDisplayDateShort = (value: string) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "2-digit",
		timeZone: "UTC",
	})
		.format(new Date(value))
		.toLowerCase();
};

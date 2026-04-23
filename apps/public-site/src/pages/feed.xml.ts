import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import {
	buildExternalUrlCustomData,
	htmlToPlainText,
	truncateFeedText,
} from "../data/feed";
import { getCanonicalUrl, getRecentStream, siteMeta } from "../data/site";

const getEntryDescription = (
	entry: Awaited<ReturnType<typeof getRecentStream>>[number],
) => {
	switch (entry.kind) {
		case "article":
			return entry.summary;
		case "note":
			return entry.body;
		case "link":
			return `${entry.body}\n\nExternal URL: ${entry.url}`;
		case "snippet":
			return `${entry.summary}\n\n${entry.code}`;
	}
};

const getEntryTitle = (
	entry: Awaited<ReturnType<typeof getRecentStream>>[number],
) => {
	switch (entry.kind) {
		case "article":
		case "link":
		case "snippet":
			return entry.title;
		case "note":
			return truncateFeedText(htmlToPlainText(entry.body), 80);
	}
};

export const GET: APIRoute = async (context) => {
	const stream = await getRecentStream();

	return rss({
		title: siteMeta.name,
		description: siteMeta.description,
		site: context.site ?? siteMeta.siteUrl,
		customData: `<language>en-us</language><managingEditor>${siteMeta.email} (${siteMeta.author})</managingEditor>`,
		items: stream.map((entry) => ({
			title: getEntryTitle(entry),
			pubDate: new Date(entry.date),
			description: getEntryDescription(entry),
			link: getCanonicalUrl(entry),
			customData:
				entry.kind === "link"
					? buildExternalUrlCustomData(entry.url)
					: undefined,
		})),
	});
};

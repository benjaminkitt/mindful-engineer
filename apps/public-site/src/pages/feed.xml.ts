import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCanonicalUrl, getRecentStream, siteMeta } from "../data/site";

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, "").trim();
const xmlEscape = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

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
			return stripHtml(entry.body).slice(0, 80);
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
					? `<mindful:externalUrl xmlns:mindful="https://mindful.engineer/ns">${xmlEscape(entry.url)}</mindful:externalUrl>`
					: undefined,
		})),
	});
};

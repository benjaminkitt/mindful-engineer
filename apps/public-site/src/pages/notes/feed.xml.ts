import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { htmlToPlainText, truncateFeedText } from "../../data/feed";
import {
	getCanonicalUrl,
	getLinks,
	getNotes,
	type Note,
	siteMeta,
} from "../../data/site";

type FeedEntry =
	| {
			kind: "note";
			date: string;
			title: string;
			description: string;
			link: string;
	  }
	| {
			kind: "link";
			date: string;
			title: string;
			description: string;
			link: string;
	  };

const noteTitle = (note: Note) =>
	truncateFeedText(htmlToPlainText(note.body), 80);

export const GET: APIRoute = async (context) => {
	const [notes, links] = await Promise.all([getNotes(), getLinks()]);

	const items: FeedEntry[] = [
		...notes.map(
			(note): FeedEntry => ({
				kind: "note",
				date: note.date,
				title: noteTitle(note),
				description: note.body,
				link: getCanonicalUrl(note),
			}),
		),
		...links.map(
			(link): FeedEntry => ({
				kind: "link",
				date: link.date,
				title: link.title,
				description: `${link.body}\n\nExternal URL: ${link.url}`,
				link: getCanonicalUrl(link),
			}),
		),
	].sort(
		(left, right) =>
			new Date(right.date).getTime() - new Date(left.date).getTime(),
	);

	return rss({
		title: `${siteMeta.name} / Notes + Links`,
		description: "Short-form notes and annotated links from mindful.engineer.",
		site: context.site ?? siteMeta.siteUrl,
		items: items.map((item) => ({
			title: item.title,
			description: item.description,
			pubDate: new Date(item.date),
			link: item.link,
		})),
	});
};

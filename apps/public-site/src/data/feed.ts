import { decodeHTML } from "entities";
import { XMLBuilder } from "fast-xml-parser";
import { fromHtml } from "hast-util-from-html";
import { toText } from "hast-util-to-text";

const customNamespace = "https://mindful.engineer/ns";
const xmlBuilder = new XMLBuilder({
	ignoreAttributes: false,
	format: false,
	suppressEmptyNode: true,
});

export const htmlToPlainText = (value: string) => {
	const text = toText(fromHtml(value, { fragment: true }));
	return decodeHTML(text).replace(/\s+/g, " ").trim();
};

export const buildExternalUrlCustomData = (url: string) =>
	xmlBuilder.build({
		"mindful:externalUrl": {
			"@_xmlns:mindful": customNamespace,
			"#text": new URL(url).toString(),
		},
	});

export const truncateFeedText = (value: string, length = 80) => {
	if (value.length <= length) {
		return value;
	}

	return `${value.slice(0, length).replace(/\s+$/, "")}…`;
};

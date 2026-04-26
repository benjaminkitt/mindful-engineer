import type {
	EntryAction,
	EntryPayload,
	EntrySubmissionInput,
	LinkPayload,
	NotePayload,
} from "./types";

const VALID_ACTIONS: EntryAction[] = ["save_draft", "preview", "publish"];

const trim = (value: string | undefined) => value?.trim() ?? "";

const assertHttpUrl = (value: string) => {
	let parsed: URL;
	try {
		parsed = new URL(value);
	} catch {
		throw new Error("Link URL must be a valid absolute URL");
	}

	if (!["http:", "https:"].includes(parsed.protocol)) {
		throw new Error("Link URL must use http or https");
	}

	return parsed.toString();
};

const inferSource = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return undefined;
	}
};

export const parseAction = (value: string | undefined): EntryAction => {
	if (!value) {
		throw new Error("Missing action");
	}

	if (VALID_ACTIONS.includes(value as EntryAction)) {
		return value as EntryAction;
	}

	throw new Error(`Unsupported action: ${value}`);
};

const parseNotePayload = (input: EntrySubmissionInput): NotePayload => {
	const body = input.body ?? "";
	if (!body.trim()) {
		throw new Error("Note body is required");
	}

	const slugHint = trim(input.slug);

	return {
		type: "note",
		body,
		slugHint: slugHint || undefined,
	};
};

const parseLinkPayload = (input: EntrySubmissionInput): LinkPayload => {
	const urlValue = trim(input.url);
	if (!urlValue) {
		throw new Error("Link URL is required");
	}

	const url = assertHttpUrl(urlValue);
	const rawCommentary = input.commentary ?? "";
	const commentary = rawCommentary.trim();
	const title = trim(input.title);
	const source = trim(input.source);
	const summary = trim(input.summary);
	const slugHint = trim(input.slug);

	return {
		type: "link",
		url,
		commentary: commentary ? rawCommentary : undefined,
		title: title || undefined,
		source: source || inferSource(url),
		summary: summary || undefined,
		slugHint: slugHint || undefined,
	};
};

export const parseEntryPayload = (
	input: EntrySubmissionInput,
): EntryPayload => {
	const type = trim(input.type);
	if (type === "note") {
		return parseNotePayload(input);
	}

	if (type === "link") {
		return parseLinkPayload(input);
	}

	throw new Error(`Unsupported entry type: ${input.type ?? "<missing>"}`);
};

export const parseFormDataToInput = (
	formData: FormData,
): EntrySubmissionInput => {
	const getValue = (key: string) => {
		const value = formData.get(key);
		return typeof value === "string" ? value : undefined;
	};

	return {
		type: getValue("type"),
		action: getValue("action"),
		flowId: getValue("flowId"),
		draftId: getValue("draftId"),
		body: getValue("body"),
		url: getValue("url"),
		commentary: getValue("commentary"),
		title: getValue("title"),
		source: getValue("source"),
		summary: getValue("summary"),
		slug: getValue("slug"),
	};
};

import type {
	CanonicalArtifact,
	EntryPayload,
	EntryType,
	LinkPayload,
	NotePayload,
} from "./types";

const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);

const ensureNonEmpty = (value: string, message: string) => {
	if (!value.trim()) {
		throw new Error(message);
	}
	return value;
};

const slugify = (value: string) => {
	const normalized = value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-");

	return normalized || "entry";
};

const summarize = (value: string, length = 140) => {
	if (value.length <= length) {
		return value;
	}

	return `${value.slice(0, length - 1).replace(/\s+$/, "")}…`;
};

const frontmatterValue = (value: string) => JSON.stringify(value);

const mdxHeader = (fields: Record<string, string | boolean>) => {
	const lines = Object.entries(fields).map(([key, value]) => {
		if (typeof value === "boolean") {
			return `${key}: ${value ? "true" : "false"}`;
		}

		return `${key}: ${frontmatterValue(value)}`;
	});

	return `---\n${lines.join("\n")}\n---\n`;
};

const getSlugBase = (payload: EntryPayload) => {
	if (payload.type === "note") {
		return payload.slugHint ?? summarize(payload.body, 60);
	}

	return payload.slugHint ?? payload.title ?? payload.url;
};

const inferLinkSource = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return "external";
	}
};

const inferLinkTitle = (payload: LinkPayload) => {
	if (payload.title?.trim()) {
		return payload.title.trim();
	}

	try {
		const parsed = new URL(payload.url);
		const terminal = parsed.pathname.split("/").filter(Boolean).pop();
		if (!terminal) {
			return parsed.hostname.replace(/^www\./, "");
		}

		return decodeURIComponent(terminal)
			.replace(/[-_]+/g, " ")
			.replace(/\.[a-z0-9]+$/i, "")
			.replace(/\b\w/g, (character) => character.toUpperCase());
	} catch {
		return "Untitled link";
	}
};

const buildNoteArtifact = (
	payload: NotePayload,
	publishedAt: string,
): CanonicalArtifact => {
	const body = ensureNonEmpty(payload.body, "Note body is required");
	const datePrefix = toIsoDate(new Date(publishedAt));
	const slug = `${datePrefix}-${slugify(getSlugBase(payload)).slice(0, 48)}`;
	const relativePath = `notes/${slug}.mdx`;

	const header = mdxHeader({
		type: "note",
		slug,
		publishedAt,
		published: true,
	});

	const mdx = `${header}\n${body}\n`;

	return {
		slug,
		entryType: "note",
		relativePath,
		mdx,
		publishedAt,
	};
};

const buildLinkArtifact = (
	payload: LinkPayload,
	publishedAt: string,
): CanonicalArtifact => {
	const url = ensureNonEmpty(payload.url, "Link URL is required");
	const datePrefix = toIsoDate(new Date(publishedAt));
	const slug = `${datePrefix}-${slugify(getSlugBase(payload)).slice(0, 48)}`;
	const relativePath = `links/${slug}.mdx`;
	const source = payload.source?.trim() || inferLinkSource(url);
	const title = inferLinkTitle(payload);
	const rawCommentary = payload.commentary ?? "";
	const trimmedCommentary = rawCommentary.trim();
	const commentary = trimmedCommentary ? rawCommentary : "";
	const summary =
		payload.summary?.trim() || summarize(trimmedCommentary || title, 120);

	const header = mdxHeader({
		type: "link",
		slug,
		publishedAt,
		url,
		title,
		source,
		summary,
		published: true,
	});

	const mdx = `${header}\n${commentary}\n`;

	return {
		slug,
		entryType: "link",
		relativePath,
		mdx,
		publishedAt,
	};
};

export const buildCanonicalArtifact = (
	entryType: EntryType,
	payload: EntryPayload,
	publishedAt = new Date().toISOString(),
) => {
	if (entryType === "note" && payload.type === "note") {
		return buildNoteArtifact(payload, publishedAt);
	}

	if (entryType === "link" && payload.type === "link") {
		return buildLinkArtifact(payload, publishedAt);
	}

	throw new Error(
		`Unable to build canonical artifact for entryType=${entryType} payloadType=${payload.type}`,
	);
};

const escapeHtml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");

export const renderPreviewHtml = (
	entryType: EntryType,
	payload: EntryPayload,
) => {
	if (entryType === "note" && payload.type === "note") {
		return `<article class="preview-card"><h2>Note preview</h2><p>${escapeHtml(payload.body).replace(/\n/g, "<br />")}</p></article>`;
	}

	if (entryType === "link" && payload.type === "link") {
		const commentary = payload.commentary?.trim();
		const title = payload.title?.trim() || inferLinkTitle(payload);
		const source = payload.source?.trim() || inferLinkSource(payload.url);
		return `<article class="preview-card"><h2>Link preview</h2><p><strong>${escapeHtml(title)}</strong></p><p><a href="${escapeHtml(payload.url)}">${escapeHtml(payload.url)}</a></p><p>Source: ${escapeHtml(source)}</p>${commentary ? `<p>${escapeHtml(commentary).replace(/\n/g, "<br />")}</p>` : ""}</article>`;
	}

	throw new Error("Unsupported preview payload");
};

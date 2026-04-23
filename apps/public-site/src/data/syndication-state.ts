import {
	createOperationalSnapshot,
	InMemorySyndicationOperationalStore,
	type SyndicationOperationalSnapshot,
} from "../syndication/operational-state";
import {
	approveVariant,
	buildAssistedManualOutput,
	type CanonicalEntryReference,
	type ElsewhereDestination,
	getElsewhereDestinations,
	getSyndicationEntryKey,
	markManualVariantPosted,
	prepareVariant,
	publishCanonicalAndPrepareReviewedSyndication,
	SYNDICATION_PLATFORMS,
	type SyndicationEntryState,
	type SyndicationPlatform,
	sendReviewedVariant,
	skipVariant,
} from "../syndication/workflow";

const defaultPlatforms: SyndicationPlatform[] = [...SYNDICATION_PLATFORMS];

const canonicalEntries: CanonicalEntryReference[] = [
	{
		kind: "article",
		slug: "fast-and-present",
		title: "Fast and Present Are Not Opposites",
		summary:
			"Mindful engineering is not slow engineering. It is fast engineering done with both eyes open.",
		bodyPreview:
			"Fast and present are not competing virtues. They are the same discipline seen from different angles.",
		canonicalUrl: "https://mindful.engineer/articles/fast-and-present",
		publishedAt: "2026-04-12T09:00:00.000Z",
	},
	{
		kind: "note",
		slug: "changelog-as-care",
		title: "A good changelog entry",
		summary:
			"A good changelog entry is the cheapest act of care a fast team can perform.",
		bodyPreview:
			"A good changelog entry is the cheapest act of care a fast team can perform.",
		canonicalUrl: "https://mindful.engineer/notes/changelog-as-care",
		publishedAt: "2026-04-14T16:02:00.000Z",
	},
	{
		kind: "link",
		slug: "attention-is-debt",
		title: "Attention Is Debt",
		summary:
			"Every push notification is a small loan against your future concentration.",
		bodyPreview:
			"Every push notification is a small loan against your future concentration.",
		canonicalUrl: "https://mindful.engineer/links/attention-is-debt",
		publishedAt: "2026-04-05T00:00:00.000Z",
	},
	{
		kind: "snippet",
		slug: "retry-with-jitter",
		title: "Retry with jitter",
		summary: "A practical retry helper with exponential backoff and jitter.",
		bodyPreview:
			"Add a little randomness to retries so failures do not synchronize.",
		canonicalUrl: "https://mindful.engineer/snippets/retry-with-jitter",
		publishedAt: "2026-04-09T00:00:00.000Z",
	},
];

const approvedAndSent = (canonical: CanonicalEntryReference) => {
	let state = publishCanonicalAndPrepareReviewedSyndication(
		canonical,
		defaultPlatforms,
	).state;

	for (const platform of SYNDICATION_PLATFORMS) {
		state = approveVariant(state, platform);
	}

	state = sendReviewedVariant(state, "mastodon");
	state = sendReviewedVariant(state, "bluesky");

	const linkedinManual = buildAssistedManualOutput(state, "linkedin");
	state = linkedinManual.state;
	state = markManualVariantPosted(
		state,
		"linkedin",
		`https://www.linkedin.com/feed/update/urn:li:activity:${getSyndicationEntryKey(canonical).replace(/[^a-z0-9]/gi, "")}`,
	);

	const xManual = buildAssistedManualOutput(state, "x");
	state = xManual.state;
	state = markManualVariantPosted(
		state,
		"x",
		`https://x.com/mindfulengineer/status/${getSyndicationEntryKey(canonical).replace(/[^a-z0-9]/gi, "")}`,
	);

	return state;
};

const noteFailureThenRecovery = (canonical: CanonicalEntryReference) => {
	let state = publishCanonicalAndPrepareReviewedSyndication(
		canonical,
		defaultPlatforms,
	).state;

	state = approveVariant(state, "mastodon");
	state = approveVariant(state, "bluesky");
	state = approveVariant(state, "linkedin");
	state = approveVariant(state, "x");

	state = sendReviewedVariant(state, "mastodon", { forceFailure: true });
	state = sendReviewedVariant(state, "mastodon", { retry: true });
	state = sendReviewedVariant(state, "bluesky");

	const linkedinManual = buildAssistedManualOutput(state, "linkedin");
	state = linkedinManual.state;
	state = markManualVariantPosted(
		state,
		"linkedin",
		"https://www.linkedin.com/feed/update/urn:li:activity:notechangelogcare",
	);

	state = skipVariant(state, "x");

	return state;
};

const partialSyndication = (canonical: CanonicalEntryReference) => {
	let state = publishCanonicalAndPrepareReviewedSyndication(
		canonical,
		defaultPlatforms,
	).state;

	state = approveVariant(state, "mastodon");
	state = sendReviewedVariant(state, "mastodon");

	state = approveVariant(state, "bluesky");
	state = skipVariant(state, "bluesky");

	state = approveVariant(state, "linkedin");
	const linkedinManual = buildAssistedManualOutput(state, "linkedin");
	state = linkedinManual.state;
	state = skipVariant(state, "linkedin");

	state = skipVariant(state, "x");

	return state;
};

const preparedOnly = (canonical: CanonicalEntryReference) => {
	let state = publishCanonicalAndPrepareReviewedSyndication(
		canonical,
		defaultPlatforms,
	).state;

	state = prepareVariant(state, "mastodon", `${canonical.summary} [[draft]]`);

	return state;
};

const operationalStore = new InMemorySyndicationOperationalStore();

for (const state of [
	approvedAndSent(canonicalEntries[0]),
	noteFailureThenRecovery(canonicalEntries[1]),
	partialSyndication(canonicalEntries[2]),
	preparedOnly(canonicalEntries[3]),
]) {
	operationalStore.upsert(state);
}

const stateByEntry = new Map<string, SyndicationEntryState>(
	operationalStore.list().map((state) => [state.entryKey, state] as const),
);

const pathMap = {
	article: "/articles",
	note: "/notes",
	link: "/links",
	snippet: "/snippets",
} as const;

const createCanonicalLookupKey = (path: string) => {
	const normalized = path.endsWith("/") ? path.slice(0, -1) : path;
	const segments = normalized.split("/").filter(Boolean);
	const [kindSegment, slug] = segments;
	if (!kindSegment || !slug) {
		return undefined;
	}

	switch (kindSegment) {
		case "articles":
			return `article:${slug}`;
		case "notes":
			return `note:${slug}`;
		case "links":
			return `link:${slug}`;
		case "snippets":
			return `snippet:${slug}`;
		default:
			return undefined;
	}
};

export const getSyndicationStateByCanonicalPath = (
	canonicalPath: string,
): SyndicationEntryState | undefined => {
	const key = createCanonicalLookupKey(canonicalPath);
	if (!key) {
		return undefined;
	}

	return stateByEntry.get(key);
};

export const getElsewhereDestinationsForPath = (
	canonicalPath: string,
): ElsewhereDestination[] => {
	const state = getSyndicationStateByCanonicalPath(canonicalPath);
	if (!state) {
		return [];
	}

	return getElsewhereDestinations(state);
};

export const getAllSyndicationStates = () => Array.from(stateByEntry.values());

export const getSyndicationOperationalSnapshot =
	(): SyndicationOperationalSnapshot =>
		createOperationalSnapshot(operationalStore);

export const getCanonicalPathForEntry = (state: SyndicationEntryState) => {
	const prefix = pathMap[state.canonical.kind];
	return `${prefix}/${state.canonical.slug}`;
};

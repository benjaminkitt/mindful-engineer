export const SYNDICATION_PLATFORMS = [
	"mastodon",
	"bluesky",
	"linkedin",
	"x",
] as const;

export type SyndicationPlatform = (typeof SYNDICATION_PLATFORMS)[number];

export type CanonicalEntryKind = "article" | "note" | "link" | "snippet";

export type SyndicationStatus =
	| "not_prepared"
	| "prepared"
	| "approved"
	| "queued"
	| "posted"
	| "failed"
	| "skipped";

export type ReviewedSyndicationAction =
	| "prepare"
	| "approve"
	| "skip"
	| "send"
	| "retry"
	| "copy_manual"
	| "mark_manual_posted";

export const REVIEWED_SYNDICATION_FLOW_IDS = {
	scaffold: "reviewed-syndication.scaffold.v1",
	canonicalPublish: "canonical-publish.commit.v1",
	prepareVariant: "reviewed-syndication.prepare-variant.v1",
	approveVariant: "reviewed-syndication.approve-variant.v1",
	skipVariant: "reviewed-syndication.skip-variant.v1",
	queueVariant: "reviewed-syndication.queue-variant.v1",
	postMastodon: "reviewed-syndication.post-mastodon.v1",
	postBluesky: "reviewed-syndication.post-bluesky.v1",
	manualOutput: "reviewed-syndication.manual-output.v1",
	markManualPosted: "reviewed-syndication.mark-manual-posted.v1",
	retryVariant: "reviewed-syndication.retry-variant.v1",
} as const;

export type ReviewedSyndicationFlowId =
	(typeof REVIEWED_SYNDICATION_FLOW_IDS)[keyof typeof REVIEWED_SYNDICATION_FLOW_IDS];

export interface CanonicalEntryReference {
	kind: CanonicalEntryKind;
	slug: string;
	title: string;
	summary: string;
	bodyPreview: string;
	canonicalUrl: string;
	publishedAt: string;
}

export interface TextFirstPreview {
	text: string;
	characterCount: number;
	characterLimit: number | null;
	overLimit: boolean;
}

export interface AssistedManualOutput {
	copyText: string;
	instructions: string[];
	lastGeneratedAt: string;
}

export interface SyndicationVariantState {
	platform: SyndicationPlatform;
	status: SyndicationStatus;
	preparedText?: string;
	approvedText?: string;
	preview?: TextFirstPreview;
	manualOutput?: AssistedManualOutput;
	approvedAt?: string;
	queuedAt?: string;
	postedAt?: string;
	resultUrl?: string;
	errorMessage?: string;
	lastFlowId: ReviewedSyndicationFlowId;
}

export interface SyndicationEntryState {
	entryKey: string;
	canonical: CanonicalEntryReference;
	createdAt: string;
	updatedAt: string;
	flowId: ReviewedSyndicationFlowId;
	variants: Record<SyndicationPlatform, SyndicationVariantState>;
}

export interface ElsewhereDestination {
	platform: SyndicationPlatform;
	label: string;
	url: string;
}

interface PlatformConfig {
	label: string;
	characterLimit: number | null;
	mode: "first_class" | "assisted_manual";
	hostname: string;
}

const MINDFUL_ENGINEER_PROTOCOL = "https:";
const MINDFUL_ENGINEER_HOSTNAME = "mindful.engineer";

const PLATFORM_CONFIG: Record<SyndicationPlatform, PlatformConfig> = {
	mastodon: {
		label: "Mastodon",
		characterLimit: 500,
		mode: "first_class",
		hostname: "mastodon.social",
	},
	bluesky: {
		label: "Bluesky",
		characterLimit: 300,
		mode: "first_class",
		hostname: "bsky.app",
	},
	linkedin: {
		label: "LinkedIn",
		characterLimit: 3000,
		mode: "assisted_manual",
		hostname: "www.linkedin.com",
	},
	x: {
		label: "X",
		characterLimit: 280,
		mode: "assisted_manual",
		hostname: "x.com",
	},
};

const firstClassPlatforms = new Set<SyndicationPlatform>([
	"mastodon",
	"bluesky",
]);

const manualPlatforms = new Set<SyndicationPlatform>(["linkedin", "x"]);

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

const nowIso = () => new Date().toISOString();

const buildPreviewFromText = (
	platform: SyndicationPlatform,
	text: string,
): TextFirstPreview => {
	const normalizedText = normalizeText(text);
	const characterLimit = PLATFORM_CONFIG[platform].characterLimit;
	const characterCount = normalizedText.length;

	return {
		text: normalizedText,
		characterCount,
		characterLimit,
		overLimit:
			typeof characterLimit === "number"
				? characterCount > characterLimit
				: false,
	};
};

const nonEmpty = (value: string, field: string) => {
	const normalized = value.trim();
	if (!normalized) {
		throw new Error(`Missing required ${field}`);
	}
	return normalized;
};

const toSlugToken = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "")
		.slice(0, 48);

const contentHash = (value: string) => {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}
	return Math.abs(hash).toString(36);
};

const isManualPlatform = (platform: SyndicationPlatform) =>
	manualPlatforms.has(platform);

const isFirstClassPlatform = (platform: SyndicationPlatform) =>
	firstClassPlatforms.has(platform);

const validateManualResultUrl = (
	platform: SyndicationPlatform,
	resultUrl: string,
) => {
	const normalizedUrl = nonEmpty(resultUrl, "manual result URL");
	let parsedUrl: URL;

	try {
		parsedUrl = new URL(normalizedUrl);
	} catch {
		throw new Error(`Manual result URL for ${platform} must be a valid URL`);
	}

	if (parsedUrl.protocol !== "https:") {
		throw new Error(`Manual result URL for ${platform} must use https`);
	}

	if (parsedUrl.hostname !== PLATFORM_CONFIG[platform].hostname) {
		throw new Error(
			`Manual result URL for ${platform} must be on ${PLATFORM_CONFIG[platform].hostname}`,
		);
	}

	return parsedUrl.toString();
};

const createInitialVariantState = (
	platform: SyndicationPlatform,
): SyndicationVariantState => ({
	platform,
	status: "not_prepared",
	lastFlowId: REVIEWED_SYNDICATION_FLOW_IDS.scaffold,
});

const cloneState = (state: SyndicationEntryState): SyndicationEntryState => {
	return {
		...state,
		canonical: { ...state.canonical },
		variants: Object.fromEntries(
			SYNDICATION_PLATFORMS.map((platform) => [
				platform,
				{ ...state.variants[platform] },
			]),
		) as SyndicationEntryState["variants"],
	};
};

const updateVariant = (
	state: SyndicationEntryState,
	platform: SyndicationPlatform,
	updater: (variant: SyndicationVariantState) => SyndicationVariantState,
): SyndicationEntryState => {
	const next = cloneState(state);
	const nextVariant = updater(next.variants[platform]);
	next.variants[platform] = nextVariant;
	next.flowId = nextVariant.lastFlowId;
	next.updatedAt = nowIso();
	return next;
};

const requirePublishedCanonical = (canonical: CanonicalEntryReference) => {
	nonEmpty(canonical.slug, "canonical slug");
	nonEmpty(canonical.title, "canonical title");
	nonEmpty(canonical.summary, "canonical summary");
	nonEmpty(canonical.publishedAt, "canonical publishedAt");

	const canonicalUrl = nonEmpty(canonical.canonicalUrl, "canonical URL");
	const publishedAt = new Date(canonical.publishedAt);
	if (Number.isNaN(publishedAt.getTime())) {
		throw new Error("Canonical publishedAt must be an ISO-compatible date");
	}

	let parsedCanonicalUrl: URL;
	try {
		parsedCanonicalUrl = new URL(canonicalUrl);
	} catch {
		throw new Error("Canonical URL must be a valid URL");
	}

	if (
		parsedCanonicalUrl.protocol !== MINDFUL_ENGINEER_PROTOCOL ||
		parsedCanonicalUrl.hostname !== MINDFUL_ENGINEER_HOSTNAME
	) {
		throw new Error(
			`Canonical URL must be on mindful.engineer (${canonical.canonicalUrl})`,
		);
	}
};

export const getSyndicationEntryKey = (canonical: CanonicalEntryReference) =>
	`${canonical.kind}:${canonical.slug}`;

export const getPlatformLabel = (platform: SyndicationPlatform) =>
	PLATFORM_CONFIG[platform].label;

export const scaffoldReviewedSyndicationState = (
	canonical: CanonicalEntryReference,
	targetPlatforms: SyndicationPlatform[] = [...SYNDICATION_PLATFORMS],
): SyndicationEntryState => {
	requirePublishedCanonical(canonical);

	const createdAt = nowIso();
	const uniquePlatforms = Array.from(new Set(targetPlatforms));
	if (uniquePlatforms.length === 0) {
		throw new Error("At least one target platform is required");
	}

	for (const platform of uniquePlatforms) {
		if (!SYNDICATION_PLATFORMS.includes(platform)) {
			throw new Error(`Unsupported syndication platform: ${platform}`);
		}
	}

	const variants = Object.fromEntries(
		SYNDICATION_PLATFORMS.map((platform) => [
			platform,
			createInitialVariantState(platform),
		]),
	) as SyndicationEntryState["variants"];

	for (const platform of SYNDICATION_PLATFORMS) {
		if (!uniquePlatforms.includes(platform)) {
			variants[platform] = {
				...variants[platform],
				status: "skipped",
				lastFlowId: REVIEWED_SYNDICATION_FLOW_IDS.skipVariant,
			};
		}
	}

	return {
		entryKey: getSyndicationEntryKey(canonical),
		canonical: {
			...canonical,
			bodyPreview: normalizeText(canonical.bodyPreview || canonical.summary),
		},
		createdAt,
		updatedAt: createdAt,
		flowId: REVIEWED_SYNDICATION_FLOW_IDS.scaffold,
		variants,
	};
};

export const buildTextFirstPreview = (
	canonical: CanonicalEntryReference,
	platform: SyndicationPlatform,
	overrideText?: string,
): TextFirstPreview => {
	const lead = normalizeText(
		overrideText ?? (canonical.summary || canonical.bodyPreview),
	);
	const context =
		canonical.kind === "article"
			? `New article: ${canonical.title}`
			: `New ${canonical.kind}: ${canonical.title}`;

	const text = normalizeText(`${context} — ${lead} ${canonical.canonicalUrl}`);
	const characterLimit = PLATFORM_CONFIG[platform].characterLimit;
	const characterCount = text.length;

	return {
		text,
		characterCount,
		characterLimit,
		overLimit:
			typeof characterLimit === "number"
				? characterCount > characterLimit
				: false,
	};
};

export const prepareVariant = (
	state: SyndicationEntryState,
	platform: SyndicationPlatform,
	overrideText?: string,
): SyndicationEntryState => {
	const variant = state.variants[platform];
	if (variant.status === "posted") {
		throw new Error(`Cannot re-prepare ${platform} after posting`);
	}

	if (variant.status === "skipped") {
		throw new Error(`Cannot prepare ${platform} after skip`);
	}

	const preview = buildTextFirstPreview(
		state.canonical,
		platform,
		overrideText,
	);

	return updateVariant(state, platform, (current) => ({
		...current,
		status: "prepared",
		preparedText: preview.text,
		approvedText: undefined,
		approvedAt: undefined,
		preview,
		errorMessage: undefined,
		lastFlowId: REVIEWED_SYNDICATION_FLOW_IDS.prepareVariant,
	}));
};

export const approveVariant = (
	state: SyndicationEntryState,
	platform: SyndicationPlatform,
	overrideText?: string,
): SyndicationEntryState => {
	const variant = state.variants[platform];
	if (variant.status !== "prepared") {
		throw new Error(
			`Variant ${platform} must be prepared before approval (current state: ${variant.status})`,
		);
	}

	const approvedText = normalizeText(
		overrideText ?? variant.preparedText ?? "",
	);
	if (!approvedText) {
		throw new Error(`Approved text cannot be empty for ${platform}`);
	}

	const preview = buildPreviewFromText(platform, approvedText);

	return updateVariant(state, platform, (current) => ({
		...current,
		status: "approved",
		approvedText,
		approvedAt: nowIso(),
		preview,
		lastFlowId: REVIEWED_SYNDICATION_FLOW_IDS.approveVariant,
	}));
};

export const skipVariant = (
	state: SyndicationEntryState,
	platform: SyndicationPlatform,
): SyndicationEntryState => {
	const variant = state.variants[platform];
	if (variant.status === "posted") {
		throw new Error(`Cannot skip ${platform} after posting`);
	}

	return updateVariant(state, platform, (current) => ({
		...current,
		status: "skipped",
		errorMessage: undefined,
		lastFlowId: REVIEWED_SYNDICATION_FLOW_IDS.skipVariant,
	}));
};

const dispatchFirstClassPost = (
	state: SyndicationEntryState,
	platform: SyndicationPlatform,
	text: string,
	forceFailure?: boolean,
) => {
	const platformSlug = toSlugToken(state.canonical.slug);
	const postKey = contentHash(`${platform}|${state.entryKey}|${text}`);
	const config = PLATFORM_CONFIG[platform];
	const resultUrl = `https://${config.hostname}/@mindfulengineer/${platformSlug}-${postKey}`;
	const isFailure = forceFailure || text.includes("[[force-fail]]");

	if (platform === "mastodon") {
		return isFailure
			? {
					ok: false,
					error: "Mastodon API request failed with a recoverable 503.",
					flowId: REVIEWED_SYNDICATION_FLOW_IDS.postMastodon,
				}
			: {
					ok: true,
					resultUrl,
					flowId: REVIEWED_SYNDICATION_FLOW_IDS.postMastodon,
				};
	}

	return isFailure
		? {
				ok: false,
				error: "Bluesky API request failed with an invalid session token.",
				flowId: REVIEWED_SYNDICATION_FLOW_IDS.postBluesky,
			}
		: {
				ok: true,
				resultUrl,
				flowId: REVIEWED_SYNDICATION_FLOW_IDS.postBluesky,
			};
};

export const sendReviewedVariant = (
	state: SyndicationEntryState,
	platform: SyndicationPlatform,
	options?: { forceFailure?: boolean; retry?: boolean },
): SyndicationEntryState => {
	if (!isFirstClassPlatform(platform)) {
		throw new Error(
			`${platform} is assisted/manual in MVP and cannot be sent directly`,
		);
	}

	const variant = state.variants[platform];
	const canRetry = options?.retry === true && variant.status === "failed";
	const canSend = variant.status === "approved";
	if (!canSend && !canRetry) {
		throw new Error(
			`Variant ${platform} must be approved (or failed + retry) before send (current state: ${variant.status})`,
		);
	}

	let queued = updateVariant(state, platform, (current) => ({
		...current,
		status: "queued",
		queuedAt: nowIso(),
		lastFlowId: options?.retry
			? REVIEWED_SYNDICATION_FLOW_IDS.retryVariant
			: REVIEWED_SYNDICATION_FLOW_IDS.queueVariant,
	}));

	const text = normalizeText(
		queued.variants[platform].approvedText ??
			queued.variants[platform].preparedText ??
			"",
	);
	if (!text) {
		throw new Error(
			`Variant ${platform} cannot be sent without prepared content`,
		);
	}

	const preview = buildTextFirstPreview(state.canonical, platform, text);
	if (preview.overLimit) {
		throw new Error(
			`Variant ${platform} exceeds the ${preview.characterLimit}-character limit`,
		);
	}

	const dispatched = dispatchFirstClassPost(
		queued,
		platform,
		text,
		options?.forceFailure,
	);

	queued = updateVariant(queued, platform, (current) => ({
		...current,
		status: dispatched.ok ? "posted" : "failed",
		postedAt: dispatched.ok ? nowIso() : current.postedAt,
		resultUrl: dispatched.ok ? dispatched.resultUrl : current.resultUrl,
		errorMessage: dispatched.ok ? undefined : dispatched.error,
		lastFlowId: dispatched.flowId,
	}));

	return queued;
};

export const buildAssistedManualOutput = (
	state: SyndicationEntryState,
	platform: SyndicationPlatform,
): { state: SyndicationEntryState; output: AssistedManualOutput } => {
	if (!isManualPlatform(platform)) {
		throw new Error(`${platform} is not an assisted/manual platform`);
	}

	const variant = state.variants[platform];
	if (variant.status !== "prepared" && variant.status !== "approved") {
		throw new Error(
			`Variant ${platform} must be prepared before generating manual output`,
		);
	}

	const copyText = normalizeText(
		variant.approvedText ?? variant.preparedText ?? "",
	);
	if (!copyText) {
		throw new Error(
			`Manual output for ${platform} requires non-empty copy text`,
		);
	}

	const output: AssistedManualOutput = {
		copyText,
		instructions: [
			`Open ${PLATFORM_CONFIG[platform].label} and start a new post.`,
			"Paste the reviewed copy and confirm tone/format.",
			"Post manually, then record the resulting URL in the control plane.",
		],
		lastGeneratedAt: nowIso(),
	};

	const nextState = updateVariant(state, platform, (current) => ({
		...current,
		manualOutput: output,
		lastFlowId: REVIEWED_SYNDICATION_FLOW_IDS.manualOutput,
	}));

	return {
		state: nextState,
		output,
	};
};

export const markManualVariantPosted = (
	state: SyndicationEntryState,
	platform: SyndicationPlatform,
	resultUrl: string,
): SyndicationEntryState => {
	if (!isManualPlatform(platform)) {
		throw new Error(`${platform} is not an assisted/manual platform`);
	}

	const variant = state.variants[platform];
	if (variant.status !== "approved") {
		throw new Error(
			`Variant ${platform} must be approved before marking posted`,
		);
	}

	const normalizedUrl = validateManualResultUrl(platform, resultUrl);
	return updateVariant(state, platform, (current) => ({
		...current,
		status: "posted",
		resultUrl: normalizedUrl,
		postedAt: nowIso(),
		errorMessage: undefined,
		lastFlowId: REVIEWED_SYNDICATION_FLOW_IDS.markManualPosted,
	}));
};

export const publishCanonicalAndPrepareReviewedSyndication = (
	canonical: CanonicalEntryReference,
	targetPlatforms: SyndicationPlatform[] = [...SYNDICATION_PLATFORMS],
) => {
	let state = scaffoldReviewedSyndicationState(canonical, targetPlatforms);
	state.flowId = REVIEWED_SYNDICATION_FLOW_IDS.canonicalPublish;

	for (const platform of targetPlatforms) {
		state = prepareVariant(state, platform);
	}

	return {
		canonicalPublished: true as const,
		canonicalFlowId: REVIEWED_SYNDICATION_FLOW_IDS.canonicalPublish,
		state,
	};
};

export const getElsewhereDestinations = (
	state: SyndicationEntryState,
): ElsewhereDestination[] => {
	const destinations: ElsewhereDestination[] = [];

	for (const platform of SYNDICATION_PLATFORMS) {
		const variant = state.variants[platform];
		if (variant.status === "posted" && variant.resultUrl) {
			destinations.push({
				platform,
				label: getPlatformLabel(platform),
				url: variant.resultUrl,
			});
		}
	}

	return destinations;
};

export const getAvailableSyndicationActions = (
	variant: SyndicationVariantState,
): ReviewedSyndicationAction[] => {
	if (variant.status === "posted" || variant.status === "skipped") {
		return [];
	}

	const actions: ReviewedSyndicationAction[] = [];

	switch (variant.status) {
		case "not_prepared":
			actions.push("prepare", "skip");
			break;
		case "prepared":
			actions.push("approve", "skip");
			if (isManualPlatform(variant.platform)) {
				actions.push("copy_manual");
			}
			break;
		case "approved":
			actions.push("skip");
			if (isFirstClassPlatform(variant.platform)) {
				actions.push("send");
			} else {
				actions.push("copy_manual", "mark_manual_posted");
			}
			break;
		case "queued":
			break;
		case "failed":
			actions.push("retry", "skip");
			break;
	}

	return actions;
};

export const listSyndicationVariants = (state: SyndicationEntryState) =>
	SYNDICATION_PLATFORMS.map((platform) => state.variants[platform]);

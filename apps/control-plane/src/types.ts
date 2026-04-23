export type EntryType = "note" | "link";
export type DraftState = "draft" | "preview" | "published";

export interface D1DatabaseBinding {
	prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
	bind(...values: Array<string | number | null>): D1PreparedStatement;
	first<T>(): Promise<T | null>;
	run(): Promise<unknown>;
	all<T>(): Promise<{ results: T[] }>;
}

export interface Env {
	DB: D1DatabaseBinding;
	ACCESS_PROTECTION_MODE?: "cloudflare-access" | "off";
	ACCESS_AUD?: string;
	ACCESS_TEAM_DOMAIN?: string;
	GITHUB_TOKEN?: string;
	GITHUB_OWNER?: string;
	GITHUB_REPO?: string;
	GITHUB_BRANCH?: string;
	GITHUB_API_BASE_URL?: string;
	GITHUB_CONTENT_ROOT?: string;
}

export interface NotePayload {
	type: "note";
	body: string;
	slugHint?: string;
}

export interface LinkPayload {
	type: "link";
	url: string;
	commentary?: string;
	title?: string;
	source?: string;
	summary?: string;
	slugHint?: string;
}

export type EntryPayload = NotePayload | LinkPayload;

export interface DraftRecord {
	id: string;
	entryType: EntryType;
	flowId: string;
	state: DraftState;
	payload: EntryPayload;
	previewHtml?: string;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	publishedSlug?: string;
	publishedPath?: string;
	publishedSha?: string;
}

export interface PreviewSessionRecord {
	id: string;
	draftId: string;
	flowId: string;
	previewToken: string;
	expiresAt: string;
	createdAt: string;
	previewHtml: string;
	payload: EntryPayload;
	entryType: EntryType;
}

export interface PublishEventRecord {
	id: string;
	draftId?: string;
	entryType: EntryType;
	flowId: string;
	slug: string;
	contentPath: string;
	githubCommitSha: string;
	githubCommitUrl?: string;
	repository: string;
	createdAt: string;
	status: "published";
}

export interface CanonicalArtifact {
	slug: string;
	entryType: EntryType;
	relativePath: string;
	mdx: string;
	publishedAt: string;
}

export interface GitHubPublishResult {
	commitSha: string;
	commitUrl?: string;
	contentPath: string;
}

export type EntryAction = "save_draft" | "preview" | "publish";

export interface EntrySubmissionInput {
	type?: string;
	action?: string;
	flowId?: string;
	draftId?: string;
	body?: string;
	url?: string;
	commentary?: string;
	title?: string;
	source?: string;
	summary?: string;
	slug?: string;
}

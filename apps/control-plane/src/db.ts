import type {
	DraftRecord,
	DraftState,
	EntryPayload,
	EntryType,
	Env,
	PublishEventRecord,
} from "./types";

interface DraftRow {
	id: string;
	entry_type: EntryType;
	flow_id: string;
	state: DraftState;
	payload_json: string;
	preview_html: string | null;
	created_at: string;
	updated_at: string;
	published_at: string | null;
	published_slug: string | null;
	published_path: string | null;
	published_sha: string | null;
}

interface PublishEventRow {
	id: string;
	draft_id: string | null;
	entry_type: EntryType;
	flow_id: string;
	slug: string;
	content_path: string;
	github_commit_sha: string;
	github_commit_url: string | null;
	repository: string;
	created_at: string;
	status: "published";
}

export interface PreviewTokenRecord {
	token: string;
	draftId: string;
	expiresAt: string;
	flowId: string;
	entryType: EntryType;
	state: DraftState;
	previewHtml: string;
	payload: EntryPayload;
}

const parsePayload = (value: string): EntryPayload => {
	const parsed = JSON.parse(value);
	if (!parsed || (parsed.type !== "note" && parsed.type !== "link")) {
		throw new Error("Invalid payload_json in drafts table");
	}

	return parsed as EntryPayload;
};

const mapDraft = (row: DraftRow): DraftRecord => ({
	id: row.id,
	entryType: row.entry_type,
	flowId: row.flow_id,
	state: row.state,
	payload: parsePayload(row.payload_json),
	previewHtml: row.preview_html ?? undefined,
	createdAt: row.created_at,
	updatedAt: row.updated_at,
	publishedAt: row.published_at ?? undefined,
	publishedSlug: row.published_slug ?? undefined,
	publishedPath: row.published_path ?? undefined,
	publishedSha: row.published_sha ?? undefined,
});

const mapPublishEvent = (row: PublishEventRow): PublishEventRecord => ({
	id: row.id,
	draftId: row.draft_id ?? undefined,
	entryType: row.entry_type,
	flowId: row.flow_id,
	slug: row.slug,
	contentPath: row.content_path,
	githubCommitSha: row.github_commit_sha,
	githubCommitUrl: row.github_commit_url ?? undefined,
	repository: row.repository,
	createdAt: row.created_at,
	status: row.status,
});

const serializePayload = (payload: EntryPayload) => JSON.stringify(payload);

export const createDraft = async (
	env: Env,
	record: {
		id: string;
		entryType: EntryType;
		flowId: string;
		state: DraftState;
		payload: EntryPayload;
		previewHtml?: string;
		timestamp: string;
	},
) => {
	await env.DB.prepare(
		`INSERT INTO drafts (
      id, entry_type, flow_id, state, payload_json, preview_html,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
	)
		.bind(
			record.id,
			record.entryType,
			record.flowId,
			record.state,
			serializePayload(record.payload),
			record.previewHtml ?? null,
			record.timestamp,
			record.timestamp,
		)
		.run();
};

export const updateDraft = async (
	env: Env,
	record: {
		id: string;
		state: DraftState;
		payload: EntryPayload;
		previewHtml?: string;
		updatedAt: string;
		publishedAt?: string;
		publishedSlug?: string;
		publishedPath?: string;
		publishedSha?: string;
	},
) => {
	await env.DB.prepare(
		`UPDATE drafts
      SET state = ?,
          payload_json = ?,
          preview_html = ?,
          updated_at = ?,
          published_at = COALESCE(?, published_at),
          published_slug = COALESCE(?, published_slug),
          published_path = COALESCE(?, published_path),
          published_sha = COALESCE(?, published_sha)
      WHERE id = ?`,
	)
		.bind(
			record.state,
			serializePayload(record.payload),
			record.previewHtml ?? null,
			record.updatedAt,
			record.publishedAt ?? null,
			record.publishedSlug ?? null,
			record.publishedPath ?? null,
			record.publishedSha ?? null,
			record.id,
		)
		.run();
};

export const getDraftById = async (env: Env, draftId: string) => {
	const row = await env.DB.prepare(
		`SELECT id, entry_type, flow_id, state, payload_json, preview_html,
          created_at, updated_at, published_at, published_slug,
          published_path, published_sha
       FROM drafts
       WHERE id = ?`,
	)
		.bind(draftId)
		.first<DraftRow>();

	if (!row) {
		return undefined;
	}

	return mapDraft(row);
};

export const listDrafts = async (
	env: Env,
	options?: { state?: DraftState },
) => {
	const whereClause = options?.state ? "WHERE state = ?" : "";
	const statement = env.DB.prepare(
		`SELECT id, entry_type, flow_id, state, payload_json, preview_html,
          created_at, updated_at, published_at, published_slug,
          published_path, published_sha
       FROM drafts
       ${whereClause}
       ORDER BY updated_at DESC`,
	);

	const result = options?.state
		? await statement.bind(options.state).all<DraftRow>()
		: await statement.all<DraftRow>();

	return result.results.map(mapDraft);
};

export const createPreviewSession = async (
	env: Env,
	input: {
		id: string;
		draftId: string;
		flowId: string;
		previewToken: string;
		expiresAt: string;
		createdAt: string;
	},
) => {
	await env.DB.prepare(
		`INSERT INTO preview_sessions (
      id, draft_id, flow_id, preview_token, expires_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)`,
	)
		.bind(
			input.id,
			input.draftId,
			input.flowId,
			input.previewToken,
			input.expiresAt,
			input.createdAt,
		)
		.run();
};

export const getPreviewByToken = async (env: Env, token: string) => {
	const row = await env.DB.prepare(
		`SELECT
          ps.preview_token,
          ps.draft_id,
          ps.expires_at,
          d.flow_id,
          d.entry_type,
          d.state,
          d.preview_html,
          d.payload_json
       FROM preview_sessions ps
       INNER JOIN drafts d ON d.id = ps.draft_id
       WHERE ps.preview_token = ?`,
	)
		.bind(token)
		.first<{
			preview_token: string;
			draft_id: string;
			expires_at: string;
			flow_id: string;
			entry_type: EntryType;
			state: DraftState;
			preview_html: string | null;
			payload_json: string;
		}>();

	if (!row || !row.preview_html) {
		return undefined;
	}

	return {
		token: row.preview_token,
		draftId: row.draft_id,
		expiresAt: row.expires_at,
		flowId: row.flow_id,
		entryType: row.entry_type,
		state: row.state,
		previewHtml: row.preview_html,
		payload: parsePayload(row.payload_json),
	} satisfies PreviewTokenRecord;
};

export const createPublishEvent = async (
	env: Env,
	event: PublishEventRecord,
) => {
	await env.DB.prepare(
		`INSERT INTO publish_events (
      id, draft_id, entry_type, flow_id, slug,
      content_path, github_commit_sha, github_commit_url,
      repository, created_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	)
		.bind(
			event.id,
			event.draftId ?? null,
			event.entryType,
			event.flowId,
			event.slug,
			event.contentPath,
			event.githubCommitSha,
			event.githubCommitUrl ?? null,
			event.repository,
			event.createdAt,
			event.status,
		)
		.run();
};

export const listPublishEvents = async (env: Env, limit = 50) => {
	const result = await env.DB.prepare(
		`SELECT id, draft_id, entry_type, flow_id, slug,
          content_path, github_commit_sha, github_commit_url,
          repository, created_at, status
       FROM publish_events
       ORDER BY created_at DESC
       LIMIT ?`,
	)
		.bind(limit)
		.all<PublishEventRow>();

	return result.results.map(mapPublishEvent);
};

export const deleteExpiredPreviewSessions = async (
	env: Env,
	nowIso: string,
) => {
	await env.DB.prepare("DELETE FROM preview_sessions WHERE expires_at < ?")
		.bind(nowIso)
		.run();
};

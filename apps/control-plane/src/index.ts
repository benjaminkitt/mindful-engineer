import { hasAccessJwt, verifyAccessJwt } from "./auth";
import { buildCanonicalArtifact, renderPreviewHtml } from "./content";
import {
	createDraft,
	createPreviewSession,
	createPublishEvent,
	deleteExpiredPreviewSessions,
	getDraftById,
	getPreviewByToken,
	listDrafts,
	listPublishEvents,
	updateDraft,
} from "./db";
import { createFlowScaffold, isFlowId } from "./flow";
import { getRepositoryLabel, publishCanonicalArtifact } from "./github";
import type {
	EntryPayload,
	EntrySubmissionInput,
	EntryType,
	Env,
} from "./types";
import {
	renderAdminHomePage,
	renderDraftsPage,
	renderNewEntryPage,
	renderNotFoundPage,
	renderPreviewPage,
	renderReviewPage,
	renderSettingsPage,
	renderUnauthorizedPage,
} from "./ui";
import {
	parseAction,
	parseEntryPayload,
	parseFormDataToInput,
} from "./validation";

const htmlResponse = (html: string, init?: ResponseInit) =>
	new Response(html, {
		headers: {
			"content-type": "text/html; charset=utf-8",
			...(init?.headers ?? {}),
		},
		status: init?.status,
	});

const jsonResponse = (payload: unknown, init?: ResponseInit) =>
	new Response(JSON.stringify(payload, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			...(init?.headers ?? {}),
		},
		status: init?.status,
	});

const redirect = (location: string, status = 303) =>
	new Response(null, {
		status,
		headers: {
			location,
		},
	});

const requireAccess = async (request: Request, env: Env) => {
	const mode = env.ACCESS_PROTECTION_MODE ?? "cloudflare-access";
	if (mode === "off") {
		return true;
	}

	return verifyAccessJwt(request, env);
};

const currentIso = () => new Date().toISOString();

const getEntryType = (value: string | null): EntryType =>
	value === "link" ? "link" : "note";

const normalizePayloadForType = (
	entryType: EntryType,
	payload?: EntryPayload,
): EntryPayload => {
	if (entryType === "note") {
		if (payload?.type === "note") {
			return payload;
		}
		return { type: "note", body: "" };
	}

	if (payload?.type === "link") {
		return payload;
	}

	return { type: "link", url: "", commentary: "" };
};

const previewExpiryIso = (minutes = 30) =>
	new Date(Date.now() + minutes * 60_000).toISOString();

class PublishBookkeepingError extends Error {
	readonly result: {
		draftId: string;
		slug: string;
		contentPath: string;
		commitSha: string;
	};

	constructor(
		message: string,
		result: {
			draftId: string;
			slug: string;
			contentPath: string;
			commitSha: string;
		},
	) {
		super(message);
		this.name = "PublishBookkeepingError";
		this.result = result;
	}
}

const saveDraftAction = async (
	env: Env,
	options: {
		flowId: string;
		entryType: EntryType;
		payload: EntryPayload;
		draftId?: string;
	},
) => {
	const now = currentIso();
	const scaffold = createFlowScaffold(options.flowId);

	if (options.draftId) {
		const existing = await getDraftById(env, options.draftId);
		if (!existing) {
			throw new Error(`Draft not found: ${options.draftId}`);
		}
		scaffold.assertSameFlow(existing.flowId, "save draft existing row");
		scaffold.assertEntryType(existing.entryType, options.entryType);

		await updateDraft(env, {
			id: existing.id,
			state: "draft",
			payload: options.payload,
			previewHtml: undefined,
			updatedAt: now,
		});
		return existing.id;
	}

	const draftId = scaffold.newDraftId();
	await createDraft(env, {
		id: draftId,
		entryType: options.entryType,
		flowId: scaffold.flowId,
		state: "draft",
		payload: options.payload,
		timestamp: now,
	});
	return draftId;
};

const createPreviewAction = async (
	env: Env,
	options: {
		flowId: string;
		entryType: EntryType;
		payload: EntryPayload;
		draftId?: string;
	},
) => {
	const scaffold = createFlowScaffold(options.flowId);
	const now = currentIso();
	await deleteExpiredPreviewSessions(env, now);
	const previewHtml = renderPreviewHtml(options.entryType, options.payload);
	const draftId = options.draftId ?? scaffold.newDraftId();

	if (options.draftId) {
		const existing = await getDraftById(env, options.draftId);
		if (!existing) {
			throw new Error(`Draft not found: ${options.draftId}`);
		}
		scaffold.assertSameFlow(existing.flowId, "preview existing draft");
		scaffold.assertEntryType(existing.entryType, options.entryType);
		await updateDraft(env, {
			id: existing.id,
			state: "preview",
			payload: options.payload,
			previewHtml,
			updatedAt: now,
		});
	} else {
		await createDraft(env, {
			id: draftId,
			entryType: options.entryType,
			flowId: scaffold.flowId,
			state: "preview",
			payload: options.payload,
			previewHtml,
			timestamp: now,
		});
	}

	const token = scaffold.newPreviewToken();
	await createPreviewSession(env, {
		id: scaffold.newPreviewSessionId(),
		draftId,
		flowId: scaffold.flowId,
		previewToken: token,
		expiresAt: previewExpiryIso(),
		createdAt: now,
	});

	return { draftId, token };
};

const publishAction = async (
	env: Env,
	options: {
		flowId: string;
		entryType: EntryType;
		payload: EntryPayload;
		draftId?: string;
	},
) => {
	const now = currentIso();
	const scaffold = createFlowScaffold(options.flowId);
	const draftId = options.draftId ?? scaffold.newDraftId();

	if (options.draftId) {
		const existing = await getDraftById(env, options.draftId);
		if (!existing) {
			throw new Error(`Draft not found: ${options.draftId}`);
		}
		scaffold.assertSameFlow(existing.flowId, "publish existing draft");
		scaffold.assertEntryType(existing.entryType, options.entryType);
	}

	const artifact = buildCanonicalArtifact(
		options.entryType,
		options.payload,
		now,
	);
	const publishMessage = `publish(${options.entryType}): ${artifact.slug}`;
	const github = await publishCanonicalArtifact(env, artifact, publishMessage);
	const result = {
		draftId,
		slug: artifact.slug,
		contentPath: github.contentPath,
		commitSha: github.commitSha,
	};

	try {
		if (options.draftId) {
			await updateDraft(env, {
				id: draftId,
				state: "published",
				payload: options.payload,
				previewHtml: renderPreviewHtml(options.entryType, options.payload),
				updatedAt: now,
				publishedAt: now,
				publishedSlug: artifact.slug,
				publishedPath: github.contentPath,
				publishedSha: github.commitSha,
			});
		} else {
			await createDraft(env, {
				id: draftId,
				entryType: options.entryType,
				flowId: scaffold.flowId,
				state: "published",
				payload: options.payload,
				previewHtml: renderPreviewHtml(options.entryType, options.payload),
				timestamp: now,
			});

			await updateDraft(env, {
				id: draftId,
				state: "published",
				payload: options.payload,
				updatedAt: now,
				publishedAt: now,
				publishedSlug: artifact.slug,
				publishedPath: github.contentPath,
				publishedSha: github.commitSha,
			});
		}

		await createPublishEvent(env, {
			id: scaffold.newPublishEventId(),
			draftId,
			entryType: options.entryType,
			flowId: scaffold.flowId,
			slug: artifact.slug,
			contentPath: github.contentPath,
			githubCommitSha: github.commitSha,
			githubCommitUrl: github.commitUrl,
			repository: getRepositoryLabel(env),
			createdAt: now,
			status: "published",
		});
		return result;
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new PublishBookkeepingError(
			`Published canonical content, but failed to persist publish bookkeeping: ${detail}`,
			result,
		);
	}
};

const appendQueryParam = (
	query: URLSearchParams,
	key: string,
	value: string | undefined,
) => {
	if (value !== undefined) {
		query.set(key, value);
	}
};

const redirectToEntryError = (options: {
	entryType: EntryType;
	flowId: string;
	draftId?: string;
	message: string;
	input: EntrySubmissionInput;
}) => {
	const query = new URLSearchParams();
	query.set("type", options.entryType);
	query.set("flowId", options.flowId);
	if (options.draftId) {
		query.set("draftId", options.draftId);
	}
	appendQueryParam(query, "body", options.input.body);
	appendQueryParam(query, "url", options.input.url);
	appendQueryParam(query, "commentary", options.input.commentary);
	appendQueryParam(query, "title", options.input.title);
	appendQueryParam(query, "source", options.input.source);
	appendQueryParam(query, "summary", options.input.summary);
	appendQueryParam(query, "slug", options.input.slug);
	query.set("error", options.message);
	return redirect(`/admin/new?${query.toString()}`);
};

const getPayloadFromSearchParams = (
	entryType: EntryType,
	searchParams: URLSearchParams,
): EntryPayload | undefined => {
	const slugHint = searchParams.get("slug") ?? undefined;

	if (entryType === "note") {
		const body = searchParams.get("body");
		if (body === null && slugHint === undefined) {
			return undefined;
		}
		return {
			type: "note",
			body: body ?? "",
			slugHint,
		};
	}

	const url = searchParams.get("url");
	const commentary = searchParams.get("commentary") ?? undefined;
	const title = searchParams.get("title") ?? undefined;
	const source = searchParams.get("source") ?? undefined;
	const summary = searchParams.get("summary") ?? undefined;
	if (
		url === null &&
		commentary === undefined &&
		title === undefined &&
		source === undefined &&
		summary === undefined &&
		slugHint === undefined
	) {
		return undefined;
	}
	return {
		type: "link",
		url: url ?? "",
		commentary,
		title,
		source,
		summary,
		slugHint,
	};
};

const handleEntryAction = async (request: Request, env: Env) => {
	const formData = await request.formData();
	const input = parseFormDataToInput(formData);
	const requestedType = getEntryType(input.type ?? null);
	const draftId = input.draftId?.trim() || undefined;
	const requestedFlowId = input.flowId?.trim() || undefined;

	try {
		const action = parseAction(input.action);
		const payload = parseEntryPayload(input);
		const entryType = payload.type;
		const scaffold = createFlowScaffold(input.flowId);
		const flowId = scaffold.flowId;

		if (action === "save_draft") {
			const savedDraftId = await saveDraftAction(env, {
				flowId,
				entryType,
				payload,
				draftId,
			});
			return redirect(
				`/admin/new?type=${entryType}&flowId=${encodeURIComponent(flowId)}&draftId=${encodeURIComponent(savedDraftId)}&notice=${encodeURIComponent("Draft saved")}`,
			);
		}

		if (action === "preview") {
			const preview = await createPreviewAction(env, {
				flowId,
				entryType,
				payload,
				draftId,
			});
			return redirect(
				`/admin/review/preview/${encodeURIComponent(preview.token)}`,
			);
		}

		const result = await publishAction(env, {
			flowId,
			entryType,
			payload,
			draftId,
		});
		return redirect(
			`/admin/review?published=${encodeURIComponent(result.slug)}&flowId=${encodeURIComponent(flowId)}`,
		);
	} catch (error) {
		if (error instanceof PublishBookkeepingError) {
			return redirect(
				`/admin/review?published=${encodeURIComponent(error.result.slug)}&flowId=${encodeURIComponent(requestedFlowId ?? createFlowScaffold().flowId)}&error=${encodeURIComponent(error.message)}`,
			);
		}
		const message =
			error instanceof Error ? error.message : "Unexpected control-plane error";
		return redirectToEntryError({
			entryType: requestedType,
			flowId:
				requestedFlowId && isFlowId(requestedFlowId)
					? requestedFlowId
					: createFlowScaffold().flowId,
			draftId,
			message,
			input,
		});
	}
};

const parseUrl = (request: Request) => new URL(request.url);

const findDraft = async (env: Env, draftId?: string) => {
	if (!draftId) {
		return undefined;
	}
	return getDraftById(env, draftId);
};

const routeAdminGet = async (request: Request, env: Env) => {
	const url = parseUrl(request);
	const path = url.pathname;
	const notice = url.searchParams.get("notice") ?? undefined;

	if (path === "/" || path === "/admin") {
		const [drafts, events] = await Promise.all([
			listDrafts(env, { state: "draft" }),
			listPublishEvents(env, 5),
		]);
		return htmlResponse(renderAdminHomePage(drafts.length, events.length));
	}

	if (path === "/admin/new") {
		const requestedType = url.searchParams.get("type");
		const draftId = url.searchParams.get("draftId") ?? undefined;
		const providedFlow = url.searchParams.get("flowId") ?? undefined;
		const draft = await findDraft(env, draftId);
		if (draftId && !draft) {
			throw new Error(`Draft not found: ${draftId}`);
		}
		const scaffold = createFlowScaffold(providedFlow ?? draft?.flowId);
		const entryType =
			draft && !requestedType ? draft.entryType : getEntryType(requestedType);
		if (draft) {
			if (providedFlow) {
				scaffold.assertSameFlow(draft.flowId, "new page draft hydration");
			}
			if (requestedType) {
				scaffold.assertEntryType(draft.entryType, entryType);
			}
		}

		const redirectedPayload = getPayloadFromSearchParams(
			entryType,
			url.searchParams,
		);

		return htmlResponse(
			renderNewEntryPage({
				flowId: scaffold.flowId,
				activeType: entryType,
				payload: normalizePayloadForType(
					entryType,
					redirectedPayload ?? draft?.payload,
				),
				draft,
				notice,
				error: url.searchParams.get("error") ?? undefined,
			}),
		);
	}

	if (path === "/admin/drafts") {
		const drafts = await listDrafts(env, { state: "draft" });
		return htmlResponse(renderDraftsPage(drafts, notice));
	}

	if (path === "/admin/review") {
		const [reviewDrafts, events] = await Promise.all([
			listDrafts(env, { state: "preview" }),
			listPublishEvents(env, 50),
		]);
		const published = url.searchParams.get("published") ?? undefined;
		return htmlResponse(
			renderReviewPage(reviewDrafts, events, {
				notice,
				publishedSlug: published,
				error: url.searchParams.get("error") ?? undefined,
			}),
		);
	}

	if (path.startsWith("/admin/review/preview/")) {
		const token = decodeURIComponent(
			path.replace("/admin/review/preview/", ""),
		);
		const record = await getPreviewByToken(env, token);
		if (!record) {
			return htmlResponse(renderNotFoundPage(), { status: 404 });
		}

		if (new Date(record.expiresAt).getTime() < Date.now()) {
			return htmlResponse(renderNotFoundPage(), { status: 410 });
		}

		const draft = await getDraftById(env, record.draftId);
		if (!draft) {
			return htmlResponse(renderNotFoundPage(), { status: 404 });
		}

		return htmlResponse(
			renderPreviewPage({
				token,
				draft,
				expiresAt: record.expiresAt,
				previewHtml: record.previewHtml,
			}),
		);
	}

	if (path === "/admin/settings") {
		return htmlResponse(
			renderSettingsPage({
				accessMode: env.ACCESS_PROTECTION_MODE ?? "cloudflare-access",
				accessHeaderPresent: hasAccessJwt(request),
				hasGithubToken: Boolean(env.GITHUB_TOKEN?.trim()),
				hasGithubOwner: Boolean(env.GITHUB_OWNER?.trim()),
				hasGithubRepo: Boolean(env.GITHUB_REPO?.trim()),
				hasD1: Boolean(env.DB),
			}),
		);
	}

	return htmlResponse(renderNotFoundPage(), { status: 404 });
};

const routeApiGet = async (request: Request, env: Env) => {
	const url = parseUrl(request);
	if (url.pathname === "/api/control-plane/health") {
		return jsonResponse({
			ok: true,
			accessMode: env.ACCESS_PROTECTION_MODE ?? "cloudflare-access",
			repositoryConfigured: Boolean(
				env.GITHUB_OWNER?.trim() &&
					env.GITHUB_REPO?.trim() &&
					env.GITHUB_TOKEN?.trim(),
			),
			time: currentIso(),
		});
	}

	if (url.pathname === "/api/control-plane/drafts") {
		const stateParam = url.searchParams.get("state");
		const state =
			stateParam === "draft" ||
			stateParam === "preview" ||
			stateParam === "published"
				? stateParam
				: undefined;
		const drafts = await listDrafts(env, state ? { state } : undefined);
		return jsonResponse({
			count: drafts.length,
			drafts,
		});
	}

	if (url.pathname === "/api/control-plane/publish-events") {
		const events = await listPublishEvents(env, 100);
		return jsonResponse({
			count: events.length,
			events,
		});
	}

	return jsonResponse({ error: "Not found" }, { status: 404 });
};

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = parseUrl(request);
		if (
			!url.pathname.startsWith("/admin") &&
			!url.pathname.startsWith("/api/")
		) {
			return jsonResponse(
				{
					name: "mindful-engineer-control-plane",
					message: "Use /admin or /api/control-plane/health",
				},
				{ status: 404 },
			);
		}

		if (!(await requireAccess(request, env))) {
			if (url.pathname.startsWith("/api/")) {
				return jsonResponse({ error: "Unauthorized" }, { status: 401 });
			}
			return htmlResponse(renderUnauthorizedPage(), { status: 401 });
		}

		try {
			if (
				request.method === "POST" &&
				url.pathname === "/admin/actions/entry"
			) {
				return await handleEntryAction(request, env);
			}

			if (request.method === "GET" && url.pathname.startsWith("/admin")) {
				return await routeAdminGet(request, env);
			}

			if (request.method === "GET" && url.pathname.startsWith("/api/")) {
				return await routeApiGet(request, env);
			}

			return jsonResponse({ error: "Method not allowed" }, { status: 405 });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unexpected control-plane error";

			if (request.method === "GET" && url.pathname.startsWith("/admin")) {
				const providedFlow = url.searchParams.get("flowId");
				const fallbackFlow =
					providedFlow && isFlowId(providedFlow)
						? providedFlow
						: createFlowScaffold().flowId;
				return htmlResponse(
					renderNewEntryPage({
						flowId: fallbackFlow,
						activeType: getEntryType(url.searchParams.get("type")),
						payload: normalizePayloadForType(
							getEntryType(url.searchParams.get("type")),
						),
						error: message,
					}),
					{ status: 500 },
				);
			}

			return jsonResponse(
				{
					error: message,
				},
				{ status: 500 },
			);
		}
	},
};

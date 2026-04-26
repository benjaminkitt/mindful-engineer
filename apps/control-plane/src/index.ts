import { hasAccessJwt, verifyAccessJwt } from "./auth";
import { buildCanonicalArtifact, renderPreviewHtml } from "./content";
import {
	createDraft,
	createEntryRecovery,
	createPreviewSession,
	createPublishEvent,
	deleteEntryRecoveryByToken,
	deleteExpiredEntryRecoveries,
	deleteExpiredPreviewSessions,
	getDraftById,
	getEntryRecoveryByToken,
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

const isTestEnvironment = () => process.env.NODE_ENV === "test";

const getAccessProtectionMode = (env: Env) =>
	isTestEnvironment()
		? "off"
		: (env.ACCESS_PROTECTION_MODE ?? "cloudflare-access");

const requireAccess = async (request: Request, env: Env) => {
	const mode = getAccessProtectionMode(env);
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

const randomToken = (length = 12) => {
	const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
};

const newEntryRecoveryToken = () => `recover_${randomToken(10)}`;

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

const getPayloadFromInput = (
	entryType: EntryType,
	input: EntrySubmissionInput,
): EntryPayload => {
	if (entryType === "note") {
		return {
			type: "note",
			body: input.body ?? "",
			slugHint: input.slug,
		};
	}

	return {
		type: "link",
		url: input.url ?? "",
		commentary: input.commentary,
		title: input.title,
		source: input.source,
		summary: input.summary,
		slugHint: input.slug,
	};
};

const redirectToEntryError = async (
	env: Env,
	options: {
		entryType: EntryType;
		flowId: string;
		draftId?: string;
		message: string;
		input: EntrySubmissionInput;
	},
) => {
	const token = newEntryRecoveryToken();
	const now = currentIso();
	await deleteExpiredEntryRecoveries(env, now);
	await createEntryRecovery(env, {
		token,
		entryType: options.entryType,
		flowId: options.flowId,
		draftId: options.draftId,
		payload: getPayloadFromInput(options.entryType, options.input),
		error: options.message,
		createdAt: now,
		expiresAt: previewExpiryIso(),
	});
	const query = new URLSearchParams();
	query.set("type", options.entryType);
	query.set("flowId", options.flowId);
	if (options.draftId) {
		query.set("draftId", options.draftId);
	}
	query.set("recovery", token);
	return redirect(`/admin/new?${query.toString()}`);
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
		return redirectToEntryError(env, {
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
		const recoveryToken = url.searchParams.get("recovery") ?? undefined;
		const recovery = recoveryToken
			? await getEntryRecoveryByToken(env, recoveryToken)
			: undefined;
		const scaffold = createFlowScaffold(
			providedFlow ?? recovery?.flowId ?? draft?.flowId,
		);
		let entryType: EntryType;
		if (recovery) {
			entryType = recovery.entryType;
		} else if (draft && !requestedType) {
			entryType = draft.entryType;
		} else {
			entryType = getEntryType(requestedType);
		}
		if (draft) {
			if (providedFlow) {
				scaffold.assertSameFlow(draft.flowId, "new page draft hydration");
			}
			if (!recovery && requestedType) {
				scaffold.assertEntryType(draft.entryType, entryType);
			}
		}
		if (recoveryToken && recovery) {
			await deleteEntryRecoveryByToken(env, recoveryToken);
		}

		return htmlResponse(
			renderNewEntryPage({
				flowId: scaffold.flowId,
				activeType: entryType,
				payload: normalizePayloadForType(
					entryType,
					recovery?.payload ?? draft?.payload,
				),
				draft,
				notice,
				error: recovery?.error ?? url.searchParams.get("error") ?? undefined,
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
				accessMode: getAccessProtectionMode(env),
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
			accessMode: getAccessProtectionMode(env),
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
			url.pathname !== "/" &&
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

			if (
				request.method === "GET" &&
				(url.pathname === "/" || url.pathname.startsWith("/admin"))
			) {
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

			if (
				request.method === "GET" &&
				(url.pathname === "/" || url.pathname.startsWith("/admin"))
			) {
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

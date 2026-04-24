import { strict as assert } from "node:assert";
import test from "node:test";

import worker from "./index";
import type { D1PreparedStatement, Env } from "./types";

const createDb = (options?: {
	first?: (query: string, values: Array<string | number | null>) => unknown;
	all?: (query: string, values: Array<string | number | null>) => unknown[];
	run?: (query: string, values: Array<string | number | null>) => unknown;
}) => {
	const calls: Array<{ query: string; values: Array<string | number | null> }> =
		[];
	return {
		calls,
		binding: {
			prepare(query: string): D1PreparedStatement {
				let boundValues: Array<string | number | null> = [];
				const statement: D1PreparedStatement = {
					bind(...values: Array<string | number | null>) {
						boundValues = values;
						calls.push({ query, values });
						return statement;
					},
					first<T>() {
						return Promise.resolve(
							((options?.first?.(query, boundValues) as T | null | undefined) ??
								null) as T | null,
						);
					},
					run() {
						return Promise.resolve(options?.run?.(query, boundValues) ?? {});
					},
					all<T>() {
						return Promise.resolve({
							results:
								(options?.all?.(query, boundValues) as T[] | undefined) ?? [],
						});
					},
				};
				return statement;
			},
		},
	};
};

test("GET /admin does not trigger preview session cleanup writes", async () => {
	const db = createDb();
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const response = await worker.fetch(
		new Request("https://example.com/admin"),
		env,
	);
	assert.equal(response.status, 200);
	assert.equal(
		db.calls.some((call) =>
			call.query.includes("DELETE FROM preview_sessions"),
		),
		false,
	);
});

test("invalid flowId fallback is replaced on admin errors", async () => {
	const db = createDb();
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const response = await worker.fetch(
		new Request("https://example.com/admin/new?flowId=invalid"),
		env,
	);
	assert.equal(response.status, 500);
	const html = await response.text();
	assert.match(html, /name="flowId" value="flow_[a-z0-9]+_[a-z0-9]{6}"/);
	assert.doesNotMatch(html, /name="flowId" value="invalid"/);
	assert.equal(
		db.calls.some((call) =>
			call.query.includes("DELETE FROM preview_sessions"),
		),
		false,
	);
});

test("preview action cleans expired preview sessions before creating a new preview", async () => {
	const db = createDb();
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const form = new FormData();
	form.set("type", "note");
	form.set("body", "Ship calm systems.");
	form.set("action", "preview");
	form.set("flowId", "flow_kz9f_123abc");

	const response = await worker.fetch(
		new Request("https://example.com/admin/actions/entry", {
			method: "POST",
			body: form,
		}),
		env,
	);

	assert.equal(response.status, 303);
	assert.equal(
		db.calls.some((call) =>
			call.query.includes("DELETE FROM preview_sessions"),
		),
		true,
	);
});

test("GET /admin/new hydrates an existing link draft when type is omitted", async () => {
	const draftId = "draft_flow_kz9f_123abc_seeded01";
	const draftFlowId = "flow_kz9f_123abc";
	const db = createDb({
		first: (query, values) => {
			if (query.includes("FROM drafts") && values[0] === draftId) {
				return {
					id: draftId,
					entry_type: "link",
					flow_id: draftFlowId,
					state: "draft",
					payload_json: JSON.stringify({
						type: "link",
						url: "https://example.com/post",
						commentary: "Hydrated link commentary",
						title: "Hydrated link title",
					}),
					preview_html: null,
					created_at: "2026-04-23T00:00:00.000Z",
					updated_at: "2026-04-23T00:00:00.000Z",
					published_at: null,
					published_slug: null,
					published_path: null,
					published_sha: null,
				};
			}
			return null;
		},
	});
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const response = await worker.fetch(
		new Request(`https://example.com/admin/new?draftId=${draftId}`),
		env,
	);

	assert.equal(response.status, 200);
	const html = await response.text();
	assert.match(html, /name="flowId" value="flow_kz9f_123abc"/);
	assert.match(html, /<h2>New link<\/h2>/);
	assert.match(html, /Hydrated link commentary/);
	assert.match(html, /Hydrated link title/);
});

test("GET /admin/new still rejects a mismatched explicit type for an existing draft", async () => {
	const draftId = "draft_flow_kz9f_123abc_seeded01";
	const draftFlowId = "flow_kz9f_123abc";
	const db = createDb({
		first: (query, values) => {
			if (query.includes("FROM drafts") && values[0] === draftId) {
				return {
					id: draftId,
					entry_type: "link",
					flow_id: draftFlowId,
					state: "draft",
					payload_json: JSON.stringify({
						type: "link",
						url: "https://example.com/post",
						commentary: "Hydrated link commentary",
					}),
					preview_html: null,
					created_at: "2026-04-23T00:00:00.000Z",
					updated_at: "2026-04-23T00:00:00.000Z",
					published_at: null,
					published_slug: null,
					published_path: null,
					published_sha: null,
				};
			}
			return null;
		},
	});
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const response = await worker.fetch(
		new Request(`https://example.com/admin/new?draftId=${draftId}&type=note`),
		env,
	);

	assert.equal(response.status, 500);
	const html = await response.text();
	assert.match(html, /expected note, received link/);
	assert.match(html, /Flow \/ <code>flow_[a-z0-9]+_[a-z0-9]{6}<\/code>/);
});

test("GET /admin/new still rejects a mismatched explicit flowId for an existing draft", async () => {
	const draftId = "draft_flow_kz9f_123abc_seeded01";
	const draftFlowId = "flow_kz9f_123abc";
	const wrongFlowId = "flow_other_654321";
	const db = createDb({
		first: (query, values) => {
			if (query.includes("FROM drafts") && values[0] === draftId) {
				return {
					id: draftId,
					entry_type: "note",
					flow_id: draftFlowId,
					state: "draft",
					payload_json: JSON.stringify({
						type: "note",
						body: "Hydrated draft body",
					}),
					preview_html: null,
					created_at: "2026-04-23T00:00:00.000Z",
					updated_at: "2026-04-23T00:00:00.000Z",
					published_at: null,
					published_slug: null,
					published_path: null,
					published_sha: null,
				};
			}
			return null;
		},
	});
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const response = await worker.fetch(
		new Request(
			`https://example.com/admin/new?draftId=${draftId}&flowId=${wrongFlowId}`,
		),
		env,
	);

	assert.equal(response.status, 500);
	const html = await response.text();
	assert.match(
		html,
		/new page draft hydration: expected flow_other_654321, received flow_kz9f_123abc/,
	);
	assert.match(html, /name="flowId" value="flow_other_654321"/);
});

test("GET /admin/new omits note draftId from the link tab", async () => {
	const draftId = "draft_flow_kz9f_123abc_note01";
	const draftFlowId = "flow_kz9f_123abc";
	const db = createDb({
		first: (query, values) => {
			if (query.includes("FROM drafts") && values[0] === draftId) {
				return {
					id: draftId,
					entry_type: "note",
					flow_id: draftFlowId,
					state: "draft",
					payload_json: JSON.stringify({
						type: "note",
						body: "Hydrated draft body",
					}),
					preview_html: null,
					created_at: "2026-04-23T00:00:00.000Z",
					updated_at: "2026-04-23T00:00:00.000Z",
					published_at: null,
					published_slug: null,
					published_path: null,
					published_sha: null,
				};
			}
			return null;
		},
	});
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const response = await worker.fetch(
		new Request(
			`https://example.com/admin/new?draftId=${draftId}&flowId=${draftFlowId}&type=note`,
		),
		env,
	);

	assert.equal(response.status, 200);
	const html = await response.text();
	assert.match(
		html,
		new RegExp(
			`href="/admin/new\\?flowId=${draftFlowId}&type=note&draftId=${draftId}" class="active"`,
		),
	);
	assert.match(
		html,
		new RegExp(`href="/admin/new\\?flowId=${draftFlowId}&type=link" class=""`),
	);
	assert.doesNotMatch(
		html,
		new RegExp(
			`href="/admin/new\\?flowId=${draftFlowId}&type=link&draftId=${draftId}"`,
		),
	);
});

test("GET /admin/new omits link draftId from the note tab", async () => {
	const draftId = "draft_flow_kz9f_123abc_link01";
	const draftFlowId = "flow_kz9f_123abc";
	const db = createDb({
		first: (query, values) => {
			if (query.includes("FROM drafts") && values[0] === draftId) {
				return {
					id: draftId,
					entry_type: "link",
					flow_id: draftFlowId,
					state: "draft",
					payload_json: JSON.stringify({
						type: "link",
						url: "https://example.com/post",
						commentary: "Hydrated link commentary",
					}),
					preview_html: null,
					created_at: "2026-04-23T00:00:00.000Z",
					updated_at: "2026-04-23T00:00:00.000Z",
					published_at: null,
					published_slug: null,
					published_path: null,
					published_sha: null,
				};
			}
			return null;
		},
	});
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const response = await worker.fetch(
		new Request(
			`https://example.com/admin/new?draftId=${draftId}&flowId=${draftFlowId}&type=link`,
		),
		env,
	);

	assert.equal(response.status, 200);
	const html = await response.text();
	assert.match(
		html,
		new RegExp(
			`href="/admin/new\\?flowId=${draftFlowId}&type=link&draftId=${draftId}" class="active"`,
		),
	);
	assert.match(
		html,
		new RegExp(`href="/admin/new\\?flowId=${draftFlowId}&type=note" class=""`),
	);
	assert.doesNotMatch(
		html,
		new RegExp(
			`href="/admin/new\\?flowId=${draftFlowId}&type=note&draftId=${draftId}"`,
		),
	);
});

test("publish redirects to review with a recovery notice when draft bookkeeping fails after GitHub publish", async () => {
	const db = createDb({
		run: (query) => {
			if (query.includes("UPDATE drafts")) {
				throw new Error("D1 updateDraft failed");
			}
			return {};
		},
	});
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
		GITHUB_OWNER: "benjaminkitt",
		GITHUB_REPO: "mindful-engineer",
		GITHUB_TOKEN: "token",
	} satisfies Env;
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async (_input, init) => {
		if (!init?.method) {
			return new Response(null, { status: 404 });
		}
		return new Response(
			JSON.stringify({
				content: {
					path: "apps/public-site/src/content/notes/2026-04-23-ship-calm-systems.mdx",
				},
				commit: {
					sha: "abc123",
					html_url: "https://github.com/example/commit/abc123",
				},
			}),
			{ status: 200, headers: { "content-type": "application/json" } },
		);
	};

	const form = new FormData();
	form.set("type", "note");
	form.set("body", "Ship calm systems.");
	form.set("action", "publish");
	form.set("flowId", "flow_kz9f_123abc");

	try {
		const response = await worker.fetch(
			new Request("https://example.com/admin/actions/entry", {
				method: "POST",
				body: form,
			}),
			env,
		);

		assert.equal(response.status, 303);
		const location = response.headers.get("location") ?? "";
		assert.match(location, /^\/admin\/review\?/);
		assert.match(location, /published=\d{4}-\d{2}-\d{2}-ship-calm-systems/);
		assert.match(
			decodeURIComponent(location),
			/Published canonical content, but failed to persist publish bookkeeping: D1 updateDraft failed/,
		);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test("GET /admin/review renders bookkeeping recovery notices", async () => {
	const db = createDb();
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const response = await worker.fetch(
		new Request(
			"https://example.com/admin/review?published=2026-04-23-ship-calm-systems&error=Published%20canonical%20content%2C%20but%20failed%20to%20persist%20publish%20bookkeeping%3A%20D1%20updateDraft%20failed",
		),
		env,
	);

	assert.equal(response.status, 200);
	const html = await response.text();
	assert.match(html, /Published 2026-04-23-ship-calm-systems\./);
	assert.match(
		html,
		/Published canonical content, but failed to persist publish bookkeeping: D1 updateDraft failed/,
	);
});

test("publish failures redirect back to the admin editor instead of returning JSON", async () => {
	const db = createDb();
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const form = new FormData();
	form.set("type", "note");
	form.set("body", "Ship calm systems.");
	form.set("action", "publish");
	form.set("flowId", "flow_kz9f_123abc");

	const response = await worker.fetch(
		new Request("https://example.com/admin/actions/entry", {
			method: "POST",
			body: form,
		}),
		env,
	);

	assert.equal(response.status, 303);
	const location = response.headers.get("location") ?? "";
	assert.match(location, /^\/admin\/new\?/);
	assert.match(location, /type=note/);
	assert.match(location, /flowId=flow_kz9f_123abc/);
	const redirectUrl = new URL(`https://example.com${location}`);
	assert.equal(
		redirectUrl.searchParams.get("error"),
		"Missing required env var: GITHUB_OWNER",
	);
});

test("save draft failures preserve draft context in admin recovery redirects", async () => {
	const draftId = "draft_flow_kz9f_123abc_seeded01";
	const draftFlowId = "flow_kz9f_123abc";
	const db = createDb({
		first: (query, values) => {
			if (query.includes("FROM drafts") && values[0] === draftId) {
				return {
					id: draftId,
					entry_type: "note",
					flow_id: draftFlowId,
					state: "draft",
					payload_json: JSON.stringify({
						type: "note",
						body: "Hydrated draft body",
					}),
					preview_html: null,
					created_at: "2026-04-23T00:00:00.000Z",
					updated_at: "2026-04-23T00:00:00.000Z",
					published_at: null,
					published_slug: null,
					published_path: null,
					published_sha: null,
				};
			}
			return null;
		},
	});
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const form = new FormData();
	form.set("type", "note");
	form.set("body", "Ship calm systems.");
	form.set("action", "save_draft");
	form.set("flowId", "flow_other_654321");
	form.set("draftId", draftId);

	const response = await worker.fetch(
		new Request("https://example.com/admin/actions/entry", {
			method: "POST",
			body: form,
		}),
		env,
	);

	assert.equal(response.status, 303);
	const location = response.headers.get("location") ?? "";
	assert.match(location, /^\/admin\/new\?/);
	assert.match(location, /type=note/);
	assert.match(location, new RegExp(`draftId=${draftId}`));
	assert.match(location, /flowId=flow_other_654321/);
	const redirectUrl = new URL(`https://example.com${location}`);
	assert.equal(
		redirectUrl.searchParams.get("error"),
		"Flow mismatch in save draft existing row: expected flow_other_654321, received flow_kz9f_123abc",
	);
});

test("invalid link input redirects back to the admin editor instead of returning JSON", async () => {
	const db = createDb();
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const form = new FormData();
	form.set("type", "link");
	form.set("url", "ftp://example.com/post");
	form.set("commentary", "Ship calm systems.");
	form.set("action", "preview");
	form.set("flowId", "flow_kz9f_123abc");

	const response = await worker.fetch(
		new Request("https://example.com/admin/actions/entry", {
			method: "POST",
			body: form,
		}),
		env,
	);

	assert.equal(response.status, 303);
	const location = response.headers.get("location") ?? "";
	assert.match(location, /^\/admin\/new\?/);
	const redirectUrl = new URL(`https://example.com${location}`);
	assert.equal(redirectUrl.searchParams.get("type"), "link");
	assert.equal(redirectUrl.searchParams.get("flowId"), "flow_kz9f_123abc");
	assert.equal(
		redirectUrl.searchParams.get("error"),
		"Link URL must use http or https",
	);
});

test("invalid flowId input redirects back to the admin editor with a fresh flowId", async () => {
	const db = createDb();
	const env = {
		DB: db.binding,
		ACCESS_PROTECTION_MODE: "off",
	} satisfies Env;

	const form = new FormData();
	form.set("type", "note");
	form.set("body", "Ship calm systems.");
	form.set("action", "save_draft");
	form.set("flowId", "invalid-flow");

	const response = await worker.fetch(
		new Request("https://example.com/admin/actions/entry", {
			method: "POST",
			body: form,
		}),
		env,
	);

	assert.equal(response.status, 303);
	const location = response.headers.get("location") ?? "";
	assert.match(location, /^\/admin\/new\?/);
	const redirectUrl = new URL(`https://example.com${location}`);
	assert.equal(redirectUrl.searchParams.get("type"), "note");
	assert.match(
		redirectUrl.searchParams.get("flowId") ?? "",
		/^flow_[a-z0-9]+_[a-z0-9]{6}$/,
	);
	assert.notEqual(redirectUrl.searchParams.get("flowId"), "invalid-flow");
	assert.equal(
		redirectUrl.searchParams.get("error"),
		'Invalid flowId "invalid-flow". Expected pattern: ^flow_[a-z0-9]+_[a-z0-9]{6}$',
	);
});

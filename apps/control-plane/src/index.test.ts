import { strict as assert } from "node:assert";
import test from "node:test";

import worker from "./index";
import type { D1PreparedStatement, Env } from "./types";

const createDb = (options?: {
	first?: (query: string, values: Array<string | number | null>) => unknown;
	all?: (query: string, values: Array<string | number | null>) => unknown[];
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
						return Promise.resolve({});
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

test("GET /admin/new hydrates an existing draft when only draftId is provided", async () => {
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

	const response = await worker.fetch(
		new Request(`https://example.com/admin/new?draftId=${draftId}`),
		env,
	);

	assert.equal(response.status, 200);
	const html = await response.text();
	assert.match(html, /name="flowId" value="flow_kz9f_123abc"/);
	assert.match(html, /Hydrated draft body/);
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

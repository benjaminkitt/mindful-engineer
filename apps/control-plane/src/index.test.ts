import { strict as assert } from "node:assert";
import test from "node:test";

import worker from "./index";
import type { D1PreparedStatement, Env } from "./types";

const createDb = () => {
	const calls: Array<{ query: string; values: Array<string | number | null> }> =
		[];
	return {
		calls,
		binding: {
			prepare(query: string): D1PreparedStatement {
				const statement: D1PreparedStatement = {
					bind(...values: Array<string | number | null>) {
						calls.push({ query, values });
						return statement;
					},
					first: async () => null,
					run: async () => ({}),
					all: async () => ({ results: [] }),
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

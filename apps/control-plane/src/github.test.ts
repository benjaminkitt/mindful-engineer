import { strict as assert } from "node:assert";
import test from "node:test";

import { publishCanonicalArtifact } from "./github";
import type { CanonicalArtifact, Env } from "./types";

const env = {
	DB: {} as Env["DB"],
	GITHUB_OWNER: "benjaminkitt",
	GITHUB_REPO: "mindful-engineer",
	GITHUB_TOKEN: "token",
} satisfies Env;

const artifact: CanonicalArtifact = {
	slug: "ship-calm-systems",
	entryType: "note",
	relativePath: "notes/2026-04-23-ship-calm-systems.mdx",
	mdx: "hello 🌊",
	publishedAt: "2026-04-23T00:00:00.000Z",
};

test("publishCanonicalArtifact sends UTF-8 content encoded as base64", async () => {
	const calls: Array<{ url: string; init?: RequestInit }> = [];
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async (input, init) => {
		calls.push({ url: String(input), init });
		if (!init?.method) {
			return new Response(null, { status: 404 });
		}
		return new Response(
			JSON.stringify({
				content: { path: artifact.relativePath },
				commit: {
					sha: "abc123",
					html_url: "https://github.com/example/commit/abc123",
				},
			}),
			{ status: 200, headers: { "content-type": "application/json" } },
		);
	};

	try {
		const result = await publishCanonicalArtifact(
			env,
			artifact,
			"publish(note): ship-calm-systems",
		);
		assert.equal(result.commitSha, "abc123");
		assert.equal(calls.length, 2);
		const payload = JSON.parse(String(calls[1]?.init?.body));
		assert.equal(payload.content, "aGVsbG8g8J+Mig==");
	} finally {
		globalThis.fetch = originalFetch;
	}
});

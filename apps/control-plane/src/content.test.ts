import { strict as assert } from "node:assert";
import test from "node:test";

import { buildCanonicalArtifact, renderPreviewHtml } from "./content";

test("buildCanonicalArtifact creates note MDX compatible with public-site note schema", () => {
	const publishedAt = "2026-05-01T10:15:00.000Z";
	const artifact = buildCanonicalArtifact(
		"note",
		{
			type: "note",
			body: "A body-first note from mobile.",
			slugHint: "Body first note",
		},
		publishedAt,
	);

	assert.equal(artifact.entryType, "note");
	assert.match(
		artifact.relativePath,
		/^notes\/2026-05-01-body-first-note\.mdx$/,
	);
	assert.match(artifact.mdx, /type: "note"/);
	assert.match(artifact.mdx, /slug: "2026-05-01-body-first-note"/);
	assert.match(artifact.mdx, /publishedAt: "2026-05-01T10:15:00.000Z"/);
	assert.match(artifact.mdx, /published: true/);
	assert.match(artifact.mdx, /A body-first note from mobile\./);
});

test("buildCanonicalArtifact preserves note body whitespace in published MDX", () => {
	const body = "    code block line\ntrailing spaces preserved here.  ";
	const artifact = buildCanonicalArtifact(
		"note",
		{
			type: "note",
			body,
		},
		"2026-05-04T08:30:00.000Z",
	);

	assert.ok(artifact.mdx.endsWith(`${body}\n`));
});

test("buildCanonicalArtifact still rejects whitespace-only note bodies", () => {
	assert.throws(
		() =>
			buildCanonicalArtifact(
				"note",
				{
					type: "note",
					body: "   \n\t  ",
				},
				"2026-05-04T08:30:00.000Z",
			),
		/Note body is required/,
	);
});

test("buildCanonicalArtifact creates link MDX compatible with public-site link schema", () => {
	const publishedAt = "2026-05-02T11:20:00.000Z";
	const artifact = buildCanonicalArtifact(
		"link",
		{
			type: "link",
			url: "https://example.com/posts/attention-is-a-practice",
			commentary: "Useful for deciding when not to notify.",
			slugHint: "attention practice",
		},
		publishedAt,
	);

	assert.equal(artifact.entryType, "link");
	assert.match(
		artifact.relativePath,
		/^links\/2026-05-02-attention-practice\.mdx$/,
	);
	assert.match(artifact.mdx, /type: "link"/);
	assert.match(
		artifact.mdx,
		/url: "https:\/\/example.com\/posts\/attention-is-a-practice"/,
	);
	assert.match(artifact.mdx, /source: "example.com"/);
	assert.match(artifact.mdx, /summary: "/);
	assert.match(artifact.mdx, /published: true/);
	assert.match(artifact.mdx, /Useful for deciding when not to notify\./);
});

test("buildCanonicalArtifact quotes numeric-looking and boolean-looking link strings", () => {
	const artifact = buildCanonicalArtifact(
		"link",
		{
			type: "link",
			url: "https://example.com/posts/2026",
			title: "2026",
			source: "true",
			commentary: "Still a string in frontmatter.",
		},
		"2026-05-03T09:00:00.000Z",
	);

	assert.match(artifact.mdx, /title: "2026"/);
	assert.match(artifact.mdx, /source: "true"/);
	assert.match(artifact.mdx, /url: "https:\/\/example\.com\/posts\/2026"/);
});

test("renderPreviewHtml escapes unsafe text for note previews", () => {
	const html = renderPreviewHtml("note", {
		type: "note",
		body: "<script>alert('x')</script>",
	});

	assert.match(html, /&lt;script&gt;alert\(&#39;x&#39;\)&lt;\/script&gt;/);
	assert.doesNotMatch(html, /<script>/);
});

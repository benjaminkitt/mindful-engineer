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
	assert.match(artifact.mdx, /type: note/);
	assert.match(artifact.mdx, /slug: 2026-05-01-body-first-note/);
	assert.match(artifact.mdx, /publishedAt: "2026-05-01T10:15:00.000Z"/);
	assert.match(artifact.mdx, /published: true/);
	assert.match(artifact.mdx, /A body-first note from mobile\./);
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
	assert.match(artifact.mdx, /type: link/);
	assert.match(
		artifact.mdx,
		/url: "https:\/\/example.com\/posts\/attention-is-a-practice"/,
	);
	assert.match(artifact.mdx, /source: example.com/);
	assert.match(artifact.mdx, /summary:/);
	assert.match(artifact.mdx, /published: true/);
	assert.match(artifact.mdx, /Useful for deciding when not to notify\./);
});

test("renderPreviewHtml escapes unsafe text for note previews", () => {
	const html = renderPreviewHtml("note", {
		type: "note",
		body: "<script>alert('x')</script>",
	});

	assert.match(html, /&lt;script&gt;alert\(&#39;x&#39;\)&lt;\/script&gt;/);
	assert.doesNotMatch(html, /<script>/);
});

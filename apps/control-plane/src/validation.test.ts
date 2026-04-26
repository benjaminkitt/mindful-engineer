import { strict as assert } from "node:assert";
import test from "node:test";

import { parseAction, parseEntryPayload } from "./validation";

test("parseAction accepts supported control-plane actions", () => {
	assert.equal(parseAction("save_draft"), "save_draft");
	assert.equal(parseAction("preview"), "preview");
	assert.equal(parseAction("publish"), "publish");
	assert.throws(() => parseAction("delete"), /Unsupported action/);
});

test("parseEntryPayload enforces body-first note creation", () => {
	const note = parseEntryPayload({ type: "note", body: "Ship calm systems." });
	assert.equal(note.type, "note");
	if (note.type === "note") {
		assert.equal(note.body, "Ship calm systems.");
	}
	assert.throws(
		() => parseEntryPayload({ type: "note", body: "  " }),
		/Note body is required/,
	);
});

test("parseEntryPayload preserves authored note body whitespace", () => {
	const note = parseEntryPayload({
		type: "note",
		body: "  indented line\ncontent\n",
	});

	assert.equal(note.type, "note");
	if (note.type === "note") {
		assert.equal(note.body, "  indented line\ncontent\n");
	}
});

test("parseEntryPayload validates link URL and optional commentary", () => {
	const link = parseEntryPayload({
		type: "link",
		url: "https://example.com",
		commentary: "Worth reading.",
	});

	assert.equal(link.type, "link");
	if (link.type === "link") {
		assert.equal(link.url, "https://example.com/");
		assert.equal(link.commentary, "Worth reading.");
	}

	assert.throws(
		() => parseEntryPayload({ type: "link", url: "ftp://example.com" }),
		/http or https/,
	);
});

test("parseEntryPayload preserves authored link commentary whitespace", () => {
	const link = parseEntryPayload({
		type: "link",
		url: "https://example.com",
		commentary: "  indented line\ncommentary with hard break  \n",
	});

	assert.equal(link.type, "link");
	if (link.type === "link") {
		assert.equal(
			link.commentary,
			"  indented line\ncommentary with hard break  \n",
		);
	}
});

test("parseEntryPayload drops whitespace-only link commentary", () => {
	const link = parseEntryPayload({
		type: "link",
		url: "https://example.com",
		commentary: "  \n\t  ",
	});

	assert.equal(link.type, "link");
	if (link.type === "link") {
		assert.equal(link.commentary, undefined);
	}
});

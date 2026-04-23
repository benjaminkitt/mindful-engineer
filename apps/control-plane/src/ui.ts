import type {
	DraftRecord,
	EntryPayload,
	EntryType,
	PublishEventRecord,
} from "./types";

interface LayoutOptions {
	title: string;
	path: string;
	body: string;
	notice?: string;
	error?: string;
	flowId?: string;
}

interface SettingsSummary {
	accessMode: string;
	accessHeaderPresent: boolean;
	hasGithubToken: boolean;
	hasGithubOwner: boolean;
	hasGithubRepo: boolean;
	hasD1: boolean;
}

const navItems = [
	{ href: "/admin/new", label: "New" },
	{ href: "/admin/drafts", label: "Drafts" },
	{ href: "/admin/review", label: "Review" },
	{ href: "/admin/settings", label: "Settings" },
] as const;

const escapeHtml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");

const toMultilineSafe = (value: string) =>
	escapeHtml(value).replace(/\n/g, "&#10;");

const formatDateTime = (value: string) =>
	new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));

const layout = ({
	title,
	path,
	body,
	notice,
	error,
	flowId,
}: LayoutOptions) => {
	const nav = navItems
		.map((item) => {
			const active = path.startsWith(item.href);
			return `<a href="${item.href}" class="nav-link${active ? " active" : ""}">${item.label}</a>`;
		})
		.join("");

	const noticeBlock = notice
		? `<section class="notice">${escapeHtml(notice)}</section>`
		: "";
	const errorBlock = error
		? `<section class="error">${escapeHtml(error)}</section>`
		: "";
	const flowBlock = flowId
		? `<p class="flow-id">Flow / <code>${escapeHtml(flowId)}</code></p>`
		: "";

	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · Mindful Engineer Control Plane</title>
  <style>
    :root {
      --ink: #161616;
      --muted: #5f5a54;
      --paper: #f7f2e9;
      --line: #d5c8b8;
      --accent: #7f4a2f;
      --card: #fff9f1;
      --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      --sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--sans);
      line-height: 1.45;
    }
    .app {
      width: min(980px, 100% - 24px);
      margin: 0 auto;
      padding: 16px 0 40px;
    }
    header {
      border-bottom: 1px solid var(--line);
      padding: 8px 0 14px;
      margin-bottom: 18px;
    }
    h1 { margin: 6px 0 4px; font-size: clamp(1.3rem, 4.4vw, 1.8rem); }
    .subtitle { color: var(--muted); margin: 0; font-size: 0.95rem; }
    nav { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
    .nav-link {
      border: 1px solid var(--line);
      text-decoration: none;
      color: var(--ink);
      border-radius: 999px;
      padding: 6px 11px;
      font-size: 0.85rem;
      background: #fff;
    }
    .nav-link.active {
      border-color: var(--accent);
      color: var(--accent);
      font-weight: 600;
    }
    main { display: grid; gap: 14px; }
    .card {
      border: 1px solid var(--line);
      background: var(--card);
      border-radius: 14px;
      padding: 14px;
    }
    .notice, .error {
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 0.94rem;
    }
    .notice { background: #eef7ea; border: 1px solid #bed8b7; }
    .error { background: #fdecea; border: 1px solid #efb9b5; }
    .flow-id {
      margin: 0;
      font-size: 0.82rem;
      color: var(--muted);
      font-family: var(--mono);
    }
    form { display: grid; gap: 10px; }
    .type-switch {
      display: inline-flex;
      border: 1px solid var(--line);
      border-radius: 999px;
      overflow: hidden;
      align-self: start;
    }
    .type-switch a {
      text-decoration: none;
      color: var(--ink);
      padding: 6px 12px;
      font-size: 0.85rem;
      background: #fff;
    }
    .type-switch a.active {
      background: var(--accent);
      color: #fff;
    }
    label { display: grid; gap: 5px; font-size: 0.88rem; }
    input, textarea {
      border: 1px solid #bfae9d;
      background: #fff;
      border-radius: 8px;
      font: inherit;
      padding: 10px 12px;
      width: 100%;
    }
    textarea { min-height: 150px; resize: vertical; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    button {
      border: 1px solid #b69f87;
      border-radius: 999px;
      background: #fff;
      color: var(--ink);
      padding: 8px 13px;
      font: inherit;
      font-size: 0.9rem;
    }
    button.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    th, td {
      text-align: left;
      border-bottom: 1px solid var(--line);
      padding: 8px 6px;
      vertical-align: top;
    }
    th { font-weight: 600; color: var(--muted); }
    .pill {
      display: inline-flex;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: .03em;
      font-family: var(--mono);
      background: #fff;
    }
    a.inline { color: var(--accent); }
    code { font-family: var(--mono); font-size: 0.82rem; }
    .split { display: grid; gap: 12px; }
    @media (min-width: 760px) {
      .split { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <div class="app">
    <header>
      <p class="subtitle">Protected editorial control plane</p>
      <h1>Mindful Engineer / Admin</h1>
      <nav>${nav}</nav>
    </header>
    ${noticeBlock}
    ${errorBlock}
    ${flowBlock}
    <main>${body}</main>
  </div>
</body>
</html>`;
};

const renderTypeSwitch = (
	active: EntryType,
	flowId: string,
	draftId?: string,
) => {
	const query = new URLSearchParams();
	query.set("flowId", flowId);
	if (draftId) {
		query.set("draftId", draftId);
	}

	const noteUrl = new URLSearchParams(query);
	noteUrl.set("type", "note");
	const linkUrl = new URLSearchParams(query);
	linkUrl.set("type", "link");

	return `<div class="type-switch"><a href="/admin/new?${noteUrl.toString()}" class="${active === "note" ? "active" : ""}">Note</a><a href="/admin/new?${linkUrl.toString()}" class="${active === "link" ? "active" : ""}">Link</a></div>`;
};

const hiddenPayloadInputs = (payload: EntryPayload) => {
	if (payload.type === "note") {
		return [
			`<input type="hidden" name="body" value="${toMultilineSafe(payload.body)}" />`,
			`<input type="hidden" name="slug" value="${escapeHtml(payload.slugHint ?? "")}" />`,
		].join("");
	}

	return [
		`<input type="hidden" name="url" value="${escapeHtml(payload.url)}" />`,
		`<input type="hidden" name="commentary" value="${toMultilineSafe(payload.commentary ?? "")}" />`,
		`<input type="hidden" name="title" value="${escapeHtml(payload.title ?? "")}" />`,
		`<input type="hidden" name="source" value="${escapeHtml(payload.source ?? "")}" />`,
		`<input type="hidden" name="summary" value="${toMultilineSafe(payload.summary ?? "")}" />`,
		`<input type="hidden" name="slug" value="${escapeHtml(payload.slugHint ?? "")}" />`,
	].join("");
};

const noteFields = (payload: EntryPayload) => {
	const noteBody = payload.type === "note" ? payload.body : "";
	const slugHint = payload.type === "note" ? (payload.slugHint ?? "") : "";
	return `<label>Body
  <textarea name="body" placeholder="Write the note body..." required>${toMultilineSafe(noteBody)}</textarea>
</label>
<label>Optional slug hint
  <input type="text" name="slug" placeholder="optional-slug-hint" value="${escapeHtml(slugHint)}" />
</label>`;
};

const linkFields = (payload: EntryPayload) => {
	const data = payload.type === "link" ? payload : undefined;
	return `<label>URL
  <input type="url" name="url" placeholder="https://example.com/article" required value="${escapeHtml(data?.url ?? "")}" />
</label>
<label>Commentary (optional)
  <textarea name="commentary" placeholder="Why this matters (optional)">${toMultilineSafe(data?.commentary ?? "")}</textarea>
</label>
<div class="split">
  <label>Title (optional)
    <input type="text" name="title" value="${escapeHtml(data?.title ?? "")}" />
  </label>
  <label>Source (optional)
    <input type="text" name="source" value="${escapeHtml(data?.source ?? "")}" />
  </label>
</div>
<label>Summary (optional)
  <input type="text" name="summary" value="${escapeHtml(data?.summary ?? "")}" />
</label>
<label>Optional slug hint
  <input type="text" name="slug" placeholder="optional-slug-hint" value="${escapeHtml(data?.slugHint ?? "")}" />
</label>`;
};

export const renderAdminHomePage = (
	draftsCount: number,
	recentPublishesCount: number,
) =>
	layout({
		title: "Admin",
		path: "/admin",
		body: `<section class="card"><h2>Editorial workflow</h2><p>This app is the separate protected control plane for remote publishing. Use it for body-first note capture, URL-first link capture, drafts, preview, and canonical publish into the repository.</p><ul><li><a class="inline" href="/admin/new">Create new entry</a></li><li><a class="inline" href="/admin/drafts">Review drafts (${draftsCount})</a></li><li><a class="inline" href="/admin/review">Review publishes (${recentPublishesCount})</a></li></ul></section>`,
	});

export const renderNewEntryPage = (params: {
	flowId: string;
	activeType: EntryType;
	payload: EntryPayload;
	draft?: DraftRecord;
	notice?: string;
	error?: string;
}) => {
	const { flowId, activeType, payload, draft, notice, error } = params;
	const draftInfo = draft
		? `<p><span class="pill">${draft.state}</span> Draft <code>${escapeHtml(draft.id)}</code> · updated ${formatDateTime(draft.updatedAt)}</p>`
		: '<p><span class="pill">new</span> Start a capture flow. Save, preview, or publish from one screen.</p>';

	const fields =
		activeType === "note" ? noteFields(payload) : linkFields(payload);

	return layout({
		title: "New",
		path: "/admin/new",
		notice,
		error,
		flowId,
		body: `<section class="card"><h2>New ${activeType}</h2>${draftInfo}${renderTypeSwitch(activeType, flowId, draft?.id)}<form method="post" action="/admin/actions/entry"><input type="hidden" name="type" value="${activeType}" /><input type="hidden" name="flowId" value="${escapeHtml(flowId)}" />${draft ? `<input type="hidden" name="draftId" value="${escapeHtml(draft.id)}" />` : ""}${fields}<div class="actions"><button type="submit" name="action" value="save_draft">Save draft</button><button type="submit" name="action" value="preview">Preview</button><button type="submit" class="primary" name="action" value="publish">Publish canonical</button></div></form></section>`,
	});
};

export const renderDraftsPage = (drafts: DraftRecord[], notice?: string) => {
	const rows = drafts
		.map((draft) => {
			const entrySummary =
				draft.payload.type === "note"
					? escapeHtml(draft.payload.body.slice(0, 90))
					: escapeHtml(
							(draft.payload.commentary || draft.payload.url).slice(0, 90),
						);
			const editHref = `/admin/new?draftId=${encodeURIComponent(draft.id)}&flowId=${encodeURIComponent(draft.flowId)}&type=${draft.entryType}`;
			return `<tr><td><span class="pill">${draft.state}</span></td><td>${draft.entryType}</td><td><code>${escapeHtml(draft.flowId)}</code></td><td>${entrySummary}</td><td>${formatDateTime(draft.updatedAt)}</td><td><a class="inline" href="${editHref}">Open</a></td></tr>`;
		})
		.join("");

	return layout({
		title: "Drafts",
		path: "/admin/drafts",
		notice,
		body: `<section class="card"><h2>Drafts</h2><p>Operational state in D1 only. Canonical content is committed to repository during publish.</p><table><thead><tr><th>State</th><th>Type</th><th>Flow</th><th>Summary</th><th>Updated</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="6">No drafts yet.</td></tr>'}</tbody></table></section>`,
	});
};

export const renderReviewPage = (
	draftsInReview: DraftRecord[],
	events: PublishEventRecord[],
	options?: { notice?: string; publishedSlug?: string },
) => {
	const draftRows = draftsInReview
		.map((draft) => {
			const href = `/admin/new?draftId=${encodeURIComponent(draft.id)}&flowId=${encodeURIComponent(draft.flowId)}&type=${draft.entryType}`;
			return `<tr><td><span class="pill">${draft.state}</span></td><td>${draft.entryType}</td><td><code>${escapeHtml(draft.flowId)}</code></td><td>${formatDateTime(draft.updatedAt)}</td><td><a class="inline" href="${href}">Continue</a></td></tr>`;
		})
		.join("");

	const eventRows = events
		.map((event) => {
			const commitCell = event.githubCommitUrl
				? `<a class="inline" href="${escapeHtml(event.githubCommitUrl)}" target="_blank" rel="noreferrer">${event.githubCommitSha.slice(0, 10)}</a>`
				: `<code>${event.githubCommitSha.slice(0, 10)}</code>`;
			return `<tr><td>${event.entryType}</td><td><code>${escapeHtml(event.slug)}</code></td><td><code>${escapeHtml(event.contentPath)}</code></td><td>${commitCell}</td><td>${formatDateTime(event.createdAt)}</td></tr>`;
		})
		.join("");

	const publishedNotice = options?.publishedSlug
		? `Published ${options.publishedSlug}.`
		: options?.notice;

	return layout({
		title: "Review",
		path: "/admin/review",
		notice: publishedNotice,
		body: `<section class="card"><h2>Draft and preview queue</h2><table><thead><tr><th>State</th><th>Type</th><th>Flow</th><th>Updated</th><th></th></tr></thead><tbody>${draftRows || '<tr><td colspan="5">No draft/preview entries pending review.</td></tr>'}</tbody></table></section><section class="card"><h2>Canonical publish events</h2><table><thead><tr><th>Type</th><th>Slug</th><th>Canonical path</th><th>Commit</th><th>Published</th></tr></thead><tbody>${eventRows || '<tr><td colspan="5">No publish events yet.</td></tr>'}</tbody></table></section>`,
	});
};

export const renderPreviewPage = (params: {
	token: string;
	draft: DraftRecord;
	expiresAt: string;
	previewHtml: string;
}) => {
	const { token, draft, expiresAt, previewHtml } = params;
	const actionInputs = hiddenPayloadInputs(draft.payload);

	return layout({
		title: "Preview",
		path: "/admin/review",
		flowId: draft.flowId,
		body: `<section class="card"><h2>Preview</h2><p><span class="pill">${draft.entryType}</span> token <code>${escapeHtml(token)}</code></p><p>Expires ${formatDateTime(expiresAt)}</p><div class="card" style="background:#fff;">${previewHtml}</div><form method="post" action="/admin/actions/entry"><input type="hidden" name="type" value="${draft.entryType}" /><input type="hidden" name="flowId" value="${escapeHtml(draft.flowId)}" /><input type="hidden" name="draftId" value="${escapeHtml(draft.id)}" />${actionInputs}<div class="actions"><button type="submit" name="action" value="save_draft">Back to draft</button><button type="submit" class="primary" name="action" value="publish">Publish canonical</button></div></form></section>`,
	});
};

export const renderSettingsPage = (summary: SettingsSummary) => {
	const bool = (value: boolean) => (value ? "configured" : "missing");
	return layout({
		title: "Settings",
		path: "/admin/settings",
		body: `<section class="card"><h2>MVP protection and bindings</h2><table><tbody><tr><th>Access mode</th><td>${escapeHtml(summary.accessMode)}</td></tr><tr><th>Access header present</th><td>${bool(summary.accessHeaderPresent)}</td></tr><tr><th>D1 binding</th><td>${bool(summary.hasD1)}</td></tr><tr><th>GitHub token</th><td>${bool(summary.hasGithubToken)}</td></tr><tr><th>GitHub owner</th><td>${bool(summary.hasGithubOwner)}</td></tr><tr><th>GitHub repo</th><td>${bool(summary.hasGithubRepo)}</td></tr></tbody></table><p>Cloudflare Access should protect this Worker at the edge. This app still checks for Access identity headers as an MVP guardrail.</p></section>`,
	});
};

export const renderUnauthorizedPage = () =>
	layout({
		title: "Unauthorized",
		path: "/admin",
		error:
			"Access denied. This control plane expects Cloudflare Access headers before editorial workflows are available.",
		body: `<section class="card"><h2>Cloudflare Access required</h2><p>For MVP, this route must be behind a Cloudflare Access policy. Once Access is configured, retry from an authorized session.</p></section>`,
	});

export const renderNotFoundPage = () =>
	layout({
		title: "Not found",
		path: "/admin",
		error: "Route not found.",
		body: `<section class="card"><p>Use <a class="inline" href="/admin/new">/admin/new</a> to create an entry.</p></section>`,
	});

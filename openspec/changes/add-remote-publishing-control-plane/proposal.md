## Why

The MVP needs a practical way to publish notes and links from anywhere and to manage publishing without depending solely on local git workflows. This slice creates the protected control-plane app so remote capture, review, and canonical publishing become real end-to-end capabilities.

## What Changes

- Build a separate protected admin/control-plane app for remote publishing workflows.
- Protect the app with Cloudflare Access for MVP.
- Add mobile-friendly creation flows for notes and links.
- Add draft/review/publish workflows appropriate for laptop-authored articles and remotely created short-form entries.
- Commit canonical published content directly into the repository via GitHub API rather than storing canonical content in D1.
- Use D1 only for operational metadata such as publish bookkeeping, preview sessions, and workflow state.

## Capabilities

### New Capabilities
- `remote-publishing-control-plane`: Provides the protected editorial app for capture, draft management, preview orchestration, and canonical publishing.
- `remote-canonical-publish`: Commits published content into the canonical repository through the control plane.

### Modified Capabilities
- None.

## Impact

- Affects the separate admin app, Cloudflare Access integration, GitHub API usage, and operational state management in D1.
- Depends on the content pipeline and public site conventions established in earlier slices.

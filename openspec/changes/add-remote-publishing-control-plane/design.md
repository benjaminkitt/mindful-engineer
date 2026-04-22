## Context

The project requires a practical remote publishing path for notes and links, with article editing remaining primarily laptop-first. The planning docs lock in a separate protected admin/control-plane app, Cloudflare Access for MVP protection, D1 for operational state only, and direct canonical publishing into the repository via GitHub API.

This slice should create a real editorial control plane that supports remote capture and canonical publish while staying distinct from the public reading surface.

Relevant planning references:
- `docs/mindful-engineer/01-architecture.md`
- `docs/mindful-engineer/02-publishing-workflow.md`
- `docs/mindful-engineer/03-content-model.md`

## Goals / Non-Goals

**Goals:**
- Create the separate protected admin/control-plane app.
- Protect the control plane with Cloudflare Access for MVP.
- Support mobile-friendly note and link creation flows.
- Support draft, preview, and canonical publish workflows.
- Commit canonical published content into the repository through GitHub API.
- Use D1 for workflow and operational metadata only.

**Non-Goals:**
- Implement outbound reviewed syndication.
- Implement LLM-assisted workflow.
- Replace laptop-first local authoring for long-form article development.
- Build a full generalized CMS.

## Decisions

### 1. Admin is a separate app
- **Decision:** Build the control plane as a separate application from the public site.
- **Rationale:** This is a locked planning decision and keeps public reading concerns separate from editorial operations.
- **Alternatives considered:**
  - Combine admin into the public app: simpler initial routing, but introduces coupling and increases public-surface complexity.

### 2. Cloudflare Access protects MVP editorial workflows
- **Decision:** Use Cloudflare Access for authentication and route protection in MVP.
- **Rationale:** Avoids prematurely building a custom auth system.
- **Alternatives considered:**
  - Bespoke auth: unnecessary for MVP.
  - Network-only access through Tailscale/SSH alone: viable fallback, but weaker as the main product path.

### 3. Canonical publish commits directly into the repository
- **Decision:** Remote-created or remotely-published canonical content is written into the repository via GitHub API.
- **Rationale:** Preserves the single source of truth and aligns remote publishing with the same canonical file model used by laptop authoring.
- **Alternatives considered:**
  - Store canonical content in D1 first: creates a second source of truth.
  - Manual copy/export from admin into repo: too much friction.

### 4. D1 stores only operational workflow state
- **Decision:** Use D1 for draft workflow state, preview bookkeeping, publish events, and later syndication status, but not as the canonical content store.
- **Rationale:** Matches the architecture plan and keeps content ownership boundaries clear.
- **Alternatives considered:**
  - No D1 usage at all: possible, but less helpful for editorial workflow coordination.

## Risks / Trade-offs

- **[Risk] GitHub API publishing introduces repository-side operational complexity** → Mitigation: keep a narrow publishing path with explicit content generation and commit semantics.
- **[Risk] Remote UI becomes too CMS-like** → Mitigation: constrain MVP to note/link capture plus lightweight draft/review/publish flows.
- **[Risk] Access setup friction slows use from new devices** → Mitigation: document the Access-based entry path clearly and keep the UI minimal once inside.
- **[Risk] Draft state and canonical content diverge** → Mitigation: maintain explicit state transitions and treat repository commit as the authoritative publish boundary.

## Migration Plan

1. Create the separate admin/control-plane app.
2. Protect it with Cloudflare Access.
3. Build note and link creation flows plus draft/publish workflow state.
4. Implement canonical publish into the repository via GitHub API.
5. Connect the resulting repository content to the existing public site/content pipeline.

## Open Questions

- Should article editing in MVP allow only metadata/status operations remotely, or limited body editing as well?
- Should draft content that has not yet been committed to the repository be recoverable across devices in MVP, or should draft support remain intentionally lightweight?

## Context

The planning docs lock in repo-managed MDX as the canonical content source, fully static feeds for MVP, and the MVP entry types of article, note, link, snippet, and page. The public site needs a real content pipeline so it can render durable content rather than hard-coded fixtures, and later slices depend on canonical content being stable and validated.

This slice should make the public site truly content-driven while preserving a clean boundary between canonical content and operational metadata.

Relevant planning references:
- `docs/mindful-engineer/01-architecture.md`
- `docs/mindful-engineer/02-publishing-workflow.md`
- `docs/mindful-engineer/03-content-model.md`

## Goals / Non-Goals

**Goals:**
- Load canonical MDX content from the repository.
- Validate frontmatter and content shape for all MVP entry types.
- Provide data plumbing for listings, detail pages, and archive generation.
- Generate fully static feeds from canonical published content.
- Support link-title inference/fetch when title is absent.

**Non-Goals:**
- Build the protected admin/control-plane app.
- Build outbound reviewed syndication.
- Introduce LLM-assisted metadata workflows.
- Add dynamic feed generation.

## Decisions

### 1. Canonical source remains repo-managed MDX
- **Decision:** Load canonical content from repository-managed MDX files rather than a database.
- **Rationale:** Matches the locked planning decisions and preserves portability, version history, and laptop-first authorship.
- **Alternatives considered:**
  - Database-backed canonical content: more dynamic, but conflicts with the project’s durability goals.

### 2. Validate content by entry type
- **Decision:** Introduce type-aware validation for article, note, link, snippet, and page metadata.
- **Rationale:** The content model differs by type, and validation keeps canonical content trustworthy.
- **Alternatives considered:**
  - Minimal/no validation: easier initially, but more likely to create content drift and broken feeds/pages.

### 3. Generate feeds statically
- **Decision:** Build feeds as static artifacts during the site build.
- **Rationale:** This is explicitly locked for MVP, aligns with the static-site architecture, and avoids unnecessary runtime complexity.
- **Alternatives considered:**
  - Worker-generated feeds: not necessary for MVP and adds moving parts without clear benefit.

### 4. Link-title inference is part of the content pipeline
- **Decision:** Support inference/fetch of link titles when they are not explicitly authored.
- **Rationale:** This was clarified in planning feedback and improves the usability of link publishing.
- **Alternatives considered:**
  - Require every link title manually: simpler, but less aligned with the desired publishing workflow.

## Risks / Trade-offs

- **[Risk] MDX conventions become inconsistent across entry types** → Mitigation: define validation rules and directory conventions clearly.
- **[Risk] Link-title fetching introduces brittleness** → Mitigation: treat fetched titles as best-effort and allow manual override.
- **[Risk] Feed outputs drift from the visible site content** → Mitigation: generate feeds from the same canonical content layer used by the public pages.
- **[Risk] Archive generation becomes coupled to temporary route decisions** → Mitigation: use the route and content model from the planning docs as the stable reference.

## Migration Plan

1. Define the canonical content-loading and validation layer.
2. Integrate it with the public site templates.
3. Generate archive/listing outputs from validated content.
4. Generate static feeds from the same canonical content source.
5. Replace any temporary public fixtures with canonical content-backed rendering.

## Open Questions

- Should snippets have their own feed in MVP, or are they sufficiently covered by the main feed and archive?
- Should failed link-title fetches surface as build warnings, authoring warnings, or both?

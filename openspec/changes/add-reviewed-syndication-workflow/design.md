## Context

The project’s POSSE strategy centers canonical publication on mindful.engineer and treats syndication as a deliberate review step rather than instant broadcast. The planning docs identify Mastodon and Bluesky as first-class reviewed integrations for MVP, LinkedIn and X as assisted/manual targets, and Substack as a later selective downstream publication path.

This slice should add reviewed syndication after canonical publishing exists, without making external posting success part of the canonical publishing contract.

Relevant planning references:
- `docs/mindful-engineer/02-publishing-workflow.md`
- `docs/mindful-engineer/04-posse-strategy.md`
- `docs/mindful-engineer/03-content-model.md`

## Goals / Non-Goals

**Goals:**
- Prepare outbound variants after canonical publish.
- Support review and approval before sending.
- Implement first-class reviewed integrations for Mastodon and Bluesky.
- Provide assisted/manual outputs for LinkedIn and X.
- Record syndication state and result URLs in operational storage.
- Reflect successful outward destinations back on canonical posts.

**Non-Goals:**
- Block canonical publication on syndication outcomes.
- Implement Substack automation.
- Add backfeed, webmention aggregation, or advanced social analytics.
- Add LLM-assisted syndication drafting in MVP.

## Decisions

### 1. Syndication is downstream from canonical publish
- **Decision:** Syndication begins only after canonical publication exists on mindful.engineer.
- **Rationale:** This is core to the POSSE strategy and keeps canonical ownership clear.
- **Alternatives considered:**
  - Cross-post first or in parallel: conflicts with the project’s publishing doctrine.

### 2. Reviewed integrations are limited in MVP
- **Decision:** Mastodon and Bluesky get first-class reviewed integrations; LinkedIn and X get assisted/manual reviewed outputs.
- **Rationale:** Matches the planning docs and respects platform/API realities.
- **Alternatives considered:**
  - Full integration for every platform: too fragile and too large for MVP.

### 3. Operational syndication state lives outside canonical content
- **Decision:** Store prepared variants, approval states, posting results, and failures in D1-backed operational state.
- **Rationale:** Preserves clean canonical content and keeps platform volatility in the operational layer.
- **Alternatives considered:**
  - Store syndication outcomes in content files: mixes durable content with volatile operational data.

### 4. Canonical post pages reflect outward destinations
- **Decision:** Successful outward posts are surfaced back on the canonical post through an “Elsewhere” pattern.
- **Rationale:** Reinforces canonical ownership and completes the POSSE loop.
- **Alternatives considered:**
  - Keep outward destinations visible only in admin: weaker reader-facing ownership signal.

## Risks / Trade-offs

- **[Risk] Platform APIs fail or drift** → Mitigation: keep canonical publish independent and treat integrations as adapters with reviewable failure states.
- **[Risk] Review workflow becomes too cumbersome** → Mitigation: keep previews text-first and use reusable defaults where possible.
- **[Risk] LinkedIn/X manual assistance feels second-class** → Mitigation: make reviewed output clear and copy-ready even when direct integration is absent.
- **[Risk] Elsewhere links create template coupling** → Mitigation: integrate the pattern at the canonical post metadata layer rather than hand-coding per page.

## Migration Plan

1. Extend the control plane with post-publish review surfaces.
2. Add operational state for prepared variants, approvals, and results.
3. Implement Mastodon and Bluesky reviewed posting adapters.
4. Implement LinkedIn and X assisted/manual reviewed outputs.
5. Surface successful outward destinations back on canonical post pages.

## Open Questions

- Should reviewed syndication be available for every MVP content type immediately, or should some types ship with narrower target support first?
- Should manual LinkedIn/X actions support explicit “mark as posted elsewhere” tracking in MVP, or only generated copy output?

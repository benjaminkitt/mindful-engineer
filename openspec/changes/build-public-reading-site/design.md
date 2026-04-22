## Context

The public site is the first production reading surface for mindful.engineer. The planning docs lock in Astro as the recommended static framework, Cloudflare Pages as the hosting target, and a monastery-first public experience as the dominant visual identity.

This slice should produce a working public site shell that can render real routes and representative content end to end, while remaining separate from the admin/control-plane app. It depends on the design-system foundation for visual guidance but can still be built incrementally.

Relevant planning references:
- `docs/mindful-engineer/README.md`
- `docs/mindful-engineer/01-architecture.md`
- `docs/mindful-engineer/05-visual-language.md`

## Goals / Non-Goals

**Goals:**
- Create the separate Astro public app.
- Implement the MVP public route structure and page shell.
- Apply the monastery-first design system to real public pages.
- Provide end-to-end public navigation across home, content indexes, content detail templates, archive, and static pages.
- Make the site deployable to Cloudflare Pages.

**Non-Goals:**
- Implement the full canonical content pipeline and feed generation.
- Implement the protected admin/control-plane app.
- Implement reviewed syndication.
- Finalize advanced article-specific interactives.

## Decisions

### 1. Build the public site as a separate Astro app
- **Decision:** Create the public reading surface as its own Astro app rather than combining it with admin functionality.
- **Rationale:** This matches the locked planning decision that public and admin/control plane should be separate apps and keeps the reading surface static-first.
- **Alternatives considered:**
  - Single monolithic app: more coupling and more risk of admin concerns leaking into the public surface.

### 2. Implement the route skeleton before full content automation
- **Decision:** Build the site shell and page templates now, even if early representative content is bootstrapped in simpler ways before the full content pipeline slice lands.
- **Rationale:** This creates a usable end-to-end public artifact early and gives the content-pipeline slice a concrete rendering target.
- **Alternatives considered:**
  - Wait for the full content pipeline first: delays visible progress on the public experience.

### 3. Monastery-first is the default production rendering mode
- **Decision:** The public site defaults to monastery styling. Graph and enso, if present at all in this slice, remain accents or deferred enhancements.
- **Rationale:** Matches the planning docs and avoids ambiguous implementation.
- **Alternatives considered:**
  - Equal theme switching in the first public implementation: adds complexity and weakens the core identity.

### 4. Support all MVP public page categories in the route structure
- **Decision:** Include routes for home, articles, notes, links, snippets, archive, about, and now in this slice.
- **Rationale:** This matches the planned information architecture and gives the public site a complete shape even before all workflows are implemented.
- **Alternatives considered:**
  - Launch with only a subset of routes: smaller, but leaves too much ambiguity for later slices.

## Risks / Trade-offs

- **[Risk] Public-site implementation outruns the design system** → Mitigation: treat the design-system slice as the visual contract and avoid inventing parallel patterns.
- **[Risk] Representative content scaffolding creates throwaway work** → Mitigation: keep page templates and data interfaces aligned with the planned content model so the later content-pipeline slice can slot in cleanly.
- **[Risk] Astro route structure gets shaped by temporary fixtures** → Mitigation: base routes and templates on the locked planning docs rather than ad hoc sample needs.
- **[Risk] Monastery-first gets diluted during implementation** → Mitigation: explicitly prioritize monastery tokens and component usage in all public templates.

## Migration Plan

1. Create the separate Astro public app.
2. Implement the shared public site shell, navigation, and page layout primitives.
3. Add the MVP route structure and page templates.
4. Populate templates with representative content compatible with the later content model.
5. Deploy the public app to Cloudflare Pages.
6. Hand off content sourcing to the content-pipeline slice without changing public route semantics.

## Open Questions

- Should snippets have their own top-level index route in MVP or appear only through archive and direct detail pages?
- Should any accent treatment from graph/enso appear in this slice, or should all accent behavior wait until after the first public site implementation is stable?

## Context

The existing prototype already contains the visual DNA of mindful.engineer: monastery as the primary mode, graph and enso as supporting accents, strong typographic contrast, geometric motifs, and a reading-first editorial feel. However, the prototype is still an exploratory artifact rather than a reusable system.

The planning docs define `monastery-first` as the default design doctrine for the project and make this slice the first implementation proposal. Future frontend work depends on a stable visual contract, not just screenshots or ad hoc reinterpretation.

Relevant planning references:
- `docs/mindful-engineer/README.md`
- `docs/mindful-engineer/01-architecture.md`
- `docs/mindful-engineer/05-visual-language.md`

## Goals / Non-Goals

**Goals:**
- Translate the prototype into a reusable design system using Pencil as the primary design tool.
- Define monastery-first tokens for typography, color, spacing, rules, and motif usage.
- Define reusable component patterns for the MVP public site and later admin work.
- Produce reference layouts for the core public pages so implementation can proceed with less ambiguity.
- Establish graph and enso as secondary accent systems without making them co-equal identities.

**Non-Goals:**
- Implement the production frontend.
- Build the content pipeline or publishing workflows.
- Finalize every future interactive visual pattern.
- Create a polished admin design system beyond what is needed for eventual implementation consistency.

## Decisions

### 1. Pencil is the design-system source of truth for this slice
- **Decision:** Use Pencil to create the reusable design system artifacts and reference layouts.
- **Rationale:** The user explicitly wants the first proposal to build the design system with Pencil MCP. Pencil is the right place to capture the visual language before code implementation starts.
- **Alternatives considered:**
  - Derive the design system directly in code from the prototype: faster initially, but too easy to drift from the prototype and planning intent.
  - Keep only written guidance without design assets: insufficiently concrete for later agents.

### 2. Monastery is the default system; graph and enso are accents
- **Decision:** The design system will formalize monastery as the default theme and treat graph/enso as accent vocabularies.
- **Rationale:** This matches the planning docs and the user’s clarification.
- **Alternatives considered:**
  - Preserve all three themes as equal top-level variants: too ambiguous for implementation and weakens identity.

### 3. Design system output should include both tokens and page-level references
- **Decision:** Produce both atomic definitions and composed reference layouts.
- **Rationale:** Tokens alone do not resolve how the public site should feel. Page-level references make later implementation more trustworthy.
- **Alternatives considered:**
  - Tokens only: too abstract.
  - Full page mocks only: less reusable and harder to systematize.

### 4. Public reading patterns come first
- **Decision:** Prioritize components needed by the public site MVP: navigation, page shell, article header, metadata row, archive rows, note/link/snippet rows, figure, aside, pull quote, footer.
- **Rationale:** This creates the minimum viable system that still drives the public site slice end to end.
- **Alternatives considered:**
  - Broader component inventory including rich admin patterns: premature.

## Risks / Trade-offs

- **[Risk] Prototype translation becomes too literal** → Mitigation: preserve the visual spirit, but formalize reusable primitives rather than copying every prototype quirk.
- **[Risk] Monastery remains too loosely defined** → Mitigation: encode it as explicit tokens, motifs, component rules, and reference layouts.
- **[Risk] Design system grows too broad before implementation starts** → Mitigation: constrain outputs to MVP public reading patterns plus a small set of shared primitives.
- **[Risk] Pencil artifacts diverge from implementation needs** → Mitigation: include explicit component names, states, and usage notes that align with planned Astro implementation.

## Migration Plan

1. Analyze the existing prototype and extract the recurring visual primitives.
2. Create design-system primitives and components in Pencil.
3. Create reference layouts for key MVP public pages.
4. Document handoff expectations so the public-site slice can implement against the resulting system.
5. Treat the completed Pencil design system as the visual contract for subsequent frontend changes.

## Open Questions

- Should the admin app eventually share all public tokens, or only typography/color primitives plus a smaller UI subset?
- Which specific page references should be treated as mandatory for MVP handoff beyond home, article detail, archive, and note/link streams?

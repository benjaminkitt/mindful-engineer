# Mindful Engineer Planning Docs

This folder captures exploration artifacts for the Mindful Engineer website before implementation.

These documents are intentionally planning-oriented. They describe architecture, workflows, content modeling, POSSE strategy, and visual direction for review and iteration.

## Documents

- [01-architecture.md](./01-architecture.md) — Cloudflare-native system architecture for the site and publishing platform
- [02-publishing-workflow.md](./02-publishing-workflow.md) — authoring, review, preview, publish, and syndication workflows
- [03-content-model.md](./03-content-model.md) — content types, MDX conventions, metadata, feeds, and visual blocks
- [04-posse-strategy.md](./04-posse-strategy.md) — platform-by-platform syndication model and operational guidance
- [05-visual-language.md](./05-visual-language.md) — design principles, monastery-first visual system, and Tufte-aligned expression

## Planning stance

This is a monastery-first publishing home.

### What “monastery-first” means in practice

For future agents and future implementation work, `monastery-first` is the primary design doctrine for the project, not a vague mood label.

It means:
- the default public experience should feel like a hybrid of codex, engineering notebook, reflective study, and instrument table
- serif body typography and mono structural typography are the default voice
- warm paper-like substrate, deep ink, and structural linework should dominate over flat app-like UI styling
- ornament should emerge from geometry, annotation, measurement, marginalia, and explanatory figures rather than generic illustration or decorative chrome
- reading comfort is more important than novelty
- graph and enso are supporting accents or lenses, not co-equal site identities
- every visual decision should reinforce the sense that this is a calm, crafted, durable publishing home

Additional planning assumptions:
- canonical content lives on `mindful.engineer`
- public site is durable, fast, and static-first
- publishing is deliberate rather than maximally automated
- notes/links should be easy to publish remotely
- long-form authoring is laptop-first
- LLMs are not part of the MVP workflow and will never author the site’s prose; in later phases they may assist with structure, metadata, syndication drafts, and custom element development
- interactive visuals are supported, but selectively and intentionally

## Review sequence

Recommended review order:

1. Architecture
2. Publishing workflow
3. Content model
4. POSSE strategy
5. Visual language

## Locked planning decisions

The following planning decisions are now treated as locked unless a later explicit revision changes them:

- use a static-site stack with MDX support
- use Cloudflare Pages for the public site
- use Cloudflare Workers, Queues, D1, R2, and Access for operational services
- use a protected lightweight publishing control plane for remote capture and syndication review
- keep the public site and admin/control plane as separate apps
- keep canonical content in repo-managed files
- use fully static feeds for MVP
- include `snippet` as an MVP content type

These are still planning artifacts, but these baseline decisions should now be treated as settled for MVP proposal work.

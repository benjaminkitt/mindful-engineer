# Mindful Engineer Architecture

## Goal

Design a Cloudflare-native architecture for `mindful.engineer` that supports:

- a canonical personal publishing home
- durable, static-first public pages
- lightweight but capable remote publishing
- deliberate POSSE workflows
- room for article-specific visuals and interactive elements
- long-term maintainability and portability

## Summary recommendation

Build the site as a **static public reading surface** with a **lightweight protected publishing control plane**.

Use Cloudflare services for operational concerns, but keep canonical content in portable source files.

### Core split

```text
┌────────────────────────────────────────────────────────────┐
│ Public site                                                │
│ - statically generated pages                               │
│ - fast, durable, portable                                  │
│ - optimized for reading                                    │
└───────────────┬────────────────────────────────────────────┘
                │ reads published content artifacts
                ▼
┌────────────────────────────────────────────────────────────┐
│ Canonical content source                                   │
│ - MDX entries                                               │
│ - metadata frontmatter                                      │
│ - visual blocks / article assets                            │
│ - portable, repo-friendly                                   │
└───────────────┬────────────────────────────────────────────┘
                │ publish events / generated metadata
                ▼
┌────────────────────────────────────────────────────────────┐
│ Publishing control plane                                    │
│ - protected capture UI                                      │
│ - draft / preview / publish                                 │
│ - syndication review queue                                  │
└───────────────┬────────────────────────────────────────────┘
                │ jobs
                ▼
┌────────────────────────────────────────────────────────────┐
│ Syndication + ops services                                  │
│ - platform rendering                                         │
│ - queue/retry                                                │
│ - status tracking                                            │
│ - logs and outbound links                                    │
└────────────────────────────────────────────────────────────┘
```

## Architectural principles

1. **Own the source**
   - Content should be portable outside Cloudflare.
   - Cloudflare services should support operations, not imprison the archive.

2. **Static where possible, dynamic where useful**
   - Reading surfaces should be static-first.
   - Operational features can be dynamic.

3. **Separate content from operational state**
   - Content source and renderable artifacts remain durable.
   - Publish logs, tokens, queues, and syndication results live separately.

4. **Deliberate publishing over fire-and-forget automation**
   - Compose and review are first-class.
   - Syndication should be easy, not automatic by default.

5. **Monastery-first design**
   - The primary public experience should center the monastery aesthetic.
   - Monastery-first means codex + engineering notebook + reflective study + instrument table as the dominant design language.
   - Serif body, mono structural text, warm substrate, deep ink, and structural ornament are defaults.
   - Graph and enso may appear as accents or lenses, not as co-equal site identities.

## Recommended platform shape

### Public tier

**Cloudflare Pages**

Use Pages for the public website.

Responsibilities:
- host generated HTML/CSS/JS assets
- serve article, note, link, and archive pages
- serve feed endpoints if generated statically
- serve visual assets and lightweight interactive bundles

Why this fits:
- fast global delivery
- excellent static hosting model
- simple deployment
- clean separation from admin/ops concerns

### Application/ops tier

**Cloudflare Workers**

Use Workers for dynamic operations such as:
- protected publishing endpoints
- preview generation helpers
- syndication dispatch orchestration
- webhook handling
- metadata endpoints if dynamic generation becomes useful later
- URL shortening/permalink helpers if desired later

### Data tier

**Git repository for canonical content**

Canonical source should live in repo-managed files:
- MDX documents
- frontmatter metadata
- article-local assets and diagrams where appropriate
- site configuration

This ensures:
- portability
- version history
- straightforward local authoring
- compatibility with future stack changes

**Cloudflare D1 for operational metadata**

Use D1 for state that is operational rather than canonical:
- remote capture session state and publish job bookkeeping
- syndication jobs and statuses
- platform account configuration references
- publish events
- preview tokens
- outbound syndicated URLs
- audit/log summaries

For MVP, remote-created canonical content should be committed directly into the content repository rather than permanently living in D1. D1 exists to support operational flow around that process, not to become a second source of truth.

**Cloudflare R2 for media/object assets**

Use R2 for:
- uploaded images from mobile capture
- generated social card assets if needed
- article companions with heavier assets
- cached rendered assets where useful

R2 is especially useful because remote publishing from phone tends to require upload-friendly handling.

**Cloudflare Queues for syndication work**

Use Queues for:
- outbound platform posting
- retries with backoff
- non-blocking publish flows
- platform-specific rendering and dispatch

**Cloudflare Access for admin protection**

Use Access to protect admin and control-plane routes in MVP.

This avoids prematurely building a bespoke auth system.

## Proposed high-level system diagram

```text
                     ┌──────────────────────────┐
                     │   Author on laptop       │
                     │   local repo / editor    │
                     └────────────┬─────────────┘
                                  │
                                  │ commit/push
                                  ▼
                     ┌──────────────────────────┐
                     │   Canonical content repo │
                     │   MDX + config + assets  │
                     └────────────┬─────────────┘
                                  │ build/deploy
                                  ▼
                     ┌──────────────────────────┐
                     │   Cloudflare Pages       │
                     │   public site            │
                     └────────────┬─────────────┘
                                  │
             ┌────────────────────┴────────────────────┐
             │                                         │
             ▼                                         ▼
┌──────────────────────────┐              ┌──────────────────────────┐
│ Remote capture UI        │              │ Public readers           │
│ via Access-protected     │              │ articles / notes / feeds │
│ Worker routes            │              └──────────────────────────┘
└────────────┬─────────────┘
             │ creates/edits drafts, requests syndication
             ▼
┌──────────────────────────┐
│ Worker control plane     │
│ preview/publish/schedule │
└────────────┬─────────────┘
             │
   ┌─────────┴─────────┐
   ▼                   ▼
┌──────────────┐   ┌──────────────┐
│ D1           │   │ R2           │
│ ops state    │   │ media/assets │
└──────┬───────┘   └──────┬───────┘
       │                  │
       └─────────┬────────┘
                 ▼
         ┌──────────────┐
         │ Queues       │
         │ syndication  │
         └──────┬───────┘
                ▼
      ┌──────────────────────────────┐
      │ Mastodon / Bluesky / others  │
      │ plus assisted posting flows  │
      └──────────────────────────────┘
```

## Content and operational boundaries

### Canonical, portable, durable

Keep these outside the operations database when possible:
- article/note/link/snippet source content
- frontmatter metadata
- slugs and canonical paths
- public page structure
- reusable visual components
- feed definitions and rendering logic
- design tokens/theme definitions

### Operational, mutable, external-integration-heavy

Store/manage these in Cloudflare operational services:
- syndication queue state
- posting attempt history
- retry counters and errors
- access tokens and integration configuration
- mobile capture drafts awaiting conversion into source content
- preview sessions and expiring publish links
- outbound syndicated URLs

This boundary protects long-term ownership.

## Public site generation model

### Static-first rendering

The public site should be generated ahead of time from MDX and site metadata.

Rendered outputs include:
- home page
- article detail pages
- notes stream
- links stream
- archive pages
- about/now/colophon/principles pages as needed
- RSS/Atom/JSON feed artifacts
- tag pages if introduced later

### Selective hydration for visual features

Interactive features should be added sparingly and intentionally.

Use client-side JS only where it does one of the following:
- meaningfully explains an idea
- improves navigation or reading orientation
- supports a small article companion
- offers optional theme or lens switching

This protects performance and keeps the core reading experience robust.

## Publishing control plane

### MVP role

The control plane is not a full CMS. It is a lightweight editorial console.

Primary responsibilities:
- create a note or link from any device
- save drafts
- preview content
- publish content to the canonical site
- prepare reviewed syndication variants
- send syndicated posts intentionally
- show status/results/errors

### Suggested route shape

```text
/admin
/admin/new
/admin/drafts
/admin/review
/admin/syndication
/admin/settings
```

The authoring surface can begin small and still be useful.

## Remote publishing model

Your stated needs imply two distinct authoring channels.

### Channel 1: laptop-first long-form

Best for:
- article drafting
- structural revision
- visual composition
- MDX editing directly

Likely workflow:
- local editor
- local preview for quick iteration
- commit/push
- Cloudflare preview deployments for PR/ephemeral review when away from the laptop

### Channel 2: browser/mobile quick capture

Best for:
- notes
- links
- short updates
- optional article edits in a pinch

Likely workflow:
- Access-protected mobile form
- publish or save draft through the control plane
- commit canonical content into the repo via GitHub API
- optionally trigger syndication review

This split matches your real publishing rhythms.

## Suggested deployment topology

### Repository structure (conceptual)

```text
/apps
  /site            public frontend
  /admin           protected publishing/control plane
/packages
  /content         schemas, parsing, feed generation, rendering helpers
  /syndication     platform adapters and formatter logic
  /design-system   monastery-first theme tokens and components
/content
  /articles
  /notes
  /links
  /snippets
  /pages
/public
  /images
  /icons
/docs
  /mindful-engineer
/openspec
  /changes
  /specs
```

This is one possible organization, not a mandate. The important point is modularity.

## Suggested Cloudflare service mapping

| Concern | Suggested service |
|---|---|
| Public frontend | Pages |
| Dynamic admin endpoints | Workers |
| Protected access | Access |
| Operational metadata | D1 |
| Media/object storage | R2 |
| Async syndication jobs | Queues |
| Scheduled retries / digests | Cron Triggers |
| Forms/anti-bot if needed | Turnstile |

## Build and publish events

### Public publish event

```text
content finalized
    ↓
validate frontmatter + MDX
    ↓
build public pages and feeds
    ↓
deploy to Pages
    ↓
mark publish event in D1
    ↓
prepare syndication review items
```

### Syndication event

```text
author reviews platform variants
    ↓
author selects targets and confirms
    ↓
Worker enqueues jobs
    ↓
platform adapters post outward
    ↓
results stored in D1
    ↓
canonical post displays “elsewhere” links
```

## Why not make D1 the canonical content store?

Because your goals emphasize:
- longevity
- portability
- authorship ownership
- long-form laptop editing
- static public generation

A DB-first authoring model is attractive for mobile convenience, but it tends to pull the whole system toward CMS complexity.

A better compromise is:
- canonical content in files
- quick mobile drafts may temporarily live in D1 until normalized into the content source

That gives convenience without surrendering durability.

## Risks and tensions

### 1. Dual authoring surfaces can drift

If laptop editing and mobile capture write into different shapes, inconsistencies appear.

Mitigation:
- one shared content schema
- explicit normalization step for mobile-created content
- clear distinction between draft and canonical publish

### 2. Platform APIs are unstable

Some POSSE targets are fragile or restricted.

Mitigation:
- treat syndication as adapters with clear degradation behavior
- do not entangle public publishing with syndication success

### 3. Interactive visuals can bloat the site

Mitigation:
- client JS only when explanatory value is real
- default to SVG and simple progressive enhancement
- reserve heavier interactivity for special cases

### 4. Admin auth can become a rabbit hole

Mitigation:
- use Cloudflare Access in MVP
- delay bespoke auth until there is a real need

## Locked architecture decisions

The following architecture decisions are now treated as settled for MVP planning:
- use a static-site stack with MDX support
- use a separate protected admin/control-plane app rather than folding admin into the public site app
- commit mobile-created canonical content directly into the repository, likely via the GitHub API
- use fully static feeds for MVP
- include `snippet` as an MVP content type

### Recommendation on static framework / MDX toolchain

Current recommendation: use **Astro** for the public site and MDX rendering.

Why Astro is the leading recommendation:
- excellent content-oriented static generation model
- strong MDX support
- very good fit for mostly-static pages with selective hydration
- keeps article pages lightweight by default
- supports occasional interactive islands without making the whole site app-heavy
- aligns well with the monastery-first reading experience

Admin can remain a separate protected app, likely also deployable on Cloudflare, but it should not determine the architecture of the public reading surface.

## Current recommendation

For MVP, optimize around the following:

1. monastery-first public site on Pages
2. canonical MDX content in repo
3. protected lightweight control plane via Workers + Access
4. D1 only for operational state and publish/syndication bookkeeping, not canonical content storage
5. R2 for upload-friendly media
6. Queues for deliberate syndication workflow
7. fully static feeds generated alongside the public site
8. separate protected admin/control-plane app

This is the smallest architecture that still respects the actual ambition of the site.

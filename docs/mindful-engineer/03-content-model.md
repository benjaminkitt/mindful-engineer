# Mindful Engineer Content Model

## Goal

Define a content model that is:

- simple enough for an MVP
- expressive enough for rich essays
- portable and file-friendly
- compatible with MDX
- aligned with POSSE and feed generation

## Summary recommendation

Start with **MDX as the canonical authoring format** for long-form and page content.

Use a small, explicit set of entry types:
- article
- note
- link
- snippet
- page

Keep the model unified enough that shared behaviors are easy:
- canonical URLs
- feeds
- archive handling
- syndication preparation
- public metadata

### About snippets

Your prototype includes `snippet` as a type, and snippet should be included in MVP.

Purpose:
- short technical fragments
- code-focused notes that are smaller than articles
- durable canonical references for reusable ideas and examples

Snippet should share the same overall entry spine as other content types while allowing code-forward presentation.

## Core content model

Think of all published things as entries with a shared spine.

```text
Entry
├── id
├── type
├── slug
├── status
├── title?
├── body
├── summary?
├── created_at
├── published_at?
├── updated_at?
├── tags[]
├── canonical_url
├── social metadata
├── syndication preferences
└── visual blocks / media refs
```

## Entry types

## 1. Article

Purpose:
- longer-form writing
- carefully structured arguments
- may include figures, code, side notes, or article-specific interactives

Characteristics:
- usually titled
- often has summary/excerpt
- likely tagged
- appears in article listings and feeds
- laptop-authored most of the time

### Article fields

Required:
- `type: article`
- `title`
- `slug`
- `publishedAt`
- `summary`

Recommended:
- `tags`
- `subtitle`
- `heroVariant` or visual hint if useful later
- `syndication`

## 2. Note

Purpose:
- short-form observations
- fragments worth keeping as permanent URLs
- often created from mobile

Characteristics:
- title optional, usually absent
- body is primary
- tags optional
- should publish with minimal ceremony

### Note fields

Required:
- `type: note`
- `publishedAt`

Recommended:
- `tags`
- `syndication`

## 3. Link

Purpose:
- a link to something elsewhere with your commentary
- a canonical record of what you found meaningful

Characteristics:
- URL required
- commentary/body strongly recommended
- title may be manually entered, but if omitted it should be fetched from the target page when possible
- source domain useful

### Link fields

Required:
- `type: link`
- `url`
- `publishedAt`

Recommended:
- `title`
- `source`
- `commentary` or body
- `tags`
- `syndication`

## 4. Snippet

Purpose:
- compact code-centered entries
- technical fragments worth keeping as canonical URLs
- somewhere between a note and an article in weight

Characteristics:
- usually titled
- code is central to the entry
- explanatory prose may be short
- can appear in archive and feeds

### Snippet fields

Required:
- `type: snippet`
- `title`
- `publishedAt`
- `language`

Recommended:
- `summary`
- `tags`
- `syndication`

## 5. Page

Purpose:
- durable non-stream pages such as:
  - about
  - now
  - colophon
  - principles
  - uses

Characteristics:
- not normally syndicated
- not usually part of chronological archive stream

## Shared metadata shape

A frontmatter spine like this would cover most needs conceptually:

```yaml
id: fast-and-present
slug: /articles/fast-and-present
type: article
status: published

title: Fast and Present Are Not Opposites
subtitle: On shipping quickly without leaving anyone behind.
summary: Mindful engineering is not slow engineering. It is fast engineering done with both eyes open.

author: Benjamin Kitt
publishedAt: 2026-04-12T09:00:00Z
updatedAt: 2026-04-12T09:00:00Z

tags:
  - practice
  - teams

syndication:
  defaults:
    mastodon: true
    bluesky: true
    linkedin: false
    x: false
    substack: false

seo:
  description: Mindful engineering is not slow engineering. It is fast engineering done with both eyes open.

social:
  image: /images/social/fast-and-present.png
```

That exact schema is not the point; the shape is.

## Directory model

A file organization that matches your editorial intent could look like:

```text
/content
  /articles
    /2026
      fast-and-present.mdx
  /notes
    /2026
      2026-04-15-note-compile.mdx
  /links
    /2026
      2026-04-10-link-craft.mdx
  /snippets
    /2026
      retry-with-jitter-honestly.mdx
  /pages
    about.mdx
    now.mdx
    colophon.mdx
```

Benefits:
- durable and legible
- easy to review in git
- easy to export or migrate
- natural chronological organization for short-form

## MDX guidance

MDX is a good fit because it supports both:
- simple writing in Markdown-like form
- selective richer components where needed

### Good uses of MDX here

- article prose
- pull quotes
- side notes
- figures
- comparison blocks
- simple diagrams via components
- code blocks
- embedded footnotes or references

### Things to avoid early

- turning every article into a custom component jungle
- hard-coding visual hacks into content files without conventions
- allowing arbitrary JS-heavy embedding everywhere

The content model should remain editorially legible.

## Recommended content conventions

### Article body blocks

Start with a modest grammar built primarily on standard Markdown rendering:
- headings
- paragraphs
- lists
- block quotes / pull quotes
- code fences
- images
- links
- footnotes if supported by the renderer

Use the Markdown renderer for the default grammar rather than inventing custom components for ordinary prose structures.
Reserve custom MDX components for cases where richer explanatory or visual behavior is actually needed, such as figures, annotation blocks, comparisons, timelines, and diagrams.

This is enough to express Tufte-like structure without building a bespoke block editor.

### Visual blocks

Because interactivity is not a core MVP requirement, treat visual richness as an enhancement rather than a separate type system.

For MVP, define a small set of reusable MDX components such as:
- `Figure`
- `AnnotatedFigure`
- `Aside`
- `PullQuote`
- `Comparison`
- `Timeline`
- `Diagram`

These can begin conceptually; the important part is that the content model expects them.

## Slugs and URLs

Canonical URLs matter strongly for POSSE.

### Suggested route model

```text
/                     home
/articles             article index
/articles/:slug       article detail
/notes                notes stream
/notes/:slug          note detail
/links                links stream
/links/:slug          link detail
/archive              full archive
/about                about
/now                  now
/feed.xml             RSS/Atom as chosen
/feed.json            JSON Feed if desired
```

This route model is clear and durable.

### Slug strategy

Articles:
- human-readable slug from title
- intended to be stable long-term

Notes/links:
- either slugged by date + short token, or derived slug if meaningful
- avoid requiring a title for notes

Examples:
- `/articles/fast-and-present-are-not-opposites`
- `/notes/2026/04/15/speed-without-presence`
- `/links/2026/04/10/worse-is-better-twenty-five-years-on`

A date-based short-form path can be elegant and archival.

## Feed model

Feeds should be treated as first-class outputs.

### Recommended feeds for MVP

- main feed: all public stream content except static pages
- articles feed
- notes+links feed (optional but useful)

Potential endpoints:
- `/feed.xml`
- `/articles/feed.xml`
- `/notes/feed.xml`

### Feed item behavior

Articles:
- title, summary, canonical URL, date

Notes:
- body/excerpt as item content

Links:
- your commentary as primary item content
- outbound URL clearly included
- canonical page on mindful.engineer remains the item permalink

That last point is important for POSSE consistency.

## Archive model

The archive should be generated from all published entries.

Each entry should contribute:
- date
- type
- title or body excerpt
- canonical URL
- tags if useful later

The archive is both a navigation feature and a durability feature.

## Syndication metadata

Each entry should be able to express both preferences and outcomes.

### Preferences
These can live in source metadata or in operational config:
- preferred default targets
- whether a platform variant should be prepared
- whether media should be included if available

### Outcomes
These are operational and belong in D1 or equivalent:
- prepared variant text
- approval state
- post attempt state
- posted URL
- platform post ID
- error details

This distinction keeps source content clean.

## Media model

For MVP, keep media simple.

### Types likely needed
- inline images
- social card images
- article-local diagrams (SVG preferred where possible)
- uploaded images for notes/links if later needed

### Guidance
- prefer SVG for explanatory diagrams
- keep article-specific assets close to content when possible
- use R2 when uploads from mobile become important

## Social metadata model

Each published entry should support:
- canonical URL
- page title
- description/summary
- social image if available
- author identity metadata

This is important not only for sharing, but also because POSSE copies should be able to point to a rich canonical page.

## Minimal validation rules

Useful validation rules for the content model:
- articles require title, slug, summary, publishedAt
- notes require body and publishedAt
- links require url and publishedAt
- published entries must have canonical URLs
- slugs must be unique within type or globally, depending route model
- required metadata for feeds and SEO should be present

## Example content shapes

## Example article

```yaml
---
type: article
title: Fast and Present Are Not Opposites
slug: fast-and-present-are-not-opposites
summary: Mindful engineering is not slow engineering. It is fast engineering done with both eyes open.
publishedAt: 2026-04-12T09:00:00Z
tags: [practice, teams]
syndication:
  defaults:
    mastodon: true
    bluesky: true
---
```

Then MDX body with prose and occasional visual components.

## Example note

```yaml
---
type: note
publishedAt: 2026-04-15T09:14:00Z
tags: [practice]
---

Speed without presence is just chaos with a deploy pipeline.
```

## Example link

```yaml
---
type: link
publishedAt: 2026-04-10T12:00:00Z
url: https://example.com/post
source: example.com
title: Worse is Better, twenty-five years on
---

Worth revisiting every couple of years; what felt contrarian once now reads like infrastructure.
```

## Relationship to visual language

The content model should support the monastery-first visual language without baking appearance too deeply into the content itself.

In other words:
- content chooses semantic structures
- presentation applies monastery defaults
- special visual components remain limited and intentional

This preserves portability and keeps the writing readable outside its original rendering context.

## LLM-compatible metadata assistance

Because you want LLMs as assistants rather than authors, the content model should have clear slots where they can help without crossing the line.

Good candidate slots:
- excerpt suggestions
- tags suggestions
- alt text suggestions
- syndication draft suggestions
- related-post suggestions
- diagram type suggestions

The model should preserve human authorship of the body.

## MVP content model recommendation

For MVP, I recommend:

1. canonical source in MDX
2. entry types: article, note, link, snippet, page
3. use standard Markdown rendering for the default grammar
4. a small reusable set of visual MDX components for richer cases only
5. clear stable route conventions
6. feeds generated from the same canonical source
7. syndication outcomes stored operationally, not in content source

This gives you a clean foundation that can later grow into richer visual and editorial tooling without forcing a rewrite.

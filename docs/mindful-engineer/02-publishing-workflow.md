# Mindful Engineer Publishing Workflow

## Goal

Define the editorial workflow for `mindful.engineer` so that:

- long-form writing remains comfortable and laptop-first
- notes and links are easy to publish from anywhere
- syndication is deliberate and reviewable
- the system stays simple enough for an MVP

## Editorial philosophy

This publishing system should feel less like a CMS and more like a small editorial studio.

Key properties:
- canonical publication happens on the site first
- outward syndication is intentional and reviewable
- capture is lightweight, revision is supported
- long-form and short-form use different rhythms
- the act of publishing should be calm and legible

## Two authoring rhythms

### Rhythm A: long-form article development

Best for:
- essays
- article revisions
- article-specific visuals
- richer metadata and structural editing

Expected author behavior:
- mostly authored from the same laptop
- revised over multiple sessions
- published every couple of weeks
- preview matters
- syndication likely selective and reviewed

### Rhythm B: lightweight field capture

Best for:
- notes
- links
- quick observations
- short references
- publishing while away from the laptop

Expected author behavior:
- often mobile-first
- should require very few steps
- may be published same-session or saved as draft
- syndication usually follows review, not instant posting

## Core workflow model

```text
capture / draft
      ↓
shape / annotate / classify
      ↓
preview
      ↓
publish on mindful.engineer
      ↓
review outbound variants
      ↓
syndicate selectively
      ↓
observe status / update canonical post links
```

This split is important: **publication** and **syndication** are related, but not the same event.

## Publishing states

A simple state model should be enough for MVP.

### Suggested content states

- `draft`
- `ready`
- `published`
- `updated`
- `archived` (optional, likely later)

### Suggested syndication states per platform

- `not_prepared`
- `prepared`
- `approved`
- `queued`
- `posted`
- `failed`
- `skipped`

This separation lets you publish canonically without forcing all external destinations to succeed immediately.

## Workflow A: article lifecycle

### 1. Draft

Primary environment:
- local editor on laptop
- MDX source
- local or preview deployment rendering

Typical tasks:
- write the body
- revise structure
- add frontmatter
- add references and visual blocks
- choose excerpt/summary
- tune page title and metadata

### 2. Preview

The preview should answer:
- does the article read well on the site?
- do the graphics sit correctly in the page?
- does the typography hold up on mobile and desktop?
- does the metadata feel right?

Preview is especially important because the site is visually expressive.

For MVP, preview should work in two modes:
- **local build preview** for fast iteration on the primary laptop
- **Cloudflare preview deployments** for PR/ephemeral review when away from the laptop

### 3. Canonical publish

When publishing an article:
- article receives its canonical URL
- article enters public archive/feed
- social metadata is available
- syndication review items can be generated

### 4. Syndication review

Rather than auto-post, create a review surface showing platform-ready variants.

For each target, preview:
- target platform name
- character count / truncation warnings where relevant
- draft text or teaser
- link inclusion behavior
- media inclusion if any
- editable override field

### 5. Approve/send

The author should explicitly choose:
- which platforms to send now
- which to skip
- which to keep prepared but unsent

### 6. Record results

After posting outward:
- store result URL if available
- mark status
- display outbound links on canonical page in an “Elsewhere” section

## Workflow B: note lifecycle

### Quick mobile note flow

Ideal flow:

```text
open protected capture page
    ↓
select “note”
    ↓
enter body text
    ↓
optional tags
    ↓
[save draft] or [publish]
```

Optional after publish:
- review syndication suggestions
- send to selected platforms later

### Important constraint

This needs to feel fast enough that you will actually use it while out in the world.

That implies:
- no mandatory title
- no heavy metadata burden
- body-first UI
- save/publish in one screen

## Workflow C: link lifecycle

### Quick mobile link flow

Ideal flow:

```text
open protected capture page
    ↓
select “link”
    ↓
paste URL
    ↓
enter optional note/commentary
    ↓
optional fetch title/domain preview
    ↓
[save draft] or [publish]
```

For MVP, if a title is not provided, the system should fetch and use the page title when possible.
Manual correction can still be allowed.

## Proposed UI surfaces

### 1. New entry screen

A single screen can cover all MVP content creation if it adapts by type.

```text
┌─────────────────────────────────────────────┐
│ New entry                                   │
├─────────────────────────────────────────────┤
│ Type: [Article | Note | Link]               │
│                                             │
│ For article: title, slug, summary, body     │
│ For note: body                              │
│ For link: url, title?, note?                │
│                                             │
│ Tags                                        │
│ Visibility/status                           │
│                                             │
│ [Save draft] [Preview] [Publish]            │
└─────────────────────────────────────────────┘
```

### 2. Drafts screen

Should answer:
- what is unfinished?
- what needs review?
- what is blocked?

### 3. Publish review screen

For a selected item:
- canonical preview
- metadata checklist
- syndication targets and prepared text
- warnings

### 4. Syndication queue screen

Should show:
- pending approvals
- queued posts
- posted destinations
- failures needing attention

## Workflow examples

## Example 1: writing an article from laptop

```text
write article in MDX
    ↓
run preview
    ↓
adjust visual blocks and summary
    ↓
publish canonical article
    ↓
review prepared variants for Mastodon / Bluesky / LinkedIn
    ↓
edit LinkedIn wording manually
    ↓
send Mastodon + Bluesky now
    ↓
leave LinkedIn unsent until tomorrow
```

This is aligned with your stated preference for thoughtfulness over speed.

## Example 2: capturing a note while walking

```text
open admin on phone
    ↓
tap New Note
    ↓
type one-paragraph note
    ↓
publish canonical note
    ↓
optionally mark “prepare for syndication later”
```

The note is safely on your site even if no external post is sent yet.

## Example 3: posting a link from phone

```text
open admin on phone
    ↓
paste URL
    ↓
write one sentence about why it matters
    ↓
publish link post
    ↓
system prepares short outward variants
    ↓
you review/syndicate later from laptop if desired
```

## Publishing checklists

### Article publish checklist

Before publishing an article, confirm:
- title is final enough
- slug is acceptable long-term
- summary/excerpt exists
- tags are reasonable
- visuals render correctly
- metadata/social card is acceptable
- article is ready to exist publicly on its canonical URL

### Note publish checklist

Before publishing a note, confirm:
- body is clear enough as-is
- it deserves a permanent URL
- any syndication is optional, not blocking

### Link publish checklist

Before publishing a link, confirm:
- URL is correct
- your commentary is sufficient context
- title/source are acceptable

## Deliberate syndication review

Syndication should have its own review step because platform writing is not identical to canonical writing.

### Review panel should show

For each platform:
- a text preview
- a link preview behavior summary
- character limits / warnings
- media inclusion behavior
- editable override text
- current status

### Suggested author actions

- `approve`
- `edit override`
- `queue`
- `post now`
- `skip`
- `retry`

This allows careful use without making the system fussy.

## Separation of concerns: publish vs syndicate

This site should behave as though these are two distinct buttons, even if sometimes used together.

```text
[Publish to mindful.engineer]
[Prepare syndication]
[Send approved syndication]
```

Benefits:
- canonical publishing is never blocked by fragile APIs
- you can publish immediately and syndicate later
- you can rethink framing by platform
- you can keep some posts site-only

## Managing updates

Editing published content should preserve calm, legible behavior.

### Canonical updates

For articles, edits after publication may include:
- typo fixes
- structure improvements
- added references
- updated reflections
- visual corrections

Recommended practice:
- update canonical page normally
- optionally record significant updates in a lightweight note or footer
- do not automatically re-syndicate every change

### Notes and links

Edits are usually minor.
For MVP, basic update support is enough.

## Suggested preview types

There are actually three useful previews.

### 1. Reading preview
How the canonical page looks on the site.

### 2. Feed preview
How the entry appears in RSS and list pages.

### 3. Platform preview
How the outbound variant looks when prepared for each platform.

For MVP, platform preview can be text-first rather than pixel-perfect.

## Workflow ergonomics

This is where the success of the system will likely be won or lost.

### For long-form
Needs:
- reliable preview
- clean MDX conventions
- simple metadata management
- minimal friction around visuals

### For mobile note/link capture
Needs:
- almost no ceremony
- large tap targets
- draft safety
- resilient save behavior
- no dependency on perfect connectivity if avoidable later

## LLM assistance in workflow

LLM-assisted workflow is **not part of the MVP**.

It remains a future-phase direction and should stay documented so later agents preserve the intended boundary.

### Future appropriate uses
- suggest tags from a finished draft
- propose excerpt candidates for review
- produce platform-specific syndication drafts for review/editing
- identify unclear structural transitions in an article
- suggest possible diagram types for a section

### Inappropriate uses
- generating article body text as if authored by you
- silently rewriting tone
- publishing unsupervised platform variants

The system should make the boundary explicit when this phase is eventually introduced.

## MVP workflow recommendations

Prioritize these capabilities first:

1. create note from phone
2. create link from phone
3. draft/publish article from laptop using MDX
4. preview canonical output
5. generate RSS and archive updates automatically
6. prepare syndication variants after publish
7. approve and send per platform manually
8. display status and outbound links

## Deferred workflow ideas

Valuable, but not MVP:
- scheduling posts
- post-by-email
- offline mobile draft capture
- webmention/backfeed moderation
- revision diff UI
- per-platform analytics
- AI-assisted diagram generation directly in admin

## Key product principle

The publishing workflow should make this feel true:

> It is easier to publish thoughtfully on my own site than to post impulsively somewhere else.

If that becomes true, the system is working.

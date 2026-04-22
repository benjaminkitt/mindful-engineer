## Why

A public site is not enough unless canonical content can flow through it in a durable, structured, and automated way. This slice establishes the MDX-based content pipeline, stable content model, archive generation, and static feeds so the site becomes a real publishing system rather than a hard-coded shell.

## What Changes

- Implement canonical content loading from repo-managed MDX files.
- Support the MVP entry types: article, note, link, snippet, and page.
- Validate frontmatter and content shape against the agreed content model.
- Generate listing pages, archive views, and content-derived metadata from canonical source files.
- Generate fully static feeds for the main stream and relevant content subsets.
- Ensure links can fetch or infer title data when title is not explicitly provided.

## Capabilities

### New Capabilities
- `content-pipeline`: Loads and validates canonical MDX content for all MVP entry types.
- `static-feeds`: Generates static feed outputs from canonical published content.

### Modified Capabilities
- None.

## Impact

- Affects content parsing, frontmatter validation, archive generation, feed generation, and public site data flow.
- Depends on the public reading site and content model defined in the planning docs.

## Why

The site needs a real public reading surface that turns the planning work into a durable, monastery-first publishing home. This slice should deliver an end-to-end public website skeleton in Astro so the project has a working surface for articles, notes, links, snippets, archive navigation, and static pages.

## What Changes

- Build the public site as a separate Astro app deployed to Cloudflare Pages.
- Implement the core site shell using the design system produced from the prototype.
- Add the MVP information architecture and public routes for home, articles, notes, links, snippets, archive, about, and now.
- Render representative content from canonical source files so the site is navigable and reviewable end to end.
- Ensure the default experience is monastery-first, with graph and enso reserved for accents rather than equal themes.

## Capabilities

### New Capabilities
- `public-reading-site`: Provides the public monastery-first website shell, page routes, and reading experience for mindful.engineer.

### Modified Capabilities
- None.

## Impact

- Affects the public frontend app, routing, layout system, page templates, and deployment path to Cloudflare Pages.
- Depends on the design-system foundation and informs later content-pipeline work.

## Why

POSSE is a core requirement of the site, but the workflow must emphasize thoughtfulness over instant automation. This slice adds reviewed syndication so canonical posts can be prepared, approved, and sent outward without making external platform fragility part of the core publishing path.

## What Changes

- Implement reviewed syndication preparation after canonical publish.
- Support first-class reviewed integrations for Mastodon and Bluesky.
- Support assisted/manual syndication outputs for LinkedIn and X.
- Record outbound posting status, result URLs, and failures in operational state.
- Show “Elsewhere” links on canonical posts after successful syndication.
- Ensure syndication is optional and never blocks canonical publication.

## Capabilities

### New Capabilities
- `reviewed-syndication`: Prepares, reviews, approves, and sends outbound platform variants for canonical posts.
- `posts-elsewhere`: Displays outbound syndicated destinations on canonical posts.

### Modified Capabilities
- None.

## Impact

- Affects the control-plane review workflow, platform adapters, D1 operational state, queueing behavior, and canonical post rendering.
- Depends on canonical publishing, content metadata, and public post pages already existing.

# Mindful Engineer Control Plane

This Worker app is the protected editorial control plane for remote note/link capture and canonical publishing.

## What it does

- Serves a separate admin app route set (`/admin/new`, `/admin/drafts`, `/admin/review`, `/admin/settings`)
- Verifies Cloudflare Access JWTs for MVP protection
- Supports mobile-friendly note and link creation with save-draft, preview, and publish actions
- Stores workflow state and publish bookkeeping in D1
- Publishes canonical content into the repository via GitHub API (`/contents` endpoint)

## Commands

- `npm install`
- `npm run dev`
- `npm run check`
- `npm run test`
- `npm run deploy`

## Required bindings and secrets

### D1

Configured in [`wrangler.toml`](./wrangler.toml) as binding `DB`.

Apply migrations:

```bash
wrangler d1 migrations apply mindful-engineer-control-plane
```

### Cloudflare Access

Set `ACCESS_PROTECTION_MODE=cloudflare-access` (default in `wrangler.toml`) and place the Worker behind a Cloudflare Access policy. The app verifies the `CF-Access-Jwt-Assertion` header against Cloudflare Access signing keys from your team domain and requires a matching application audience.

Required environment variables:

- `ACCESS_TEAM_DOMAIN` = `https://<your-team>.cloudflareaccess.com`
- `ACCESS_AUD` = your Cloudflare Access application audience tag

To ease local dev only, set `ACCESS_PROTECTION_MODE=off` in a local `.dev.vars` file.

### GitHub API secrets

Set Worker secrets:

```bash
wrangler secret put GITHUB_TOKEN
wrangler secret put GITHUB_OWNER
wrangler secret put GITHUB_REPO
```

Optional overrides:

- `GITHUB_BRANCH` (defaults to `main`)
- `GITHUB_API_BASE_URL` (defaults to `https://api.github.com`)
- `GITHUB_CONTENT_ROOT` (defaults to `apps/public-site/src/content`)

## Canonical publish output

Published entries are generated as MDX files that match the public site's content conventions:

- Notes: `apps/public-site/src/content/notes/<date>-<slug>.mdx`
- Links: `apps/public-site/src/content/links/<date>-<slug>.mdx`

D1 keeps only workflow metadata and bookkeeping records; canonical content is committed to the repository.

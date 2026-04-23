CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('note', 'link')),
  flow_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('draft', 'preview', 'published')) DEFAULT 'draft',
  payload_json TEXT NOT NULL,
  preview_html TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  published_slug TEXT,
  published_path TEXT,
  published_sha TEXT
);

CREATE INDEX IF NOT EXISTS idx_drafts_state_updated
  ON drafts(state, updated_at DESC);

CREATE TABLE IF NOT EXISTS preview_sessions (
  id TEXT PRIMARY KEY,
  draft_id TEXT NOT NULL,
  flow_id TEXT NOT NULL,
  preview_token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(draft_id) REFERENCES drafts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_preview_sessions_token
  ON preview_sessions(preview_token);

CREATE TABLE IF NOT EXISTS publish_events (
  id TEXT PRIMARY KEY,
  draft_id TEXT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('note', 'link')),
  flow_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_path TEXT NOT NULL,
  github_commit_sha TEXT NOT NULL,
  github_commit_url TEXT,
  repository TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('published')) DEFAULT 'published'
);

CREATE INDEX IF NOT EXISTS idx_publish_events_created
  ON publish_events(created_at DESC);

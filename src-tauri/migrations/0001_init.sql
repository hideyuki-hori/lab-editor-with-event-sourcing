CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  stream_id TEXT NOT NULL,
  name TEXT,
  parent_branch_id TEXT,
  fork_version INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (parent_branch_id) REFERENCES branches(id)
);

CREATE INDEX IF NOT EXISTS idx_branches_stream ON branches(stream_id);

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  active_branch_id TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (active_branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS events (
  sequence_id INTEGER PRIMARY KEY AUTOINCREMENT,
  stream_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(branch_id, version),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE INDEX IF NOT EXISTS idx_events_branch ON events(branch_id, version);

CREATE TABLE IF NOT EXISTS snapshots (
  branch_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  state TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (branch_id, version),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

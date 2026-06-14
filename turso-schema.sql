-- Turso (libSQL/SQLite) schema for todaypharm.kr
-- PostgreSQL TEXT[] → JSON TEXT, JSONB → TEXT
-- Run this in Turso console or via migration script

CREATE TABLE IF NOT EXISTS pharmacies (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  hpid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  tel TEXT,
  latitude REAL,
  longitude REAL,
  operating_hours TEXT,          -- JSON
  description_raw TEXT,
  gemini_summary TEXT,
  province TEXT,
  city TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS supplements (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  product_report_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  manufacturer TEXT,
  image_url TEXT,
  nutrition_facts TEXT,          -- JSON array
  additives TEXT,                -- JSON object
  ai_summary TEXT,
  tags TEXT,                     -- JSON array: '["omega3","fatigue"]'
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  deficiency_symptoms TEXT,      -- JSON array
  excess_symptoms TEXT,          -- JSON array
  daily_value_guideline TEXT,    -- JSON object
  tags TEXT,                     -- JSON array
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content_queue (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  hpid TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  region TEXT,
  theme TEXT,
  content_html TEXT,
  ai_summary TEXT,
  ai_bullets TEXT,               -- JSON array
  ai_faq TEXT,                   -- JSON array
  ai_cta TEXT,
  extra_sections TEXT,           -- JSON array
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending|review|published|failed
  publish_at TEXT NOT NULL,
  published_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  item_seq TEXT UNIQUE,
  name TEXT NOT NULL,
  manufacturer TEXT,
  efficacy TEXT,
  use_method TEXT,
  warning_general TEXT,
  warning_usage TEXT,
  interactions TEXT,
  side_effects TEXT,
  storage_method TEXT,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  referrer TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pharmacies_province ON pharmacies(province);
CREATE INDEX IF NOT EXISTS idx_pharmacies_province_city ON pharmacies(province, city);
CREATE INDEX IF NOT EXISTS idx_pharmacies_lat_lon ON pharmacies(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_supplements_created_at ON supplements(created_at);
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue(status);
-- publish-queue.ts: WHERE status='pending' AND publish_at<=? ORDER BY publish_at 를 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_content_queue_status_publish_at ON content_queue(status, publish_at);
CREATE INDEX IF NOT EXISTS idx_content_queue_published_at ON content_queue(published_at);
CREATE INDEX IF NOT EXISTS idx_content_queue_slug ON content_queue(slug);
CREATE INDEX IF NOT EXISTS idx_content_queue_hpid ON content_queue(hpid);
CREATE INDEX IF NOT EXISTS idx_analytics_logs_created_at ON analytics_logs(created_at);

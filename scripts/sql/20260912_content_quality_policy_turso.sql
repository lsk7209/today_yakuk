-- Additive Turso/libSQL quality-policy migration.
-- Do not run against production without explicit approval.
-- Existing public rows are explicitly backfilled before defaults govern new rows.
ALTER TABLE content_queue ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE content_queue ADD COLUMN index_policy TEXT NOT NULL DEFAULT 'noindex';
ALTER TABLE content_queue ADD COLUMN ads_eligible INTEGER NOT NULL DEFAULT 0;
ALTER TABLE content_queue ADD COLUMN review_status TEXT NOT NULL DEFAULT 'needs_review';
ALTER TABLE content_queue ADD COLUMN reviewed_at TEXT;
ALTER TABLE content_queue ADD COLUMN reviewed_content_hash TEXT;
ALTER TABLE content_queue ADD COLUMN content_hash TEXT;
ALTER TABLE content_queue ADD COLUMN reviewer_id TEXT;
ALTER TABLE content_queue ADD COLUMN decision_reason TEXT;
ALTER TABLE content_queue ADD COLUMN replacement_url TEXT;
ALTER TABLE content_queue ADD COLUMN source_count INTEGER NOT NULL DEFAULT 0;

UPDATE content_queue
SET publication_status = CASE WHEN status = 'published' THEN 'published' ELSE 'draft' END,
    index_policy = CASE WHEN status = 'published' THEN 'index' ELSE 'noindex' END,
    ads_eligible = 0,
    review_status = CASE WHEN status = 'published' THEN 'unreviewed' ELSE 'needs_review' END,
    source_count = 0
WHERE status = 'published' OR publication_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_content_queue_publication_status
  ON content_queue(publication_status);
CREATE INDEX IF NOT EXISTS idx_content_queue_public_index
  ON content_queue(publication_status, index_policy);
CREATE INDEX IF NOT EXISTS idx_content_queue_review
  ON content_queue(review_status, ads_eligible);

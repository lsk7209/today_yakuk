-- Add enrichment tracking columns to supplements table
-- This allows for retry logic when AI enrichment fails

ALTER TABLE supplements 
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT NULL;

ALTER TABLE supplements 
ADD COLUMN IF NOT EXISTS enrichment_tried_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for efficient querying of failed enrichments
CREATE INDEX IF NOT EXISTS idx_supplements_enrichment_status 
ON supplements(enrichment_status) 
WHERE enrichment_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_supplements_enrichment_retry 
ON supplements(enrichment_status, enrichment_tried_at) 
WHERE enrichment_status = 'failed';

COMMENT ON COLUMN supplements.enrichment_status IS 'AI enrichment status: null (not tried), success, failed, api_not_found';
COMMENT ON COLUMN supplements.enrichment_tried_at IS 'Timestamp of last enrichment attempt for retry logic';

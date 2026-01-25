-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_seq TEXT UNIQUE NOT NULL, -- 품목기준코드 (Unique Key)
  name TEXT NOT NULL, -- 제품명
  manufacturer TEXT, -- 업체명
  efficacy TEXT, -- 효능 (문항1)
  use_method TEXT, -- 사용법 (문항2)
  warning_general TEXT, -- 주의사항경고 (문항3)
  warning_usage TEXT, -- 주의사항 (문항4)
  interactions TEXT, -- 상호작용 (문항5)
  side_effects TEXT, -- 부작용 (문항6)
  storage_method TEXT, -- 보관법 (문항7)
  image_url TEXT, -- 낱알이미지
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_medicines_item_seq ON medicines(item_seq);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_manufacturer ON medicines(manufacturer);

-- RLS Policies
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on medicines"
  ON medicines FOR SELECT
  TO public
  USING (true);

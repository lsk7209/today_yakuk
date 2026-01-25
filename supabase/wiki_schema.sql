-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  deficiency_symptoms TEXT[],
  excess_symptoms TEXT[],
  daily_value_guideline JSONB, -- { min: number, max: number, unit: string }
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplements table
CREATE TABLE IF NOT EXISTS supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_report_no TEXT UNIQUE NOT NULL, -- 식약처 품목제조번호
  name TEXT NOT NULL,
  manufacturer TEXT,
  image_url TEXT,
  nutrition_facts JSONB, -- Array of { name, amount, unit, percent_dv }
  additives JSONB, -- { has_preservatives: bool, details: string[] }
  ai_summary TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ingredients_slug ON ingredients(slug);
CREATE INDEX IF NOT EXISTS idx_supplements_product_report_no ON supplements(product_report_no);
CREATE INDEX IF NOT EXISTS idx_supplements_tags ON supplements USING GIN(tags);

-- RLS Policies (Enable Read Access for Public)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on ingredients"
  ON ingredients FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on supplements"
  ON supplements FOR SELECT
  TO public
  USING (true);

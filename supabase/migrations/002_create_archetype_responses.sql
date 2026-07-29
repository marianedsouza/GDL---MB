CREATE TABLE IF NOT EXISTS archetype_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  leader_id UUID REFERENCES leaders(id) ON DELETE CASCADE,
  leader_name TEXT,
  answers JSONB,
  brand_single TEXT,
  brand_multi JSONB,
  text_answers JSONB,
  dominant JSONB,
  secondary JSONB,
  potency JSONB,
  shadow JSONB,
  shadowIntensity NUMERIC,
  wounded JSONB,
  evolution JSONB,
  percentages JSONB
);

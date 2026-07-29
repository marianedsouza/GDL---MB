ALTER TABLE archetype_responses ADD COLUMN IF NOT EXISTS potency JSONB;
ALTER TABLE archetype_responses ADD COLUMN IF NOT EXISTS shadowIntensity NUMERIC;
ALTER TABLE archetype_responses ADD COLUMN IF NOT EXISTS wounded JSONB;

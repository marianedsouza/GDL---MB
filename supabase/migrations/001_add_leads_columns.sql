-- Adiciona colunas faltantes à tabela leads
-- Execute este script no SQL Editor do Supabase Dashboard

ALTER TABLE leads ADD COLUMN IF NOT EXISTS registered_by TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS administrative_region TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_origin TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS segment TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS relationship_level TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS influence_potential TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS observations TEXT;

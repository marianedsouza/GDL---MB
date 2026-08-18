-- Adiciona campos pessoais (sexo, nascimento, nome social) às tabelas leaders e leads
-- Execute no SQL Editor do Supabase Dashboard

-- Tabela leaders
ALTER TABLE leaders ADD COLUMN IF NOT EXISTS sexo TEXT;

-- Tabela leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sexo TEXT;
ALTER TABLE leads ALTER COLUMN administrative_region TYPE TEXT;

-- Adiciona registro de consentimento LGPD (Lei 13.709/2018, art. 8º e 11) à tabela leads
-- Execute no SQL Editor do Supabase Dashboard

ALTER TABLE leads ADD COLUMN IF NOT EXISTS lgpd_agreed BOOLEAN DEFAULT FALSE;

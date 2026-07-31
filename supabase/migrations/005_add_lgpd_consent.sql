-- Adiciona registro de consentimento LGPD (Lei 13.709/2018, art. 8º e 11) à tabela leaders
-- Execute no SQL Editor do Supabase Dashboard

ALTER TABLE leaders ADD COLUMN IF NOT EXISTS lgpd_agreed BOOLEAN DEFAULT FALSE;

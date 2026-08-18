-- Adiciona campos de Título de Eleitor à tabela leads
-- Execute no SQL Editor do Supabase Dashboard

ALTER TABLE leads ADD COLUMN IF NOT EXISTS voter_title TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS voter_zone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS voter_section TEXT;

ALTER TABLE form_settings ADD COLUMN IF NOT EXISTS lideranca_form_active BOOLEAN DEFAULT TRUE;

UPDATE form_settings SET lideranca_form_active = form_active WHERE id = 1;

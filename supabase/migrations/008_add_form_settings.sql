CREATE TABLE IF NOT EXISTS form_settings (
  id INT PRIMARY KEY DEFAULT 1,
  form_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO form_settings (id, form_active) VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;

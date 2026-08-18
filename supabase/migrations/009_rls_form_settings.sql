ALTER TABLE form_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to form_settings"
  ON form_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

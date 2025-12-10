-- Settings table for AI configuration
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy (allow all for now - you may want to restrict this in production)
CREATE POLICY "Allow all access to settings" ON settings FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON settings TO anon, authenticated;

-- Seed default settings
INSERT INTO settings (key, value, description) VALUES
(
  'ai_model',
  'gemini-flash-latest',
  'The Gemini model to use for analysis'
),
(
  'ai_prompt',
  'You are an automation assessment expert helping a team identify automation opportunities.

Analyze this idea and categorize it based on implementation difficulty.

Idea: "{idea}"

Context: This is a business/workplace automation idea. Common tools mentioned may include:
- Greenhouse = ATS (Applicant Tracking System)
- Salesforce, HubSpot = CRM systems
- Slack, Teams = Communication platforms
- Google Sheets, Airtable = Data storage
- n8n, Zapier, Make = Automation platforms

Respond ONLY with valid JSON (no markdown, no code blocks):
{"category": "quick-win" | "achievable" | "moonshot", "reasoning": "Brief 5-10 word explanation"}

Categories:
- quick-win: Doable in hours/days with no-code tools (Zapier, n8n, Make) or simple scripts
- achievable: Needs moderate dev effort, custom integrations, or API work - but clearly doable
- moonshot: Requires advanced AI/ML, major system changes, or experimental technology

Keep reasoning SHORT and actionable.',
  'The prompt template sent to the AI. Use {idea} as placeholder for the user''s idea.'
),
(
  'category_quick_win_name',
  'Quick Wins',
  'Display name for the quick-win category'
),
(
  'category_quick_win_description',
  'Automate this tomorrow',
  'Description for the quick-win category'
),
(
  'category_achievable_name',
  'Achievable',
  'Display name for the achievable category'
),
(
  'category_achievable_description',
  'Worth the investment',
  'Description for the achievable category'
),
(
  'category_moonshot_name',
  'Moonshots',
  'Display name for the moonshot category'
),
(
  'category_moonshot_description',
  'Dream big, plan carefully',
  'Description for the moonshot category'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

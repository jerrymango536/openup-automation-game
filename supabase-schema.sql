-- OpenUp Automation Ideation Game - Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ideas table
CREATE TABLE ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT,
  category TEXT DEFAULT 'pending' CHECK (category IN ('pending', 'quick-win', 'achievable', 'moonshot')),
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_ideas_session_id ON ideas(session_id);
CREATE INDEX idx_ideas_category ON ideas(category);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - adjust for production)
CREATE POLICY "Allow all access to sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all access to ideas" ON ideas FOR ALL USING (true);

-- Enable Realtime for ideas table
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;

-- Grant permissions
GRANT ALL ON sessions TO anon, authenticated;
GRANT ALL ON ideas TO anon, authenticated;

-- ============================================================
-- Project Heartbeat — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FAQ Questions (4-choice quiz questions for the FAQ module)
-- ============================================================
CREATE TABLE IF NOT EXISTS faq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  option_a VARCHAR(500) NOT NULL,
  option_b VARCHAR(500) NOT NULL,
  option_c VARCHAR(500) NOT NULL,
  option_d VARCHAR(500) NOT NULL,
  correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Quiz Entry Questions (for the login quiz — multiple questions)
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type VARCHAR(20) DEFAULT 'open_ended',
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL, -- For open_ended: normalized text. For multiple_choice: 'A', 'B', 'C', or 'D'
  option_a VARCHAR(500),
  option_b VARCHAR(500),
  option_c VARCHAR(500),
  option_d VARCHAR(500),
  display_order INTEGER NOT NULL UNIQUE,
  hint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Timeline Events
-- ============================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON timeline_events(event_date ASC);

-- ============================================================
-- Love Coupons
-- ============================================================
CREATE TABLE IF NOT EXISTS love_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  expiry_date DATE NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  icon VARCHAR(10) DEFAULT '🎁',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Love Reasons (Sevgi Sayacı)
-- ============================================================
CREATE TABLE IF NOT EXISTS love_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason_text TEXT NOT NULL,
  display_order INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_love_reasons_order ON love_reasons(display_order ASC);

-- ============================================================
-- Digital Letter (Geleceğe Not)
-- ============================================================
CREATE TABLE IF NOT EXISTS digital_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_content TEXT NOT NULL DEFAULT '',
  unlock_date DATE, -- if null, uses LETTER_UNLOCK_DATE env variable
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default letter row
INSERT INTO digital_letters (id, letter_content, unlock_date)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- timeline_events: public read, service role write
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read timeline" ON timeline_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service write timeline" ON timeline_events FOR ALL TO service_role USING (true);

-- love_coupons: public read, service role write
ALTER TABLE love_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read coupons" ON love_coupons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service write coupons" ON love_coupons FOR ALL TO service_role USING (true);
-- Allow anon to update is_used (coupon usage by visitor)
CREATE POLICY "Anon update coupon used" ON love_coupons FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- love_reasons: public read, service role write
ALTER TABLE love_reasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reasons" ON love_reasons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service write reasons" ON love_reasons FOR ALL TO service_role USING (true);

-- digital_letters: public read, service role write
ALTER TABLE digital_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read letter" ON digital_letters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service write letter" ON digital_letters FOR ALL TO service_role USING (true);

-- faq_questions: public read, service role write
ALTER TABLE faq_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read faq" ON faq_questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service write faq" ON faq_questions FOR ALL TO service_role USING (true);

-- quiz_questions: service role only
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service only quiz" ON quiz_questions FOR ALL TO service_role USING (true);

-- ============================================================
-- Storage Bucket (run this separately in Supabase dashboard
-- or via the Storage API — SQL alone cannot create buckets)
-- ============================================================
-- Bucket name: heartbeat-media
-- Public: true (for image URLs to be directly accessible)
-- Allowed MIME types: image/webp, image/jpeg, image/png, image/gif
-- Max file size: 10MB

-- ============================================================
-- Seed Data Examples (optional — remove before production)
-- ============================================================

-- Sample quiz questions for entry
INSERT INTO quiz_questions (question_text, correct_answer, display_order, hint) VALUES
  ('Seninle ilk nerede tanıştık?', 'placeholder', 1, 'İlk tanışma yerimizi hatırla 💕'),
  ('Benim en sevdiğim renk ne?', 'placeholder', 2, 'Düşün bir... 🌸')
ON CONFLICT DO NOTHING;

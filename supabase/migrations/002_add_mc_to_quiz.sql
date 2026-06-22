-- Migration: Add multiple choice support to quiz_questions
-- Run this in your Supabase SQL Editor

ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS question_type VARCHAR(20) DEFAULT 'open_ended',
ADD COLUMN IF NOT EXISTS option_a VARCHAR(500),
ADD COLUMN IF NOT EXISTS option_b VARCHAR(500),
ADD COLUMN IF NOT EXISTS option_c VARCHAR(500),
ADD COLUMN IF NOT EXISTS option_d VARCHAR(500);

-- Update comment for correct_answer
COMMENT ON COLUMN quiz_questions.correct_answer IS 'For open_ended: normalized text. For multiple_choice: ''A'', ''B'', ''C'', or ''D''';

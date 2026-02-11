/*
  # Add Conversation Interactions and Enhanced Session Tracking

  1. New Tables
    - `conversation_interactions` (BO-005)
      - `id` (uuid, primary key)
      - `session_id` (uuid, references coaching_sessions)
      - `employee_id` (uuid, references employee_profiles)
      - `message_type` (text) - USER, AI, SYSTEM
      - `message_content` (text)
      - `framework_stage` (text) - Current stage when message sent
      - `boundary_check_status` (text) - PASSED, FLAGGED, ESCALATED
      - `timestamp` (timestamptz)

    - `session_tags` - For filtering history
      - `id` (uuid, primary key)
      - `session_id` (uuid, references coaching_sessions)
      - `tag_name` (text)
      - `created_at` (timestamptz)

  2. Updates to Existing Tables
    - Add `current_stage` to coaching_sessions for live tracking
    - Add `outcome_summary` jsonb for action plans
    - Add `tags` text array for quick filtering

  3. Security
    - Enable RLS on new tables
    - Employees can only access their own interactions
*/

-- Conversation Interactions Table
CREATE TABLE IF NOT EXISTS conversation_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  message_type text NOT NULL CHECK (message_type IN ('USER', 'AI', 'SYSTEM')),
  message_content text NOT NULL,
  framework_stage text,
  boundary_check_status text DEFAULT 'PASSED' CHECK (boundary_check_status IN ('PASSED', 'FLAGGED', 'ESCALATED')),
  timestamp timestamptz DEFAULT now()
);

-- Session Tags Table
CREATE TABLE IF NOT EXISTS session_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  tag_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, tag_name)
);

-- Add columns to coaching_sessions if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coaching_sessions' AND column_name = 'current_stage'
  ) THEN
    ALTER TABLE coaching_sessions ADD COLUMN current_stage text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coaching_sessions' AND column_name = 'outcome_summary'
  ) THEN
    ALTER TABLE coaching_sessions ADD COLUMN outcome_summary jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coaching_sessions' AND column_name = 'tags'
  ) THEN
    ALTER TABLE coaching_sessions ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Enable RLS
ALTER TABLE conversation_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_interactions
CREATE POLICY "Employees can view own interactions"
  ON conversation_interactions FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can insert own interactions"
  ON conversation_interactions FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

-- RLS Policies for session_tags
CREATE POLICY "Employees can view own session tags"
  ON session_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaching_sessions
      WHERE coaching_sessions.id = session_tags.session_id
      AND coaching_sessions.employee_id = auth.uid()
    )
  );

CREATE POLICY "Employees can insert own session tags"
  ON session_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaching_sessions
      WHERE coaching_sessions.id = session_tags.session_id
      AND coaching_sessions.employee_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_interactions_session_id ON conversation_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_interactions_employee_id ON conversation_interactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_conversation_interactions_timestamp ON conversation_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_session_tags_session_id ON session_tags(session_id);
CREATE INDEX IF NOT EXISTS idx_session_tags_tag_name ON session_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_tags ON coaching_sessions USING GIN(tags);

/*
  # AI Coach @ BAGIC - Employee Coaching Schema

  1. New Tables
    - `employee_profiles` (BO-001)
      - `id` (uuid, primary key, references auth.users)
      - `employee_id` (text, unique) - Employee ID for login
      - `email` (text, unique)
      - `full_name` (text)
      - `persona_type` (text) - OH-EC-IC, OH-MC-PM, OH-SL
      - `career_stage` (text) - Early, Mid, Senior/Leadership
      - `department` (text)
      - `onboarding_completed` (boolean)
      - `consent_given_at` (timestamptz)
      - `preferences` (jsonb) - Settings like email reminders, show framework stages
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `coaching_sessions` (BO-002)
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employee_profiles)
      - `framework_type` (text) - GROW, CLEAR
      - `session_stage` (text) - Goal, Reality, Options, Way Forward
      - `session_summary` (text) - 3-word outcome summary
      - `full_transcript` (jsonb) - Complete conversation
      - `behavioral_patterns_detected` (text[]) - Array of pattern codes
      - `escalation_level` (text) - NONE, LOW, MEDIUM, HIGH, CRITICAL
      - `escalated_at` (timestamptz)
      - `escalated_to_hr` (boolean)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

    - `behavioral_patterns`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employee_profiles)
      - `pattern_code` (text) - Pattern identifier
      - `pattern_description` (text)
      - `first_detected` (timestamptz)
      - `frequency_count` (int)
      - `last_occurrence` (timestamptz)
      - `confidence_score` (decimal)
      - `created_at` (timestamptz)

    - `experiments`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employee_profiles)
      - `session_id` (uuid, references coaching_sessions)
      - `experiment_title` (text)
      - `experiment_description` (text)
      - `next_review_date` (timestamptz)
      - `status` (text) - ACTIVE, COMPLETED, ABANDONED
      - `outcomes` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `organizational_config` (BO-008)
      - `id` (uuid, primary key)
      - `config_key` (text, unique)
      - `config_value` (jsonb)
      - `description` (text)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Employees can only access their own data
    - HR role can access escalated sessions
    - Organizational config is read-only for employees
*/

-- Employee Profiles Table
CREATE TABLE IF NOT EXISTS employee_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  persona_type text CHECK (persona_type IN ('OH-EC-IC', 'OH-MC-PM', 'OH-SL')),
  career_stage text CHECK (career_stage IN ('Early', 'Mid', 'Senior', 'Leadership')),
  department text,
  onboarding_completed boolean DEFAULT false,
  consent_given_at timestamptz,
  preferences jsonb DEFAULT '{"email_reminders": true, "show_framework_stages": true, "enable_cbc_detection": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coaching Sessions Table
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  framework_type text NOT NULL CHECK (framework_type IN ('GROW', 'CLEAR')),
  session_stage text,
  session_summary text,
  full_transcript jsonb DEFAULT '[]'::jsonb,
  behavioral_patterns_detected text[] DEFAULT ARRAY[]::text[],
  escalation_level text DEFAULT 'NONE' CHECK (escalation_level IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  escalated_at timestamptz,
  escalated_to_hr boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Behavioral Patterns Table
CREATE TABLE IF NOT EXISTS behavioral_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  pattern_code text NOT NULL,
  pattern_description text,
  first_detected timestamptz DEFAULT now(),
  frequency_count int DEFAULT 1,
  last_occurrence timestamptz DEFAULT now(),
  confidence_score decimal(3,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- Experiments Table
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES coaching_sessions(id) ON DELETE SET NULL,
  experiment_title text NOT NULL,
  experiment_description text,
  next_review_date timestamptz,
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ABANDONED')),
  outcomes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organizational Config Table
CREATE TABLE IF NOT EXISTS organizational_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizational_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_profiles
CREATE POLICY "Employees can view own profile"
  ON employee_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Employees can update own profile"
  ON employee_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for coaching_sessions
CREATE POLICY "Employees can view own sessions"
  ON coaching_sessions FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can insert own sessions"
  ON coaching_sessions FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own sessions"
  ON coaching_sessions FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

-- RLS Policies for behavioral_patterns
CREATE POLICY "Employees can view own patterns"
  ON behavioral_patterns FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can insert own patterns"
  ON behavioral_patterns FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

-- RLS Policies for experiments
CREATE POLICY "Employees can view own experiments"
  ON experiments FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can insert own experiments"
  ON experiments FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own experiments"
  ON experiments FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

-- RLS Policies for organizational_config
CREATE POLICY "All authenticated users can view config"
  ON organizational_config FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_profiles_employee_id ON employee_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_email ON employee_profiles(email);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_employee_id ON coaching_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_created_at ON coaching_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_behavioral_patterns_employee_id ON behavioral_patterns(employee_id);
CREATE INDEX IF NOT EXISTS idx_experiments_employee_id ON experiments(employee_id);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);

-- Insert default organizational config
INSERT INTO organizational_config (config_key, config_value, description) VALUES
  ('boundaries', '{"can": ["Help reflect on career challenges", "Guide GROW/CLEAR framework conversations", "Track behavioral patterns"], "cannot": ["Influence performance ratings", "Provide therapy or diagnosis", "Interpret HR policies", "Override manager decisions"]}', 'What the coach can and cannot do'),
  ('privacy_policy', '{"data_storage": "Your conversations are stored within BAGIC for continuity only", "escalation": "Sessions escalate to HR only when boundaries exceeded", "consent": "All escalations include your full conversation context"}', 'Privacy and data handling policy'),
  ('framework_info', '{"GROW": "Goal, Reality, Options, Way Forward", "CLEAR": "Contracting, Listening, Exploring, Action, Review"}', 'Available coaching frameworks')
ON CONFLICT (config_key) DO NOTHING;
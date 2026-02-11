/*
  # Add Executive OKR and Business Metrics Tables

  1. New Tables
    - `okr_key_results` - Tracks the 5 key results for POC success
      - `id` (uuid, primary key)
      - `kr_code` (text) - KR1, KR2, KR3, KR4, KR5
      - `kr_name` (text) - Framework Compliance, Zero Violations, etc.
      - `target_value` (numeric) - Target to achieve
      - `current_value` (numeric) - Current achievement
      - `unit` (text) - %, count, etc.
      - `status` (text) - Met, Not Met, In Progress
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

    - `persona_metrics` - Aggregated metrics by persona
      - `id` (uuid, primary key)
      - `persona_type` (text) - Early Career IC, Mid-Career Manager, Senior Leader
      - `total_users` (integer)
      - `total_sessions` (integer)
      - `primary_framework` (text) - GROW, CLEAR, etc.
      - `confidence_change` (numeric) - % change
      - `stress_change` (numeric) - % change
      - `effectiveness_score` (numeric) - 0-100
      - `period_start` (timestamptz)
      - `period_end` (timestamptz)
      - `created_at` (timestamptz)

    - `poc_health_metrics` - System health and risk indicators
      - `id` (uuid, primary key)
      - `metric_date` (date)
      - `compliance_rate` (numeric) - % of sessions compliant
      - `escalation_rate` (numeric) - % of sessions escalated
      - `active_sessions` (integer) - Currently active
      - `violations_today` (integer) - Violations in last 24h
      - `avg_session_quality` (numeric) - 0-100 score
      - `created_at` (timestamptz)

    - `poc_reports` - Exportable POC summary reports
      - `id` (uuid, primary key)
      - `report_name` (text)
      - `period_start` (timestamptz)
      - `period_end` (timestamptz)
      - `summary_data` (jsonb) - Full report data
      - `generated_by` (uuid, foreign key)
      - `generated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - OH-EXEC, OH-HR-GOV can read all metrics
    - Only OH-HR-GOV can generate reports
*/

-- OKR Key Results Table
CREATE TABLE IF NOT EXISTS okr_key_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kr_code text UNIQUE NOT NULL,
  kr_name text NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  unit text NOT NULL,
  status text NOT NULL CHECK (status IN ('Met', 'Not Met', 'In Progress')),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Persona Metrics Table
CREATE TABLE IF NOT EXISTS persona_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_type text NOT NULL,
  total_users integer NOT NULL DEFAULT 0,
  total_sessions integer NOT NULL DEFAULT 0,
  primary_framework text NOT NULL,
  confidence_change numeric DEFAULT 0,
  stress_change numeric DEFAULT 0,
  effectiveness_score numeric NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- POC Health Metrics Table
CREATE TABLE IF NOT EXISTS poc_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  compliance_rate numeric NOT NULL DEFAULT 100,
  escalation_rate numeric NOT NULL DEFAULT 0,
  active_sessions integer NOT NULL DEFAULT 0,
  violations_today integer NOT NULL DEFAULT 0,
  avg_session_quality numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- POC Reports Table
CREATE TABLE IF NOT EXISTS poc_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  summary_data jsonb NOT NULL DEFAULT '{}',
  generated_by uuid REFERENCES employee_profiles(id),
  generated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE okr_key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE poc_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE poc_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for OKR Key Results
CREATE POLICY "Executives can view OKR metrics"
  ON okr_key_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-EXEC', 'OH-HR-GOV')
    )
  );

CREATE POLICY "Governance can update OKR metrics"
  ON okr_key_results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-HR-GOV'
    )
  );

-- RLS Policies for Persona Metrics
CREATE POLICY "Executives can view persona metrics"
  ON persona_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-EXEC', 'OH-HR-GOV')
    )
  );

CREATE POLICY "Governance can manage persona metrics"
  ON persona_metrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-HR-GOV'
    )
  );

-- RLS Policies for POC Health Metrics
CREATE POLICY "Executives can view health metrics"
  ON poc_health_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-EXEC', 'OH-HR-GOV')
    )
  );

CREATE POLICY "Governance can manage health metrics"
  ON poc_health_metrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-HR-GOV'
    )
  );

-- RLS Policies for POC Reports
CREATE POLICY "Executives can view POC reports"
  ON poc_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-EXEC', 'OH-HR-GOV')
    )
  );

CREATE POLICY "Governance can generate POC reports"
  ON poc_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-HR-GOV'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_okr_key_results_code ON okr_key_results(kr_code);
CREATE INDEX IF NOT EXISTS idx_persona_metrics_type ON persona_metrics(persona_type);
CREATE INDEX IF NOT EXISTS idx_poc_health_metrics_date ON poc_health_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_poc_reports_generated ON poc_reports(generated_at);

-- Insert sample OKR Key Results data
INSERT INTO okr_key_results (kr_code, kr_name, target_value, current_value, unit, status) VALUES
('KR1', 'Framework Compliance', 100, 100, '%', 'Met'),
('KR2', 'Zero Violations', 0, 0, 'count', 'Met'),
('KR3', 'Full Explainability', 100, 100, '%', 'Met'),
('KR4', 'Coaching Journeys', 40, 42, 'count', 'Met'),
('KR5', 'Effectiveness Score', 90, 94, '%', 'Met');

-- Insert sample Persona Metrics
INSERT INTO persona_metrics (
  persona_type, total_users, total_sessions, primary_framework,
  confidence_change, stress_change, effectiveness_score,
  period_start, period_end
) VALUES
(
  'Early Career IC',
  28,
  67,
  'GROW',
  24,
  NULL,
  92,
  now() - interval '30 days',
  now()
),
(
  'Mid-Career Manager',
  14,
  28,
  'CLEAR',
  NULL,
  -18,
  89,
  now() - interval '30 days',
  now()
),
(
  'Senior Leader',
  8,
  15,
  'CLEAR',
  NULL,
  -12,
  96,
  now() - interval '30 days',
  now()
);

-- Insert sample POC Health Metrics (last 7 days)
INSERT INTO poc_health_metrics (
  metric_date, compliance_rate, escalation_rate,
  active_sessions, violations_today, avg_session_quality
) VALUES
(CURRENT_DATE - 6, 98, 2.3, 5, 1, 91),
(CURRENT_DATE - 5, 99, 2.1, 4, 0, 93),
(CURRENT_DATE - 4, 99, 1.9, 6, 0, 94),
(CURRENT_DATE - 3, 100, 2.0, 3, 0, 95),
(CURRENT_DATE - 2, 100, 2.2, 4, 0, 94),
(CURRENT_DATE - 1, 100, 2.1, 5, 0, 96),
(CURRENT_DATE, 100, 2.1, 3, 0, 95);

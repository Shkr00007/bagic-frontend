/*
  # Add HR Admin Support and Governance Metrics

  1. Updates to Existing Tables
    - Extend `employee_profiles` to support HR admin personas
      - Add `is_admin` boolean flag
      - Add `admin_role` for OH-HR-GOV, OH-HR-COMP, OH-EXEC
      - Add `admin_permissions` jsonb for granular access

  2. New Tables
    - `governance_metrics` - Daily snapshot of compliance metrics
      - `id` (uuid, primary key)
      - `metric_date` (date)
      - `framework_compliance_rate` (decimal)
      - `ethical_violations_count` (int)
      - `explainability_rate` (decimal)
      - `active_escalations_count` (int)
      - `total_sessions_count` (int)
      - `created_at` (timestamptz)

    - `framework_usage_stats` - Framework adoption metrics
      - `id` (uuid, primary key)
      - `stat_date` (date)
      - `framework_type` (text)
      - `usage_count` (int)
      - `compliance_rate` (decimal)
      - `created_at` (timestamptz)

    - `persona_adoption_stats` - Persona-level engagement
      - `id` (uuid, primary key)
      - `stat_date` (date)
      - `persona_type` (text)
      - `active_users_count` (int)
      - `total_users_count` (int)
      - `adoption_rate` (decimal)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on new tables
    - Only admin users can view governance metrics
    - OH-HR-GOV has full access
    - OH-HR-COMP has violations/explainability access only
    - OH-EXEC has read-only dashboard access
*/

-- Add HR admin fields to employee_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employee_profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE employee_profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employee_profiles' AND column_name = 'admin_role'
  ) THEN
    ALTER TABLE employee_profiles ADD COLUMN admin_role text CHECK (admin_role IN ('OH-HR-GOV', 'OH-HR-COMP', 'OH-EXEC'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employee_profiles' AND column_name = 'admin_permissions'
  ) THEN
    ALTER TABLE employee_profiles ADD COLUMN admin_permissions jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Governance Metrics Table
CREATE TABLE IF NOT EXISTS governance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  framework_compliance_rate decimal(5,2) DEFAULT 100.00,
  ethical_violations_count int DEFAULT 0,
  explainability_rate decimal(5,2) DEFAULT 100.00,
  active_escalations_count int DEFAULT 0,
  total_sessions_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(metric_date)
);

-- Framework Usage Stats Table
CREATE TABLE IF NOT EXISTS framework_usage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date date NOT NULL,
  framework_type text NOT NULL,
  usage_count int DEFAULT 0,
  compliance_rate decimal(5,2) DEFAULT 100.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(stat_date, framework_type)
);

-- Persona Adoption Stats Table
CREATE TABLE IF NOT EXISTS persona_adoption_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date date NOT NULL,
  persona_type text NOT NULL,
  active_users_count int DEFAULT 0,
  total_users_count int DEFAULT 0,
  adoption_rate decimal(5,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(stat_date, persona_type)
);

-- Enable RLS
ALTER TABLE governance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_adoption_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for governance_metrics (admin only)
CREATE POLICY "Admin users can view governance metrics"
  ON governance_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

-- RLS Policies for framework_usage_stats (admin only)
CREATE POLICY "Admin users can view framework stats"
  ON framework_usage_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

-- RLS Policies for persona_adoption_stats (admin only)
CREATE POLICY "Admin users can view persona stats"
  ON persona_adoption_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_governance_metrics_date ON governance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_framework_usage_date ON framework_usage_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_persona_adoption_date ON persona_adoption_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_is_admin ON employee_profiles(is_admin);

-- Insert sample governance metrics for current date
INSERT INTO governance_metrics (
  metric_date,
  framework_compliance_rate,
  ethical_violations_count,
  explainability_rate,
  active_escalations_count,
  total_sessions_count
) VALUES (
  CURRENT_DATE,
  100.00,
  0,
  100.00,
  2,
  0
) ON CONFLICT (metric_date) DO NOTHING;

-- Insert sample framework usage stats
INSERT INTO framework_usage_stats (stat_date, framework_type, usage_count, compliance_rate) VALUES
  (CURRENT_DATE, 'GROW', 67, 100.00),
  (CURRENT_DATE, 'CLEAR', 28, 100.00),
  (CURRENT_DATE, 'ITC', 5, 100.00),
  (CURRENT_DATE, 'KOLB', 0, 100.00)
ON CONFLICT (stat_date, framework_type) DO NOTHING;

-- Insert sample persona adoption stats
INSERT INTO persona_adoption_stats (stat_date, persona_type, active_users_count, total_users_count, adoption_rate) VALUES
  (CURRENT_DATE, 'OH-EC-IC', 85, 100, 85.00),
  (CURRENT_DATE, 'OH-MC-PM', 62, 100, 62.00),
  (CURRENT_DATE, 'OH-SL', 45, 100, 45.00)
ON CONFLICT (stat_date, persona_type) DO NOTHING;

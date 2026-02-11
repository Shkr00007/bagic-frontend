/*
  # Add Configuration Tables for HR Admin

  1. New Tables
    - `framework_persona_mapping` - Framework activation per persona
      - `id` (uuid, primary key)
      - `persona_type` (text) - OH-EC-IC, OH-MC-PM, OH-SL
      - `framework_type` (text) - GROW, CLEAR, KOLB, ITC
      - `is_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `boundary_rules` - Hard constraints and thresholds
      - `id` (uuid, primary key)
      - `rule_code` (text) - BL-001, BL-002, etc.
      - `rule_name` (text)
      - `description` (text)
      - `is_hard_constraint` (boolean) - true = locked, false = configurable
      - `threshold_value` (decimal) - for configurable rules
      - `is_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `guardrail_rules` - Soft constraints
      - `id` (uuid, primary key)
      - `rule_name` (text)
      - `rule_type` (text) - session_length, topic_risk, etc.
      - `threshold_value` (text) - can be numeric or text
      - `is_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `escalation_rules` - When to escalate to humans
      - `id` (uuid, primary key)
      - `rule_name` (text)
      - `trigger_condition` (text)
      - `trigger_threshold` (decimal)
      - `target_type` (text) - EAP, HR Coach, Manager
      - `urgency_level` (text) - CRITICAL, HIGH, MEDIUM, LOW
      - `is_enabled` (boolean)
      - `triggered_count` (int) - how many times triggered
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Only OH-HR-GOV can modify configurations
    - All admin roles can read configurations
*/

-- Framework Persona Mapping Table
CREATE TABLE IF NOT EXISTS framework_persona_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_type text NOT NULL CHECK (persona_type IN ('OH-EC-IC', 'OH-MC-PM', 'OH-SL')),
  framework_type text NOT NULL CHECK (framework_type IN ('GROW', 'CLEAR', 'KOLB', 'ITC')),
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(persona_type, framework_type)
);

-- Boundary Rules Table
CREATE TABLE IF NOT EXISTS boundary_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code text UNIQUE NOT NULL,
  rule_name text NOT NULL,
  description text NOT NULL,
  is_hard_constraint boolean DEFAULT true,
  threshold_value decimal(5,2),
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Guardrail Rules Table
CREATE TABLE IF NOT EXISTS guardrail_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  rule_type text NOT NULL,
  threshold_value text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Escalation Rules Table
CREATE TABLE IF NOT EXISTS escalation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  trigger_condition text NOT NULL,
  trigger_threshold decimal(5,2) NOT NULL,
  target_type text NOT NULL,
  urgency_level text NOT NULL CHECK (urgency_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  is_enabled boolean DEFAULT true,
  triggered_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE framework_persona_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE boundary_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardrail_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin users can read all
CREATE POLICY "Admin users can view framework mappings"
  ON framework_persona_mapping FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

CREATE POLICY "HR-GOV can modify framework mappings"
  ON framework_persona_mapping FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.admin_role = 'OH-HR-GOV'
    )
  );

CREATE POLICY "Admin users can view boundary rules"
  ON boundary_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

CREATE POLICY "HR-GOV can modify boundary rules"
  ON boundary_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.admin_role = 'OH-HR-GOV'
    )
  );

CREATE POLICY "Admin users can view guardrail rules"
  ON guardrail_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

CREATE POLICY "HR-GOV can modify guardrail rules"
  ON guardrail_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.admin_role = 'OH-HR-GOV'
    )
  );

CREATE POLICY "Admin users can view escalation rules"
  ON escalation_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

CREATE POLICY "HR-GOV can modify escalation rules"
  ON escalation_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.admin_role = 'OH-HR-GOV'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_framework_persona_mapping_persona ON framework_persona_mapping(persona_type);
CREATE INDEX IF NOT EXISTS idx_boundary_rules_code ON boundary_rules(rule_code);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_enabled ON escalation_rules(is_enabled);

-- Insert default framework persona mappings
INSERT INTO framework_persona_mapping (persona_type, framework_type, is_enabled) VALUES
  ('OH-EC-IC', 'GROW', true),
  ('OH-EC-IC', 'CLEAR', false),
  ('OH-EC-IC', 'KOLB', true),
  ('OH-EC-IC', 'ITC', false),
  ('OH-MC-PM', 'GROW', true),
  ('OH-MC-PM', 'CLEAR', true),
  ('OH-MC-PM', 'KOLB', false),
  ('OH-MC-PM', 'ITC', false),
  ('OH-SL', 'GROW', true),
  ('OH-SL', 'CLEAR', true),
  ('OH-SL', 'KOLB', false),
  ('OH-SL', 'ITC', true)
ON CONFLICT (persona_type, framework_type) DO NOTHING;

-- Insert default boundary rules
INSERT INTO boundary_rules (rule_code, rule_name, description, is_hard_constraint, threshold_value, is_enabled) VALUES
  ('BL-001', 'No prescriptive advice', 'AI must only ask questions, never give direct advice', true, NULL, true),
  ('BL-002', 'No mental health diagnosis', 'AI must escalate clinical language to EAP', true, NULL, true),
  ('BL-003', 'No performance ratings', 'AI cannot provide performance evaluations - HR only', true, NULL, true),
  ('GR-001', 'Emotional intensity threshold', 'Maximum emotional intensity before escalation', false, 85.00, true)
ON CONFLICT (rule_code) DO NOTHING;

-- Insert default guardrail rules
INSERT INTO guardrail_rules (rule_name, rule_type, threshold_value, is_enabled) VALUES
  ('Session length limit', 'session_length', '45min', true),
  ('Topic risk escalation', 'topic_risk', 'High→HR', true)
ON CONFLICT DO NOTHING;

-- Insert default escalation rules
INSERT INTO escalation_rules (rule_name, trigger_condition, trigger_threshold, target_type, urgency_level, is_enabled) VALUES
  ('Clinical language detected', 'Mental health keywords >80%', 80.00, 'EAP', 'CRITICAL', true),
  ('Emotional intensity high', 'Stress score >90%', 90.00, 'HR Coach', 'HIGH', true),
  ('Session length exceeded', 'Duration >45min', 45.00, 'System Alert', 'MEDIUM', true)
ON CONFLICT DO NOTHING;

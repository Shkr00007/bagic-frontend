/*
  # Add Operations Monitoring and Configuration Tables

  1. New Tables
    - `agent_pipeline_status` - Real-time agent health metrics
      - `id` (uuid, primary key)
      - `agent_code` (text) - DH-001, DH-002, etc.
      - `agent_name` (text) - Framework Selector, ICF Validator, etc.
      - `status` (text) - OK, WARN, ERROR
      - `latency_ms` (numeric) - Average latency
      - `error_rate` (numeric) - Error percentage
      - `session_count` (integer) - Sessions processed
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

    - `error_logs` - System error tracking
      - `id` (uuid, primary key)
      - `error_code` (text)
      - `error_message` (text)
      - `agent_code` (text) - Which agent errored
      - `session_id` (uuid, foreign key)
      - `stack_trace` (text)
      - `severity` (text) - INFO, WARN, ERROR, CRITICAL
      - `resolved` (boolean)
      - `occurred_at` (timestamptz)
      - `created_at` (timestamptz)

    - `feature_flags` - System feature toggles
      - `id` (uuid, primary key)
      - `flag_code` (text, unique) - GROW_EC, CLEAR_MC, etc.
      - `flag_name` (text)
      - `is_enabled` (boolean)
      - `description` (text)
      - `last_changed_by` (uuid, foreign key)
      - `last_changed_at` (timestamptz)
      - `created_at` (timestamptz)

    - `workflow_configs` - Workflow configuration
      - `id` (uuid, primary key)
      - `workflow_code` (text, unique) - WF-001, WF-002, etc.
      - `workflow_name` (text)
      - `is_enabled` (boolean)
      - `active_count` (integer) - Currently active instances
      - `config_data` (jsonb)
      - `last_changed_by` (uuid, foreign key)
      - `last_changed_at` (timestamptz)
      - `created_at` (timestamptz)

    - `config_audit_log` - Audit trail for config changes
      - `id` (uuid, primary key)
      - `change_type` (text) - FEATURE_FLAG, WORKFLOW, ENVIRONMENT
      - `entity_code` (text) - Which feature/workflow changed
      - `old_value` (jsonb)
      - `new_value` (jsonb)
      - `changed_by` (uuid, foreign key)
      - `reason` (text)
      - `changed_at` (timestamptz)

    - `system_environment` - Environment configuration
      - `id` (uuid, primary key)
      - `environment` (text) - POC, STAGING, PROD
      - `is_active` (boolean)
      - `changed_by` (uuid, foreign key)
      - `changed_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - OH-OPS has full access
    - OH-HR-COMP has read-only access for audit
    - OH-HR-GOV has read access
*/

-- Agent Pipeline Status Table
CREATE TABLE IF NOT EXISTS agent_pipeline_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_code text UNIQUE NOT NULL,
  agent_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('OK', 'WARN', 'ERROR')),
  latency_ms numeric NOT NULL DEFAULT 0,
  error_rate numeric NOT NULL DEFAULT 0,
  session_count integer NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Error Logs Table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code text NOT NULL,
  error_message text NOT NULL,
  agent_code text,
  session_id uuid REFERENCES coaching_sessions(id),
  stack_trace text,
  severity text NOT NULL CHECK (severity IN ('INFO', 'WARN', 'ERROR', 'CRITICAL')),
  resolved boolean DEFAULT false,
  occurred_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_code text UNIQUE NOT NULL,
  flag_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  description text,
  last_changed_by uuid REFERENCES employee_profiles(id),
  last_changed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Workflow Configs Table
CREATE TABLE IF NOT EXISTS workflow_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_code text UNIQUE NOT NULL,
  workflow_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  active_count integer DEFAULT 0,
  config_data jsonb DEFAULT '{}',
  last_changed_by uuid REFERENCES employee_profiles(id),
  last_changed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Config Audit Log Table
CREATE TABLE IF NOT EXISTS config_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  change_type text NOT NULL CHECK (change_type IN ('FEATURE_FLAG', 'WORKFLOW', 'ENVIRONMENT', 'GUARDRAIL')),
  entity_code text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  changed_by uuid REFERENCES employee_profiles(id),
  reason text,
  changed_at timestamptz DEFAULT now()
);

-- System Environment Table
CREATE TABLE IF NOT EXISTS system_environment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL CHECK (environment IN ('POC', 'STAGING', 'PROD')),
  is_active boolean DEFAULT false,
  changed_by uuid REFERENCES employee_profiles(id),
  changed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agent_pipeline_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_environment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Agent Pipeline Status
CREATE POLICY "Ops and governance can view agent status"
  ON agent_pipeline_status FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-OPS', 'OH-HR-GOV', 'OH-HR-COMP')
    )
  );

CREATE POLICY "Ops can update agent status"
  ON agent_pipeline_status FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-OPS'
    )
  );

-- RLS Policies for Error Logs
CREATE POLICY "Ops and compliance can view error logs"
  ON error_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-OPS', 'OH-HR-GOV', 'OH-HR-COMP')
    )
  );

CREATE POLICY "Ops can manage error logs"
  ON error_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-OPS'
    )
  );

-- RLS Policies for Feature Flags
CREATE POLICY "Admins can view feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

CREATE POLICY "Ops can manage feature flags"
  ON feature_flags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-OPS'
    )
  );

-- RLS Policies for Workflow Configs
CREATE POLICY "Admins can view workflow configs"
  ON workflow_configs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

CREATE POLICY "Ops can manage workflow configs"
  ON workflow_configs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-OPS'
    )
  );

-- RLS Policies for Config Audit Log
CREATE POLICY "Admins can view config audit log"
  ON config_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

CREATE POLICY "Ops can write to audit log"
  ON config_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-OPS'
    )
  );

-- RLS Policies for System Environment
CREATE POLICY "Admins can view environment"
  ON system_environment FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
    )
  );

CREATE POLICY "Ops can manage environment"
  ON system_environment FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role = 'OH-OPS'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_pipeline_status_code ON agent_pipeline_status(agent_code);
CREATE INDEX IF NOT EXISTS idx_error_logs_occurred ON error_logs(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_agent ON error_logs(agent_code);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_feature_flags_code ON feature_flags(flag_code);
CREATE INDEX IF NOT EXISTS idx_workflow_configs_code ON workflow_configs(workflow_code);
CREATE INDEX IF NOT EXISTS idx_config_audit_log_changed ON config_audit_log(changed_at DESC);

-- Insert sample agent pipeline data
INSERT INTO agent_pipeline_status (agent_code, agent_name, status, latency_ms, error_rate, session_count) VALUES
('DH-001', 'Framework Selector', 'OK', 240, 0, 47),
('DH-002', 'ICF Validator', 'OK', 180, 0, 47),
('DH-003', 'Persona Matcher', 'OK', 210, 0, 47),
('DH-004', 'Boundary Checker', 'OK', 195, 0, 47),
('DH-005', 'Context Builder', 'OK', 310, 0, 47),
('DH-006', 'Response Generator', 'OK', 450, 0.5, 47),
('DH-007', 'Guardrail Validator', 'OK', 205, 0, 47),
('DH-008', 'Evidence Logger', 'OK', 155, 0, 47),
('DH-009', 'Action Planner', 'OK', 380, 0, 12),
('DH-010', 'Escalation Trigger', 'WARN', 1200, 2, 2),
('DH-011', 'Explainability Writer', 'OK', 320, 0, 47),
('DH-012', 'Metrics Aggregator', 'OK', 275, 0, 47);

-- Insert sample error logs
INSERT INTO error_logs (error_code, error_message, agent_code, severity, occurred_at) VALUES
('ERR-001', 'Escalation threshold exceeded, triggering OH-HR-COMP alert', 'DH-010', 'WARN', now() - interval '15 minutes'),
('ERR-002', 'Slow response generation due to API rate limit', 'DH-006', 'INFO', now() - interval '45 minutes');

-- Insert sample feature flags
INSERT INTO feature_flags (flag_code, flag_name, is_enabled, description) VALUES
('GROW_EC', 'GROW for Early Career', true, 'Enable GROW framework for Early Career ICs'),
('CLEAR_MC', 'CLEAR for Managers', true, 'Enable CLEAR framework for Mid-Career Managers'),
('CLEAR_SL', 'CLEAR for Senior Leaders', true, 'Enable CLEAR framework for Senior Leaders'),
('ITC_SL', 'Immunity to Change (Senior)', false, 'Enable ITC framework for Senior Leaders (experimental)'),
('GR_EMOTIONAL', 'Emotional Guardrail', true, 'Enable emotional boundary detection at 85% threshold'),
('GR_LEGAL', 'Legal Guardrail', true, 'Enable legal topic detection'),
('GR_MEDICAL', 'Medical Guardrail', true, 'Enable medical advice detection');

-- Insert sample workflow configs
INSERT INTO workflow_configs (workflow_code, workflow_name, is_enabled, active_count) VALUES
('WF-001', 'EC Journey (Onboard → GROW)', true, 3),
('WF-002', 'Manager Journey (CLEAR)', true, 1),
('WF-003', 'Escalation Workflow', true, 0),
('WF-004', 'Action Plan Workflow', true, 2);

-- Insert sample system environment
INSERT INTO system_environment (environment, is_active) VALUES
('POC', true),
('STAGING', false),
('PROD', false);

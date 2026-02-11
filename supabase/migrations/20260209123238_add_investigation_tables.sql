/*
  # Add Investigation Tables for HR

  1. New Tables
    - `explainability_logs` - Tracks AI decision reasoning
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `interaction_id` (uuid, foreign key to conversation_interactions)
      - `employee_id` (uuid, foreign key)
      - `ai_response` (text) - The actual AI response
      - `framework_applied` (text) - Which framework was used
      - `framework_stage` (text) - Which stage of framework
      - `icf_competencies` (text[]) - Which ICF competencies applied
      - `boundaries_checked` (jsonb) - Which boundaries were checked and results
      - `reasoning` (text) - Human-readable explanation
      - `escalation_check` (jsonb) - Escalation analysis results
      - `decision_tree` (jsonb) - Full decision tree JSON
      - `created_at` (timestamptz)

    - `governance_violations` - Tracks boundary violations and corrections
      - `id` (uuid, primary key)
      - `violation_code` (text) - V-001, V-002, etc.
      - `session_id` (uuid, foreign key)
      - `employee_id` (uuid, foreign key)
      - `violation_type` (text) - BL-001, BL-002, GR-001, etc.
      - `severity` (text) - LOW, MEDIUM, HIGH, CRITICAL
      - `original_text` (text) - Original problematic text
      - `corrected_text` (text) - Auto-corrected text if applicable
      - `status` (text) - Auto-corrected, HR Review, Closed
      - `assigned_to` (uuid) - HR admin reviewing
      - `resolution_notes` (text)
      - `detected_at` (timestamptz)
      - `resolved_at` (timestamptz)
      - `created_at` (timestamptz)

    - `escalation_events` - Tracks when sessions are escalated to humans
      - `id` (uuid, primary key)
      - `escalation_code` (text) - E-001, E-002, etc.
      - `session_id` (uuid, foreign key)
      - `employee_id` (uuid, foreign key)
      - `trigger_rule_id` (uuid, foreign key to escalation_rules)
      - `trigger_condition` (text) - What triggered the escalation
      - `target_type` (text) - EAP, HR Coach, Manager
      - `urgency_level` (text) - LOW, MEDIUM, HIGH, CRITICAL
      - `status` (text) - Pending, Assigned, In Progress, Resolved
      - `assigned_to` (uuid) - Who is handling
      - `resolution_notes` (text)
      - `escalated_at` (timestamptz)
      - `resolved_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - OH-HR-GOV and OH-HR-COMP can read/write all investigation data
    - Regular employees cannot access investigation data
*/

-- Explainability Logs Table
CREATE TABLE IF NOT EXISTS explainability_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  interaction_id uuid REFERENCES conversation_interactions(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employee_profiles(id) ON DELETE CASCADE,
  ai_response text NOT NULL,
  framework_applied text NOT NULL,
  framework_stage text,
  icf_competencies text[] DEFAULT '{}',
  boundaries_checked jsonb DEFAULT '{}',
  reasoning text NOT NULL,
  escalation_check jsonb DEFAULT '{}',
  decision_tree jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Governance Violations Table
CREATE TABLE IF NOT EXISTS governance_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_code text UNIQUE NOT NULL,
  session_id uuid REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employee_profiles(id) ON DELETE CASCADE,
  violation_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  original_text text NOT NULL,
  corrected_text text,
  status text NOT NULL CHECK (status IN ('Auto-corrected', 'HR Review', 'Closed')),
  assigned_to uuid REFERENCES employee_profiles(id),
  resolution_notes text,
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Escalation Events Table
CREATE TABLE IF NOT EXISTS escalation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escalation_code text UNIQUE NOT NULL,
  session_id uuid REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employee_profiles(id) ON DELETE CASCADE,
  trigger_rule_id uuid REFERENCES escalation_rules(id),
  trigger_condition text NOT NULL,
  target_type text NOT NULL,
  urgency_level text NOT NULL CHECK (urgency_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status text NOT NULL CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Resolved')),
  assigned_to uuid REFERENCES employee_profiles(id),
  resolution_notes text,
  escalated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE explainability_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Investigation admin users can read/write
CREATE POLICY "Investigation admins can view explainability logs"
  ON explainability_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-HR-GOV', 'OH-HR-COMP')
    )
  );

CREATE POLICY "Investigation admins can insert explainability logs"
  ON explainability_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-HR-GOV', 'OH-HR-COMP')
    )
  );

CREATE POLICY "Investigation admins can view violations"
  ON governance_violations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-HR-GOV', 'OH-HR-COMP')
    )
  );

CREATE POLICY "Investigation admins can modify violations"
  ON governance_violations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-HR-GOV', 'OH-HR-COMP')
    )
  );

CREATE POLICY "Investigation admins can view escalations"
  ON escalation_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-HR-GOV', 'OH-HR-COMP')
    )
  );

CREATE POLICY "Investigation admins can modify escalations"
  ON escalation_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = auth.uid()
      AND employee_profiles.is_admin = true
      AND employee_profiles.admin_role IN ('OH-HR-GOV', 'OH-HR-COMP')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_explainability_logs_session ON explainability_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_explainability_logs_employee ON explainability_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_governance_violations_status ON governance_violations(status);
CREATE INDEX IF NOT EXISTS idx_governance_violations_severity ON governance_violations(severity);
CREATE INDEX IF NOT EXISTS idx_escalation_events_status ON escalation_events(status);
CREATE INDEX IF NOT EXISTS idx_escalation_events_urgency ON escalation_events(urgency_level);

-- Insert sample explainability logs
DO $$
DECLARE
  sample_session_id uuid;
  sample_employee_id uuid;
  sample_interaction_id uuid;
BEGIN
  -- Get a sample session
  SELECT id INTO sample_session_id FROM coaching_sessions LIMIT 1;
  SELECT id INTO sample_employee_id FROM employee_profiles WHERE is_admin = false LIMIT 1;
  SELECT id INTO sample_interaction_id FROM conversation_interactions WHERE message_type = 'AI' LIMIT 1;

  IF sample_session_id IS NOT NULL AND sample_employee_id IS NOT NULL THEN
    INSERT INTO explainability_logs (
      session_id, interaction_id, employee_id, ai_response,
      framework_applied, framework_stage, icf_competencies,
      boundaries_checked, reasoning, escalation_check, decision_tree
    ) VALUES
    (
      sample_session_id,
      sample_interaction_id,
      sample_employee_id,
      'What specifically triggers the anxiety?',
      'GROW',
      'Reality',
      ARRAY['Active Listening', 'Powerful Questioning'],
      '{"BL-001": "passed", "BL-002": "passed"}'::jsonb,
      'AI chose reflective question to stay in coaching domain',
      '{"emotional_intensity": 72, "threshold": 85, "result": "passed"}'::jsonb,
      '{"stage": "Reality", "competency_check": "passed", "boundary_check": "passed"}'::jsonb
    );
  END IF;
END $$;

-- Insert sample violations
DO $$
DECLARE
  sample_session_id uuid;
  sample_employee_id uuid;
BEGIN
  SELECT id INTO sample_session_id FROM coaching_sessions LIMIT 1;
  SELECT id INTO sample_employee_id FROM employee_profiles WHERE is_admin = false LIMIT 1;

  IF sample_session_id IS NOT NULL AND sample_employee_id IS NOT NULL THEN
    INSERT INTO governance_violations (
      violation_code, session_id, employee_id, violation_type,
      severity, original_text, corrected_text, status, detected_at
    ) VALUES
    (
      'V-001',
      sample_session_id,
      sample_employee_id,
      'BL-001',
      'LOW',
      'You should practice more',
      'What practice might help?',
      'Auto-corrected',
      now() - interval '2 days'
    ),
    (
      'V-002',
      sample_session_id,
      sample_employee_id,
      'GR-001',
      'MEDIUM',
      'I sense you are very anxious about this situation',
      NULL,
      'HR Review',
      now() - interval '1 hour'
    );
  END IF;
END $$;

-- Insert sample escalation events
DO $$
DECLARE
  sample_session_id uuid;
  sample_employee_id uuid;
  sample_rule_id uuid;
BEGIN
  SELECT id INTO sample_session_id FROM coaching_sessions LIMIT 1;
  SELECT id INTO sample_employee_id FROM employee_profiles WHERE is_admin = false LIMIT 1;
  SELECT id INTO sample_rule_id FROM escalation_rules LIMIT 1;

  IF sample_session_id IS NOT NULL AND sample_employee_id IS NOT NULL THEN
    INSERT INTO escalation_events (
      escalation_code, session_id, employee_id, trigger_rule_id,
      trigger_condition, target_type, urgency_level, status, escalated_at
    ) VALUES
    (
      'E-001',
      sample_session_id,
      sample_employee_id,
      sample_rule_id,
      'Stress score >90%',
      'HR Coach',
      'HIGH',
      'Assigned',
      now() - interval '1 hour'
    );
  END IF;
END $$;

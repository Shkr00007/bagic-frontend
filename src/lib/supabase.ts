import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type EmployeeProfile = {
  id: string;
  employee_id: string;
  email: string;
  full_name: string;
  persona_type: 'OH-EC-IC' | 'OH-MC-PM' | 'OH-SL';
  career_stage: 'Early' | 'Mid' | 'Senior' | 'Leadership';
  department: string;
  onboarding_completed: boolean;
  consent_given_at: string | null;
  preferences: {
    email_reminders: boolean;
    show_framework_stages: boolean;
    enable_cbc_detection: boolean;
  };
  is_admin: boolean;
  admin_role: 'OH-HR-GOV' | 'OH-HR-COMP' | 'OH-EXEC' | null;
  admin_permissions: any;
  created_at: string;
  updated_at: string;
};

export type GovernanceMetrics = {
  id: string;
  metric_date: string;
  framework_compliance_rate: number;
  ethical_violations_count: number;
  explainability_rate: number;
  active_escalations_count: number;
  total_sessions_count: number;
  created_at: string;
};

export type FrameworkUsageStats = {
  id: string;
  stat_date: string;
  framework_type: string;
  usage_count: number;
  compliance_rate: number;
  created_at: string;
};

export type PersonaAdoptionStats = {
  id: string;
  stat_date: string;
  persona_type: string;
  active_users_count: number;
  total_users_count: number;
  adoption_rate: number;
  created_at: string;
};

export type CoachingSession = {
  id: string;
  employee_id: string;
  framework_type: 'GROW' | 'CLEAR' | 'ITC' | 'KOLB';
  session_stage: string;
  current_stage: string | null;
  session_summary: string;
  full_transcript: any[];
  behavioral_patterns_detected: string[];
  escalation_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  escalated_at: string | null;
  escalated_to_hr: boolean;
  outcome_summary: any;
  tags: string[];
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

export type ConversationInteraction = {
  id: string;
  session_id: string;
  employee_id: string;
  message_type: 'USER' | 'AI' | 'SYSTEM';
  message_content: string;
  framework_stage: string | null;
  boundary_check_status: 'PASSED' | 'FLAGGED' | 'ESCALATED';
  timestamp: string;
};

export type Experiment = {
  id: string;
  employee_id: string;
  session_id: string | null;
  experiment_title: string;
  experiment_description: string;
  next_review_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  outcomes: any;
  created_at: string;
  updated_at: string;
};

export type FrameworkPersonaMapping = {
  id: string;
  persona_type: 'OH-EC-IC' | 'OH-MC-PM' | 'OH-SL';
  framework_type: 'GROW' | 'CLEAR' | 'KOLB' | 'ITC';
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type BoundaryRule = {
  id: string;
  rule_code: string;
  rule_name: string;
  description: string;
  is_hard_constraint: boolean;
  threshold_value: number | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type GuardrailRule = {
  id: string;
  rule_name: string;
  rule_type: string;
  threshold_value: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type EscalationRule = {
  id: string;
  rule_name: string;
  trigger_condition: string;
  trigger_threshold: number;
  target_type: string;
  urgency_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_enabled: boolean;
  triggered_count: number;
  created_at: string;
  updated_at: string;
};

export type ExplainabilityLog = {
  id: string;
  session_id: string;
  interaction_id: string;
  employee_id: string;
  ai_response: string;
  framework_applied: string;
  framework_stage: string | null;
  icf_competencies: string[];
  boundaries_checked: any;
  reasoning: string;
  escalation_check: any;
  decision_tree: any;
  created_at: string;
};

export type GovernanceViolation = {
  id: string;
  violation_code: string;
  session_id: string;
  employee_id: string;
  violation_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  original_text: string;
  corrected_text: string | null;
  status: 'Auto-corrected' | 'HR Review' | 'Closed';
  assigned_to: string | null;
  resolution_notes: string | null;
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
};

export type EscalationEvent = {
  id: string;
  escalation_code: string;
  session_id: string;
  employee_id: string;
  trigger_rule_id: string | null;
  trigger_condition: string;
  target_type: string;
  urgency_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved';
  assigned_to: string | null;
  resolution_notes: string | null;
  escalated_at: string;
  resolved_at: string | null;
  created_at: string;
};

export type OKRKeyResult = {
  id: string;
  kr_code: string;
  kr_name: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: 'Met' | 'Not Met' | 'In Progress';
  last_updated: string;
  created_at: string;
};

export type PersonaMetrics = {
  id: string;
  persona_type: string;
  total_users: number;
  total_sessions: number;
  primary_framework: string;
  confidence_change: number | null;
  stress_change: number | null;
  effectiveness_score: number;
  period_start: string;
  period_end: string;
  created_at: string;
};

export type POCHealthMetrics = {
  id: string;
  metric_date: string;
  compliance_rate: number;
  escalation_rate: number;
  active_sessions: number;
  violations_today: number;
  avg_session_quality: number;
  created_at: string;
};

export type POCReport = {
  id: string;
  report_name: string;
  period_start: string;
  period_end: string;
  summary_data: any;
  generated_by: string | null;
  generated_at: string;
};

export type AgentPipelineStatus = {
  id: string;
  agent_code: string;
  agent_name: string;
  status: 'OK' | 'WARN' | 'ERROR';
  latency_ms: number;
  error_rate: number;
  session_count: number;
  last_updated: string;
  created_at: string;
};

export type ErrorLog = {
  id: string;
  error_code: string;
  error_message: string;
  agent_code: string | null;
  session_id: string | null;
  stack_trace: string | null;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  resolved: boolean;
  occurred_at: string;
  created_at: string;
};

export type FeatureFlag = {
  id: string;
  flag_code: string;
  flag_name: string;
  is_enabled: boolean;
  description: string | null;
  last_changed_by: string | null;
  last_changed_at: string;
  created_at: string;
};

export type WorkflowConfig = {
  id: string;
  workflow_code: string;
  workflow_name: string;
  is_enabled: boolean;
  active_count: number;
  config_data: any;
  last_changed_by: string | null;
  last_changed_at: string;
  created_at: string;
};

export type ConfigAuditLog = {
  id: string;
  change_type: 'FEATURE_FLAG' | 'WORKFLOW' | 'ENVIRONMENT' | 'GUARDRAIL';
  entity_code: string;
  old_value: any;
  new_value: any;
  changed_by: string | null;
  reason: string | null;
  changed_at: string;
};

export type SystemEnvironment = {
  id: string;
  environment: 'POC' | 'STAGING' | 'PROD';
  is_active: boolean;
  changed_by: string | null;
  changed_at: string;
};

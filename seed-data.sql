-- Seed Data for AI Coach @ BAGIC
-- Run this in the Supabase SQL Editor to create test accounts

-- Note: First create auth users manually in Supabase Auth dashboard, then add their UUIDs here
-- Or use this script after users have signed up via OTP

-- Example: Create a test employee profile (update the UUID with actual auth.user id)
-- Step 1: Go to Authentication > Users in Supabase Dashboard
-- Step 2: Click "Add User" and create test@bagic.com
-- Step 3: Copy the User UID
-- Step 4: Replace 'YOUR-USER-UUID-HERE' below with the actual UUID

-- Test Employee 1: Early Career Individual Contributor
INSERT INTO employee_profiles (
  id,
  employee_id,
  email,
  full_name,
  persona_type,
  career_stage,
  department,
  onboarding_completed,
  consent_given_at
) VALUES (
  'YOUR-USER-UUID-HERE',
  'EMP001',
  'test@bagic.com',
  'Alex Johnson',
  'OH-EC-IC',
  'Early',
  'Engineering',
  false,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Sample Coaching Session
-- INSERT INTO coaching_sessions (
--   employee_id,
--   framework_type,
--   session_stage,
--   session_summary,
--   escalation_level,
--   started_at
-- ) VALUES (
--   'YOUR-USER-UUID-HERE',
--   'GROW',
--   'Options',
--   'Exploring career growth paths',
--   'NONE',
--   NOW() - INTERVAL '2 hours'
-- );

-- Sample Experiment
-- INSERT INTO experiments (
--   employee_id,
--   experiment_title,
--   experiment_description,
--   next_review_date,
--   status
-- ) VALUES (
--   'YOUR-USER-UUID-HERE',
--   'Practice active listening in meetings',
--   'Take notes during team meetings and ask clarifying questions',
--   NOW() + INTERVAL '1 day',
--   'ACTIVE'
-- );

-- To test the employee application:
-- 1. Create a user in Supabase Auth dashboard with email test@bagic.com
-- 2. Copy the User UID from the Auth dashboard
-- 3. Update the UUID in this file
-- 4. Run this SQL in the Supabase SQL Editor
-- 5. Try logging in with test@bagic.com

-- To test the HR admin console:
-- 1. Create a user in Supabase Auth dashboard with email hradmin@bagic.com
-- 2. Copy the User UID
-- 3. Run this SQL with the actual UUID:
-- INSERT INTO employee_profiles (
--   id, employee_id, email, full_name,
--   persona_type, career_stage, department,
--   onboarding_completed, is_admin, admin_role
-- ) VALUES (
--   'HR-USER-UUID-HERE',
--   'HR-GOV-001',
--   'hradmin@bagic.com',
--   'HR Administrator',
--   'OH-EC-IC',
--   'Early',
--   'Human Resources',
--   true,
--   true,
--   'OH-HR-GOV'
-- );
-- 4. Visit the app with #hr hash: https://yourapp.com/#hr
-- 5. Login with hradmin@bagic.com

-- To test the Operations console:
-- 1. Create a user in Supabase Auth dashboard with email opsadmin@bagic.com
-- 2. Copy the User UID
-- 3. Run this SQL with the actual UUID:
-- INSERT INTO employee_profiles (
--   id, employee_id, email, full_name,
--   persona_type, career_stage, department,
--   onboarding_completed, is_admin, admin_role
-- ) VALUES (
--   'OPS-USER-UUID-HERE',
--   'OPS-001',
--   'opsadmin@bagic.com',
--   'Operations Administrator',
--   'OH-EC-IC',
--   'Early',
--   'IT Operations',
--   true,
--   true,
--   'OH-OPS'
-- );
-- 4. Visit the app with #hr hash: https://yourapp.com/#hr
-- 5. Login with opsadmin@bagic.com
-- 6. Access Operations console for system health, data lineage, and config

// import { useState, useEffect } from 'react';
// import { Check, X, AlertCircle } from 'lucide-react';
// import { Button } from '../components/Button';
// import { useAuth } from '../contexts/AuthContext';
// import { useCoaching } from '../contexts/CoachingContext';
// import { supabase } from '../lib/supabase';

// type OnboardingProps = {
//   onComplete: () => void;
// };

// export function Onboarding({ onComplete }: OnboardingProps) {
//   const { profile, refreshProfile, setSyntheticSession, isSyntheticSession } = useAuth();
//   const { startSession } = useCoaching();
//   const [understood, setUnderstood] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [boundaries, setBoundaries] = useState<any>(null);

//   useEffect(() => {
//     const loadBoundaries = async () => {
//       const { data } = await supabase
//         .from('organizational_config')
//         .select('config_value')
//         .eq('config_key', 'boundaries')
//         .maybeSingle();

//       if (data) {
//         setBoundaries(data.config_value);
//       }
//     };

//     loadBoundaries();
//   }, []);

//   const handleComplete = async (skipSession: boolean = false) => {
//     if (!profile) return;

//     setLoading(true);
//     try {
//       await supabase
//         .from('employee_profiles')
//         .update({
//           onboarding_completed: true,
//           consent_given_at: new Date().toISOString()
//         })
//         .eq('id', profile.id);

//       setSyntheticSession(true);

//       if (!skipSession) {
//         const framework = profile.persona_type === 'OH-EC-IC' ? 'GROW' :
//                           profile.persona_type === 'OH-MC-PM' ? 'CLEAR' :
//                           'ITC';

//         const initialStage = framework === 'GROW' ? 'Goal' :
//                             framework === 'CLEAR' ? 'Contract' :
//                             'Immunity Map';

//         await startSession(framework, initialStage);
//       }

//       await refreshProfile();
//       onComplete();
//     } catch (error) {
//       console.error('Error completing onboarding:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
//       <div className="max-w-[960px] mx-auto">
//         <div className="mb-8">
//           <div className="flex items-center gap-2 text-meta text-[#64748B] mb-2">
//             <span className="text-[#1E40AF] font-medium">1/2</span>
//             <span>Understand boundaries</span>
//           </div>
//           <div className="h-2 bg-[#E2E8F0] rounded-full">
//             <div className="h-full w-1/2 bg-[#1E40AF] rounded-full" />
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 md:p-12">
//           <h1 className="text-h1 mb-6">What this coach can and cannot do</h1>

//           <div className="space-y-6 mb-8">
//             <div>
//               <h2 className="text-h2 mb-4 flex items-center gap-2">
//                 <Check className="w-5 h-5 text-[#10B981]" />
//                 CAN help you with
//               </h2>
//               <ul className="space-y-3 ml-7">
//                 {boundaries?.can?.map((item: string, index: number) => (
//                   <li key={index} className="text-body text-[#1E293B] flex items-start gap-2">
//                     <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             <div>
//               <h2 className="text-h2 mb-4 flex items-center gap-2">
//                 <X className="w-5 h-5 text-[#EF4444]" />
//                 CANNOT do
//               </h2>
//               <ul className="space-y-3 ml-7">
//                 {boundaries?.cannot?.map((item: string, index: number) => (
//                   <li key={index} className="text-body text-[#1E293B] flex items-start gap-2">
//                     <X className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           <div className="bg-[#F1F5F9] rounded-lg p-6 mb-8">
//             <div className="flex gap-3">
//               <AlertCircle className="w-5 h-5 text-[#1E40AF] flex-shrink-0 mt-0.5" />
//               <div>
//                 <h3 className="text-body font-medium text-[#1E293B] mb-2">Privacy</h3>
//                 <p className="text-body text-[#64748B]">
//                   Your data stays within BAGIC. Sessions escalate to HR only when boundaries are exceeded.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <label className="flex items-start gap-3 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={understood}
//                 onChange={(e) => setUnderstood(e.target.checked)}
//                 className="mt-1 w-5 h-5 text-[#1E40AF] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#1E40AF]"
//               />
//               <span className="text-body text-[#1E293B]">
//                 I understand these boundaries
//               </span>
//             </label>

//             <div className="flex gap-4">
//               <Button
//                 onClick={() => handleComplete(false)}
//                 disabled={!understood || loading}
//                 fullWidth
//               >
//                 {loading ? 'Setting up...' : 'Begin coaching'}
//               </Button>
//             </div>

//             {isSyntheticSession && (
//               <div className="text-center">
//                 <button
//                   onClick={() => handleComplete(true)}
//                   disabled={loading}
//                   className="text-[#64748B] text-body hover:underline"
//                 >
//                   Skip and explore dashboard
//                 </button>
//               </div>
//             )}

//             <div className="text-center">
//               <a
//                 href="#"
//                 className="text-[#1E40AF] text-body hover:underline"
//               >
//                 Read full boundaries
//               </a>
//             </div>
//           </div>
//         </div>

//         <p className="text-meta text-center text-[#64748B] mt-6">
//           Framework-governed coaching - All sessions private - Escalation-ready
//         </p>
//       </div>
//     </div>
//   );
// }
import { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useCoaching } from '../contexts/CoachingContext';

type OnboardingProps = {
  onComplete: () => void;
};

export function Onboarding({ onComplete }: OnboardingProps) {
  const { profile, setSyntheticSession, isSyntheticSession } = useAuth();
  const { startSession } = useCoaching();

  const [understood, setUnderstood] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     Synthetic Boundaries
  ========================= */

  const boundaries = {
    can: [
      'Clarify goals and professional challenges',
      'Improve leadership and communication skills',
      'Reflect on workplace situations',
      'Explore stress and performance strategies',
    ],
    cannot: [
      'Provide medical or psychological diagnosis',
      'Replace HR grievance processes',
      'Override company policy',
      'Give legal advice',
    ],
  };

  const handleComplete = async (skipSession: boolean = false) => {
    if (!profile) return;

    setLoading(true);

    try {
      // Mark onboarding complete locally
      sessionStorage.setItem(
        'employeeProfile',
        JSON.stringify({
          ...profile,
          onboarding_completed: true,
          consent_given_at: new Date().toISOString(),
        })
      );

      setSyntheticSession(true);

      if (!skipSession) {
        const framework =
          profile.persona_type === 'OH-EC-IC'
            ? 'GROW'
            : profile.persona_type === 'OH-MC-PM'
            ? 'CLEAR'
            : 'ITC';

        const initialStage =
          framework === 'GROW'
            ? 'Goal'
            : framework === 'CLEAR'
            ? 'Contract'
            : 'Immunity Map';

        await startSession(framework as any, initialStage);
      }

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-[960px] mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-meta text-[#64748B] mb-2">
            <span className="text-[#1E40AF] font-medium">1/2</span>
            <span>Understand boundaries</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full">
            <div className="h-full w-1/2 bg-[#1E40AF] rounded-full" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 md:p-12">
          <h1 className="text-h1 mb-6">
            What this coach can and cannot do
          </h1>

          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-h2 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-[#10B981]" />
                CAN help you with
              </h2>

              <ul className="space-y-3 ml-7">
                {boundaries.can.map((item, index) => (
                  <li
                    key={index}
                    className="text-body text-[#1E293B] flex items-start gap-2"
                  >
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-h2 mb-4 flex items-center gap-2">
                <X className="w-5 h-5 text-[#EF4444]" />
                CANNOT do
              </h2>

              <ul className="space-y-3 ml-7">
                {boundaries.cannot.map((item, index) => (
                  <li
                    key={index}
                    className="text-body text-[#1E293B] flex items-start gap-2"
                  >
                    <X className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#F1F5F9] rounded-lg p-6 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#1E40AF] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body font-medium text-[#1E293B] mb-2">
                  Privacy
                </h3>
                <p className="text-body text-[#64748B]">
                  Synthetic demo mode. No data leaves your browser.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#1E40AF] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#1E40AF]"
              />
              <span className="text-body text-[#1E293B]">
                I understand these boundaries
              </span>
            </label>

            <div className="flex gap-4">
              <Button
                onClick={() => handleComplete(false)}
                disabled={!understood || loading}
                fullWidth
              >
                {loading ? 'Setting up...' : 'Begin coaching'}
              </Button>
            </div>

            {isSyntheticSession && (
              <div className="text-center">
                <button
                  onClick={() => handleComplete(true)}
                  disabled={loading}
                  className="text-[#64748B] text-body hover:underline"
                >
                  Skip and explore dashboard
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-meta text-center text-[#64748B] mt-6">
          Synthetic coaching mode - Fully frontend - Demo ready
        </p>
      </div>
    </div>
  );
}

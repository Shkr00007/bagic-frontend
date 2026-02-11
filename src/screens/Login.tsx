// import { useState } from 'react';
// import { Users, Info } from 'lucide-react';
// import { Button } from '../components/Button';
// import { useAuth } from '../contexts/AuthContext';

// type LoginProps = {
//   onLoginSuccess: () => void;
// };

// export function Login({ onLoginSuccess }: LoginProps) {
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showInfo, setShowInfo] = useState(false);
//   const [emailSent, setEmailSent] = useState(false);
//   const { signIn } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       await signIn(email);
//       const isSyntheticEmail = email.includes('@synthetic.bagic.local') || !email.includes('@');
//       if (!isSyntheticEmail) {
//         setEmailSent(true);
//       }
//     } catch (err: any) {
//       const errorMessage = err.message || 'Login failed. Please try again.';

//       if (errorMessage.includes('User already registered')) {
//         try {
//           await signIn(email);
//           return;
//         } catch (retryErr: any) {
//           setError('Access failed. Please try again or contact support.');
//         }
//       } else {
//         setError(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (emailSent) {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4 py-8">
//         <div className="w-full max-w-[480px] bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8">
//           <div className="text-center mb-6">
//             <Users className="w-12 h-12 text-[#1E40AF] mx-auto mb-4" />
//             <h1 className="text-h1 mb-2">Check your email</h1>
//             <p className="text-body text-[#64748B]">
//               We sent an access link to <strong>{email}</strong>
//             </p>
//           </div>

//           <div className="bg-[#F1F5F9] rounded-lg p-4 text-meta text-[#64748B]">
//             Click the link in your email to access coaching. The link expires in 1 hour.
//           </div>

//           <button
//             onClick={() => setEmailSent(false)}
//             className="text-[#1E40AF] text-body mt-4 w-full hover:underline"
//           >
//             Try different email
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-[480px]">
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <Users className="w-8 h-8 text-[#1E40AF]" />
//             <h1 className="text-h1">AI Coach @ BAGIC</h1>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8">
//           <div className="text-center mb-6">
//             <h2 className="text-h2 mb-3">Your confidential coach for behavioral growth</h2>
//             <p className="text-body text-[#64748B]">
//               Framework-governed. Not HR. Not performance management.
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label htmlFor="email" className="block text-body mb-2 text-[#1E293B]">
//                 Email or Employee ID
//               </label>
//               <input
//                 id="email"
//                 type="text"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="you@bagic.com or EMP123"
//                 className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
//                 required
//                 disabled={loading}
//               />
//               <p className="text-caption text-[#64748B] mt-1">
//                 Enter any employee ID or email - new or existing access works the same
//               </p>
//             </div>

//             {error && (
//               <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] px-4 py-3 rounded-lg text-body">
//                 {error}
//               </div>
//             )}

//             <Button type="submit" fullWidth disabled={loading}>
//               {loading ? 'Accessing...' : 'Access Coaching'}
//             </Button>
//           </form>

//           <button
//             onClick={() => setShowInfo(!showInfo)}
//             className="flex items-center gap-2 text-[#1E40AF] text-body mt-6 mx-auto hover:underline"
//           >
//             <Info className="w-4 h-4" />
//             How is my data protected?
//           </button>

//           {showInfo && (
//             <div className="mt-4 bg-[#F1F5F9] rounded-lg p-4 text-body text-[#64748B] space-y-2">
//               <p className="font-medium text-[#1E293B]">Your privacy is protected:</p>
//               <ul className="space-y-1 text-meta ml-4">
//                 <li>All conversations stay within BAGIC systems</li>
//                 <li>Sessions are private and not shared with managers</li>
//                 <li>Escalations to HR only occur when boundaries are exceeded</li>
//                 <li>You maintain full visibility of any escalated content</li>
//               </ul>
//             </div>
//           )}
//         </div>

//         <p className="text-meta text-center text-[#64748B] mt-6">
//           Framework-governed coaching - All sessions private - Escalation-ready
//         </p>
//       </div>
//     </div>
//   );
// }
import { useState } from 'react';
import { Users, Info } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

type LoginProps = {
  onLoginSuccess: () => void;
};

export function Login({ onLoginSuccess }: LoginProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const { setSyntheticSession } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!input.trim()) {
        throw new Error('Please enter Employee ID or Email');
      }

      const isEmail = input.includes('@');

      const employeeId = isEmail
        ? `EMP-${Date.now().toString().slice(-5)}`
        : input.toUpperCase();

      const email = isEmail
        ? input
        : `${input.toLowerCase()}@synthetic.local`;

      const fullName = isEmail
        ? input.split('@')[0]
        : `Employee ${employeeId}`;

      // Store synthetic session
      sessionStorage.setItem(
        'employeeProfile',
        JSON.stringify({
          id: employeeId,
          employee_id: employeeId,
          email,
          full_name: fullName,
          persona_type: 'OH-EC-IC',
          department: 'General',
          synthetic: true,
        })
      );

      setSyntheticSession(true);

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-[#1E40AF]" />
            <h1 className="text-h1">AI Coach @ BAGIC</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8">
          <div className="text-center mb-6">
            <h2 className="text-h2 mb-3">
              Synthetic Coaching Login
            </h2>
            <p className="text-body text-[#64748B]">
              Demo Mode – No backend – Instant access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body mb-2 text-[#1E293B]">
                Email or Employee ID
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="BO-001 or you@bagic.com"
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                required
                disabled={loading}
              />
              <p className="text-caption text-[#64748B] mt-1">
                Any ID works in synthetic mode
              </p>
            </div>

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] px-4 py-3 rounded-lg text-body">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Accessing...' : 'Access Coaching'}
            </Button>
          </form>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-[#1E40AF] text-body mt-6 mx-auto hover:underline"
          >
            <Info className="w-4 h-4" />
            Demo Privacy Info
          </button>

          {showInfo && (
            <div className="mt-4 bg-[#F1F5F9] rounded-lg p-4 text-body text-[#64748B] space-y-2">
              <p className="font-medium text-[#1E293B]">
                Synthetic Mode:
              </p>
              <ul className="space-y-1 text-meta ml-4">
                <li>No data leaves your browser</li>
                <li>No Supabase or backend used</li>
                <li>All sessions stored locally</li>
                <li>Safe for demo & testing</li>
              </ul>
            </div>
          )}
        </div>

        <p className="text-meta text-center text-[#64748B] mt-6">
          Synthetic coaching mode – Fully frontend – Demo ready
        </p>
      </div>
    </div>
  );
}

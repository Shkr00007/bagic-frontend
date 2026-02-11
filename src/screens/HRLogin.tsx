import { useState } from 'react';
import { Shield, Info } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

type HRLoginProps = {
  onLoginSuccess: () => void;
};

export function HRLogin({ onLoginSuccess }: HRLoginProps) {
  const [adminId, setAdminId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(adminId, true);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please contact system administrator.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F8FAFC]">
        <div className="w-full max-w-[480px] bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-[#1E40AF] mx-auto mb-4" />
            <h1 className="text-h1 mb-2">Check your email</h1>
            <p className="text-body text-[#64748B]">
              We sent a secure login link to <strong>{adminId}</strong>
            </p>
          </div>

          <div className="bg-[#F1F5F9] rounded-lg p-4 text-meta text-[#64748B]">
            Click the link in your email to access the governance console. The link expires in 1 hour.
          </div>

          <button
            onClick={() => setEmailSent(false)}
            className="text-[#1E40AF] text-body mt-4 w-full hover:underline"
          >
            Try different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#1E40AF]" />
            <h1 className="text-h1">AI Coach Governance Console</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8">
          <div className="text-center mb-6">
            <h2 className="text-h2 mb-3">Configure. Govern. Audit.</h2>
            <p className="text-body text-[#64748B]">
              Employee data protected by default. Governance view only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="adminId" className="block text-body mb-2 text-[#1E293B]">
                Admin ID
              </label>
              <input
                id="adminId"
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="admin@bagic.com or HR-GOV-001"
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] px-4 py-3 rounded-lg text-body">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Sending login link...' : 'Enter Console'}
            </Button>

            <div className="text-center">
              <p className="text-meta text-[#64748B]">
                Role-based access: HR Governance | Compliance | Executive
              </p>
            </div>
          </form>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-[#1E40AF] text-body mt-6 mx-auto hover:underline"
          >
            <Info className="w-4 h-4" />
            Access control information
          </button>

          {showInfo && (
            <div className="mt-4 bg-[#F1F5F9] rounded-lg p-4 text-body text-[#64748B] space-y-2">
              <p className="font-medium text-[#1E293B]">Role-based permissions:</p>
              <ul className="space-y-1 text-meta ml-4">
                <li><strong>OH-HR-GOV:</strong> Full console access (configure, audit, investigate)</li>
                <li><strong>OH-HR-COMP:</strong> Violations and explainability view only</li>
                <li><strong>OH-EXEC:</strong> Read-only POC dashboard access</li>
              </ul>
            </div>
          )}
        </div>

        <p className="text-meta text-center text-[#64748B] mt-6">
          Zero-tolerance compliance - Framework-governed - Audit-ready
        </p>
      </div>
    </div>
  );
}

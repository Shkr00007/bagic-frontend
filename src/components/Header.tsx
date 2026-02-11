import { User, Briefcase, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { profile } = useAuth();

  const getPersonaIcon = () => {
    if (!profile) return <User className="w-8 h-8" />;

    switch (profile.persona_type) {
      case 'OH-EC-IC':
        return <User className="w-8 h-8" />;
      case 'OH-MC-PM':
        return <Briefcase className="w-8 h-8" />;
      case 'OH-SL':
        return <TrendingUp className="w-8 h-8" />;
      default:
        return <User className="w-8 h-8" />;
    }
  };

  return (
    <header className="bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[960px] mx-auto px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-[#1E40AF]" />
          <h1 className="text-h2 text-[#1E293B]">AI Coach @ BAGIC</h1>
        </div>

        <div className="flex items-center gap-2 text-[#1E40AF]">
          {getPersonaIcon()}
        </div>
      </div>
    </header>
  );
}

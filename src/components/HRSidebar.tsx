import { LayoutDashboard, Settings, Search, AlertTriangle, LogOut, Target, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type HRSidebarProps = {
  currentView: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops';
  onNavigate: (view: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops') => void;
  onSignOut: () => void;
};

export function HRSidebar({ currentView, onNavigate, onSignOut }: HRSidebarProps) {
  const { profile } = useAuth();

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'executive' as const, label: 'Executive ROI', icon: Target },
    { id: 'ops' as const, label: 'Operations', icon: Activity },
    { id: 'configure' as const, label: 'Configure', icon: Settings },
    { id: 'investigate' as const, label: 'Investigate', icon: Search },
    { id: 'escalations' as const, label: 'Escalations', icon: AlertTriangle }
  ];

  const canAccess = (view: string) => {
    if (profile?.admin_role === 'OH-HR-GOV') return true;
    if (profile?.admin_role === 'OH-HR-COMP') {
      return view === 'investigate' || view === 'escalations' || view === 'ops';
    }
    if (profile?.admin_role === 'OH-EXEC') {
      return view === 'dashboard' || view === 'executive';
    }
    if (profile?.admin_role === 'OH-OPS') {
      return view === 'ops' || view === 'dashboard';
    }
    return false;
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E2E8F0] z-40">
      <div className="p-6 border-b border-[#E2E8F0]">
        <h1 className="text-h2 text-[#1E40AF]">AI Coach Governance</h1>
        <p className="text-meta text-[#64748B] mt-1">
          {profile?.admin_role === 'OH-HR-GOV' ? 'Full Console' :
           profile?.admin_role === 'OH-HR-COMP' ? 'Compliance View' :
           profile?.admin_role === 'OH-OPS' ? 'Operations Console' :
           'Executive Dashboard'}
        </p>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const accessible = canAccess(id);
          const active = currentView === id;

          return (
            <button
              key={id}
              onClick={() => accessible && onNavigate(id)}
              disabled={!accessible}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-[#1E40AF] text-white'
                  : accessible
                  ? 'text-[#64748B] hover:bg-[#F1F5F9]'
                  : 'text-[#CBD5E1] cursor-not-allowed'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-body">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E2E8F0]">
        <div className="mb-3 px-2">
          <p className="text-meta text-[#64748B] mb-1">{profile?.full_name}</p>
          <p className="text-meta text-[#64748B]">{profile?.email}</p>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#64748B] hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-body">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

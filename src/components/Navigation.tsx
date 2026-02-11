import { Home, History, Settings } from 'lucide-react';

type NavigationProps = {
  currentView: 'home' | 'history' | 'settings';
  onNavigate: (view: 'home' | 'history' | 'settings') => void;
};

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-50">
        <div className="flex justify-around py-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-1 px-6 py-2 ${
                currentView === id ? 'text-[#1E40AF]' : 'text-[#64748B]'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-meta">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <nav className="hidden md:block fixed right-8 top-24 bg-white border border-[#E2E8F0] rounded-lg p-2 shadow-sm">
        <div className="flex flex-col gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === id
                  ? 'bg-[#1E40AF] text-white'
                  : 'text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-body">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

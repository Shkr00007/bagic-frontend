import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CoachingProvider } from './contexts/CoachingContext';
import { Login } from './screens/Login';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { History } from './screens/History';
import { Settings } from './screens/Settings';
import { CoachingSession } from './screens/CoachingSession';
import { ActionPlan } from './screens/ActionPlan';
import { HRLogin } from './screens/HRLogin';
import { HRHome } from './screens/HRHome';
import { HRDashboard } from './screens/HRDashboard';
import { HRConfigure } from './screens/HRConfigure';
import { HRInvestigate } from './screens/HRInvestigate';
import { HREscalations } from './screens/HREscalations';
import { ExecutiveDashboard } from './screens/ExecutiveDashboard';
import { OpsConsole } from './screens/OpsConsole';

type AppView = 'home' | 'history' | 'settings' | 'coaching' | 'action-plan';
type HRView = 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [hrView, setHRView] = useState<HRView>('dashboard');
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [showHRDashboard, setShowHRDashboard] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-body text-[#64748B]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const isHRRoute = window.location.pathname === '/hr' || window.location.hash === '#hr';
    if (isHRRoute) {
      return <HRLogin onLoginSuccess={() => {}} />;
    }
    return <Login onLoginSuccess={() => {}} />;
  }

  if (profile?.is_admin) {
    const handleHRNavigate = (view: HRView) => {
      setHRView(view);
    };

    switch (hrView) {
      case 'dashboard':
        return <HRDashboard onNavigate={handleHRNavigate} />;
      case 'configure':
        return <HRConfigure onNavigate={handleHRNavigate} />;
      case 'investigate':
        return <HRInvestigate onNavigate={handleHRNavigate} />;
      case 'escalations':
        return <HREscalations onNavigate={handleHRNavigate} />;
      case 'executive':
        return <ExecutiveDashboard onNavigate={handleHRNavigate} />;
      case 'ops':
        return <OpsConsole onNavigate={handleHRNavigate} />;
      default:
        return <HRHome onNavigate={handleHRNavigate} />;
    }
  }

  const handleStartSession = (sessionId?: string) => {
    setActiveSessionId(sessionId);
    setCurrentView('coaching');
  };

  const handleCompleteSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentView('action-plan');
  };

  const handleCompleteActionPlan = () => {
    setActiveSessionId(undefined);
    setCurrentView('home');
  };

  const handleNavigate = (view: 'home' | 'history' | 'settings') => {
    setActiveSessionId(undefined);
    setCurrentView(view);
  };

  switch (currentView) {
    case 'coaching':
      return (
        <CoachingSession
          sessionId={activeSessionId}
          onComplete={handleCompleteSession}
        />
      );
    case 'action-plan':
      return activeSessionId ? (
        <ActionPlan
          sessionId={activeSessionId}
          onComplete={handleCompleteActionPlan}
        />
      ) : (
        <Home onNavigate={handleNavigate} onStartSession={handleStartSession} />
      );
    case 'history':
      return <History onNavigate={handleNavigate} onStartSession={handleStartSession} />;
    case 'settings':
      return <Settings onNavigate={handleNavigate} />;
    default:
      return <Home onNavigate={handleNavigate} onStartSession={handleStartSession} />;
  }
}

function App() {
  return (
    <AuthProvider>
      <CoachingProvider>
        <AppContent />
      </CoachingProvider>
    </AuthProvider>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { MessageCircle, Plus, Beaker, Clock } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/Button';
import { BoundaryChip } from '../components/BoundaryChip';
import { useAuth } from '../contexts/AuthContext';
import { useCoaching } from '../contexts/CoachingContext';
import { supabase, CoachingSession, Experiment } from '../lib/supabase';

type HomeProps = {
  onNavigate: (view: 'home' | 'history' | 'settings') => void;
  onStartSession?: (sessionId?: string) => void;
};

export function Home({ onNavigate, onStartSession }: HomeProps) {
  const { profile, isSyntheticSession } = useAuth();
  const { activeSession } = useCoaching();
  const [lastSession, setLastSession] = useState<CoachingSession | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      if (!isSyntheticSession) {
        const { data: sessionData } = await supabase
          .from('coaching_sessions')
          .select('*')
          .eq('employee_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sessionData) {
          setLastSession(sessionData);
        }

        const { data: experimentData } = await supabase
          .from('experiments')
          .select('*')
          .eq('employee_id', profile.id)
          .eq('status', 'ACTIVE')
          .order('next_review_date', { ascending: true })
          .limit(3);

        if (experimentData) {
          setExperiments(experimentData);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [profile, isSyntheticSession]);

  const getTimeSince = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const hours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNextReview = (date: string) => {
    const now = new Date();
    const future = new Date(date);
    const hours = Math.floor((future.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (hours < 24) return 'Tomorrow';
    const days = Math.floor(hours / 24);
    return `In ${days} days`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-8">
      <Header />

      <main className="max-w-[960px] mx-auto px-6 md:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-h1 mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
          <p className="text-body text-[#64748B]">Your AI Coach is ready</p>
          {lastSession && (
            <p className="text-meta text-[#64748B] mt-1">
              Your last reflection: {lastSession.session_summary || 'Session in progress'}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div
            onClick={() => {
              if (activeSession && activeSession.sessionStatus !== 'COMPLETED') {
                onStartSession?.(activeSession.sessionId);
              } else if (lastSession && !lastSession.completed_at) {
                onStartSession?.(lastSession.id);
              }
            }}
            className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6 hover:border-[#1E40AF] transition-colors cursor-pointer"
          >
            {activeSession && activeSession.sessionStatus !== 'COMPLETED' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-h2">Continue Active Session</h2>
                  <MessageCircle className="w-5 h-5 text-[#1E40AF]" />
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-meta text-[#64748B]">
                    {getTimeSince(activeSession.started_at)} - {activeSession.framework_type}
                  </p>
                  <BoundaryChip text={`Framework: ${activeSession.framework_type} ✓`} />
                  {activeSession.isSynthetic && (
                    <BoundaryChip text="Demo Session" status="warning" />
                  )}
                </div>
                <p className="text-body text-[#1E293B]">
                  Current stage: {activeSession.current_stage} - {activeSession.sessionStatus}
                </p>
              </>
            ) : lastSession ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-h2">Continue Last Session</h2>
                  <MessageCircle className="w-5 h-5 text-[#1E40AF]" />
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-meta text-[#64748B]">
                    {getTimeSince(lastSession.created_at)} - {lastSession.framework_type}
                  </p>
                  <BoundaryChip text={`Framework: ${lastSession.framework_type} ✓`} />
                </div>
                <p className="text-body text-[#1E293B]">
                  {lastSession.session_stage || 'Continue where you left off'}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-h2">No Recent Sessions</h2>
                  <MessageCircle className="w-5 h-5 text-[#64748B]" />
                </div>
                <p className="text-body text-[#64748B]">
                  Start your first coaching conversation
                </p>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2">Start New Conversation</h2>
              <Plus className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-body text-[#64748B] mb-4">
              Begin a framework-governed coaching session
            </p>
            <Button fullWidth onClick={() => onStartSession?.()}>New session</Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2">My Experiments</h2>
              <Beaker className="w-5 h-5 text-[#F59E0B]" />
            </div>
            {experiments.length > 0 ? (
              <div className="space-y-3">
                {experiments.slice(0, 2).map((exp) => (
                  <div key={exp.id} className="text-body">
                    <p className="text-[#1E293B] font-medium truncate">{exp.experiment_title}</p>
                    <p className="text-meta text-[#64748B] flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Next review: {getNextReview(exp.next_review_date)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body text-[#64748B]">
                No active experiments. Start a coaching session to create one.
              </p>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-meta text-[#64748B]">
            Framework-governed coaching - All sessions private - Escalation-ready
          </p>
        </div>
      </main>

      <Navigation currentView="home" onNavigate={onNavigate} />
    </div>
  );
}

// import { useEffect, useState } from 'react';
// import { Calendar, TrendingUp, ChevronDown, ChevronUp, Repeat } from 'lucide-react';
// import { Header } from '../components/Header';
// import { Navigation } from '../components/Navigation';
// import { BoundaryChip } from '../components/BoundaryChip';
// import { Button } from '../components/Button';
// import { useAuth } from '../contexts/AuthContext';
// import { supabase, CoachingSession, Experiment } from '../lib/supabase';

// type HistoryProps = {
//   onNavigate: (view: 'home' | 'history' | 'settings') => void;
//   onStartSession?: (sessionId?: string) => void;
// };

// type SessionWithExperiments = CoachingSession & {
//   experiments?: Experiment[];
//   expanded?: boolean;
// };

// export function History({ onNavigate, onStartSession }: HistoryProps) {
//   const { profile } = useAuth();
//   const [sessions, setSessions] = useState<SessionWithExperiments[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState<string>('All');
//   const [availableTags, setAvailableTags] = useState<string[]>([]);

//   useEffect(() => {
//     const loadSessions = async () => {
//       if (!profile) return;

//       const { data } = await supabase
//         .from('coaching_sessions')
//         .select('*')
//         .eq('employee_id', profile.id)
//         .order('created_at', { ascending: false });

//       if (data) {
//         const tags = new Set<string>();
//         data.forEach(session => {
//           if (session.tags) {
//             session.tags.forEach((tag: string) => tags.add(tag));
//           }
//         });
//         setAvailableTags(Array.from(tags));

//         const sessionsWithExperiments = await Promise.all(
//           data.map(async (session) => {
//             const { data: experiments } = await supabase
//               .from('experiments')
//               .select('*')
//               .eq('session_id', session.id);

//             return {
//               ...session,
//               experiments: experiments || [],
//               expanded: false
//             };
//           })
//         );

//         setSessions(sessionsWithExperiments);
//       }

//       setLoading(false);
//     };

//     loadSessions();
//   }, [profile]);

//   const formatDate = (date: string) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const toggleExpanded = (sessionId: string) => {
//     setSessions(prev =>
//       prev.map(session =>
//         session.id === sessionId
//           ? { ...session, expanded: !session.expanded }
//           : session
//       )
//     );
//   };

//   const filteredSessions = sessions.filter(session => {
//     if (activeFilter === 'All') return true;
//     return session.tags?.includes(activeFilter);
//   });

//   const getSessionInsight = (session: SessionWithExperiments): string => {
//     if (session.outcome_summary?.experiments) {
//       const expCount = session.outcome_summary.experiments.length;
//       return `Created ${expCount} experiment${expCount > 1 ? 's' : ''} for behavioral growth`;
//     }

//     if (session.completed_at) {
//       return `Completed ${session.framework_type} framework reflection`;
//     }

//     return `${session.framework_type} session in progress`;
//   };

//   const handleContinueThread = (session: SessionWithExperiments) => {
//     if (onStartSession) {
//       onStartSession();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-8">
//       <Header />

//       <main className="max-w-[960px] mx-auto px-6 md:px-12 py-8">
//         <div className="mb-8">
//           <h1 className="text-h1 mb-2">Your coaching journey</h1>
//           <p className="text-body text-[#64748B]">
//             Timeline view of your framework-governed sessions
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-2 mb-8">
//           <button
//             onClick={() => setActiveFilter('All')}
//             className={`px-4 py-2 rounded-full text-body transition-colors ${
//               activeFilter === 'All'
//                 ? 'bg-[#1E40AF] text-white'
//                 : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#1E40AF]'
//             }`}
//           >
//             All
//           </button>
//           {['Confidence', 'Leadership', 'Stress', 'Communication'].map(tag => (
//             <button
//               key={tag}
//               onClick={() => setActiveFilter(tag)}
//               className={`px-4 py-2 rounded-full text-body transition-colors ${
//                 activeFilter === tag
//                   ? 'bg-[#1E40AF] text-white'
//                   : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#1E40AF]'
//               }`}
//             >
//               {tag}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="text-center py-12 text-[#64748B]">
//             Loading sessions...
//           </div>
//         ) : filteredSessions.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-12 text-center">
//             <Calendar className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
//             <h2 className="text-h2 mb-2">No sessions yet</h2>
//             <p className="text-body text-[#64748B]">
//               Start your first coaching conversation to see your history here
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredSessions.map((session) => (
//               <div
//                 key={session.id}
//                 className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden hover:border-[#1E40AF] transition-colors"
//               >
//                 <div className="p-6">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2">
//                         <p className="text-meta text-[#64748B] flex items-center gap-2">
//                           <Calendar className="w-4 h-4" />
//                           {formatDate(session.created_at)}
//                         </p>
//                         <span className="text-meta text-[#64748B]">-</span>
//                         <h3 className="text-h2">{session.framework_type}</h3>
//                         <BoundaryChip text={`Framework: ${session.framework_type} ✓`} />
//                       </div>

//                       <div className="flex items-start gap-2">
//                         <TrendingUp className="w-4 h-4 text-[#10B981] mt-1 flex-shrink-0" />
//                         <p className="text-body text-[#1E293B]">
//                           {getSessionInsight(session)}
//                         </p>
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => toggleExpanded(session.id)}
//                       className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
//                     >
//                       {session.expanded ? (
//                         <ChevronUp className="w-5 h-5 text-[#64748B]" />
//                       ) : (
//                         <ChevronDown className="w-5 h-5 text-[#64748B]" />
//                       )}
//                     </button>
//                   </div>

//                   {session.expanded && (
//                     <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-4">
//                       {session.session_summary && (
//                         <div>
//                           <p className="text-meta text-[#64748B] font-medium mb-1">Session Summary</p>
//                           <p className="text-body text-[#1E293B]">{session.session_summary}</p>
//                         </div>
//                       )}

//                       {session.experiments && session.experiments.length > 0 && (
//                         <div>
//                           <p className="text-meta text-[#64748B] font-medium mb-2">
//                             Experiments ({session.experiments.length})
//                           </p>
//                           <div className="space-y-2">
//                             {session.experiments.map(exp => (
//                               <div
//                                 key={exp.id}
//                                 className="bg-[#F8FAFC] rounded p-3 border border-[#E2E8F0]"
//                               >
//                                 <p className="text-body text-[#1E293B] font-medium">{exp.experiment_title}</p>
//                                 <p className="text-meta text-[#64748B] mt-1">
//                                   Status: <span className={
//                                     exp.status === 'ACTIVE' ? 'text-[#10B981]' :
//                                     exp.status === 'COMPLETED' ? 'text-[#1E40AF]' :
//                                     'text-[#64748B]'
//                                   }>{exp.status}</span>
//                                 </p>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       <Button
//                         variant="secondary"
//                         onClick={() => handleContinueThread(session)}
//                       >
//                         <Repeat className="w-4 h-4 mr-2 inline" />
//                         Continue this thread
//                       </Button>
//                     </div>
//                   )}

//                   {session.escalation_level !== 'NONE' && (
//                     <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
//                       <BoundaryChip
//                         text={`Escalation: ${session.escalation_level}`}
//                         status={
//                           session.escalation_level === 'CRITICAL' ? 'critical' :
//                           session.escalation_level === 'HIGH' ? 'warning' :
//                           'success'
//                         }
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>

//       <Navigation currentView="history" onNavigate={onNavigate} />
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import {
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Repeat,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { BoundaryChip } from '../components/BoundaryChip';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

type HistoryProps = {
  onNavigate: (view: 'home' | 'history' | 'settings') => void;
  onStartSession?: () => void;
};

type LocalSession = {
  sessionId: string;
  framework_type: string;
  started_at: string;
  sessionStatus: string;
  transcript: any[];
  expanded?: boolean;
};

export function History({ onNavigate, onStartSession }: HistoryProps) {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     Load Local Sessions
  ========================= */

  useEffect(() => {
    const stored = sessionStorage.getItem('activeCoachingSession');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        setSessions([
          {
            ...parsed,
            expanded: false,
          },
        ]);
      } catch {
        setSessions([]);
      }
    }

    setLoading(false);
  }, [profile]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const toggleExpanded = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.sessionId === sessionId
          ? { ...session, expanded: !session.expanded }
          : session
      )
    );
  };

  const getSessionInsight = (session: LocalSession): string => {
    if (session.sessionStatus === 'COMPLETED') {
      return `Completed ${session.framework_type} session`;
    }
    if (session.sessionStatus === 'PAUSED') {
      return `${session.framework_type} session paused`;
    }
    return `${session.framework_type} session in progress`;
  };

  const handleContinueThread = () => {
    if (onStartSession) {
      onStartSession();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-8">
      <Header />

      <main className="max-w-[960px] mx-auto px-6 md:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-h1 mb-2">Your coaching journey</h1>
          <p className="text-body text-[#64748B]">
            Timeline view of your local synthetic sessions
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#64748B]">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-12 text-center">
            <Calendar className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
            <h2 className="text-h2 mb-2">No sessions yet</h2>
            <p className="text-body text-[#64748B]">
              Start your first coaching conversation to see your history here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden hover:border-[#1E40AF] transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-meta text-[#64748B] flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.started_at)}
                        </p>
                        <span className="text-meta text-[#64748B]">-</span>
                        <h3 className="text-h2">
                          {session.framework_type}
                        </h3>
                        <BoundaryChip
                          text={`Framework: ${session.framework_type} ✓`}
                        />
                      </div>

                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-[#10B981] mt-1 flex-shrink-0" />
                        <p className="text-body text-[#1E293B]">
                          {getSessionInsight(session)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        toggleExpanded(session.sessionId)
                      }
                      className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
                    >
                      {session.expanded ? (
                        <ChevronUp className="w-5 h-5 text-[#64748B]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#64748B]" />
                      )}
                    </button>
                  </div>

                  {session.expanded && (
                    <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                      <p className="text-meta text-[#64748B] font-medium mb-2">
                        Messages ({session.transcript.length})
                      </p>

                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {session.transcript.map((msg, index) => (
                          <div
                            key={index}
                            className="bg-[#F8FAFC] rounded p-3 border border-[#E2E8F0]"
                          >
                            <p className="text-body text-[#1E293B]">
                              <strong>{msg.type}:</strong>{' '}
                              {msg.content}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="secondary"
                        onClick={handleContinueThread}
                        className="mt-4"
                      >
                        <Repeat className="w-4 h-4 mr-2 inline" />
                        Continue this thread
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Navigation currentView="history" onNavigate={onNavigate} />
    </div>
  );
}

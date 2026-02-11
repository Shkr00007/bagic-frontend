// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from './AuthContext';

// export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';
// export type FrameworkType = 'GROW' | 'CLEAR' | 'ITC';

// export type ActiveCoachingSession = {
//   sessionId: string;
//   sessionStatus: SessionStatus;
//   framework_type: FrameworkType;
//   current_stage: string;
//   started_at: string;
//   transcript: Array<{
//     id: string;
//     type: 'USER' | 'AI' | 'SYSTEM';
//     content: string;
//     timestamp: string;
//   }>;
//   isSynthetic: boolean;
// };

// type CoachingContextType = {
//   activeSession: ActiveCoachingSession | null;
//   startSession: (frameworkType: FrameworkType, stage: string) => Promise<string>;
//   pauseSession: () => void;
//   completeSession: () => Promise<void>;
//   updateSessionStage: (stage: string) => void;
//   addMessage: (type: 'USER' | 'AI' | 'SYSTEM', content: string) => void;
//   clearSession: () => void;
// };

// const CoachingContext = createContext<CoachingContextType | undefined>(undefined);

// export function CoachingProvider({ children }: { children: ReactNode }) {
//   const { profile, isSyntheticSession } = useAuth();
//   const [activeSession, setActiveSession] = useState<ActiveCoachingSession | null>(() => {
//     const stored = sessionStorage.getItem('activeCoachingSession');
//     if (stored) {
//       try {
//         return JSON.parse(stored);
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   });

//   useEffect(() => {
//     if (activeSession) {
//       sessionStorage.setItem('activeCoachingSession', JSON.stringify(activeSession));
//     } else {
//       sessionStorage.removeItem('activeCoachingSession');
//     }
//   }, [activeSession]);

//   const startSession = async (frameworkType: FrameworkType, stage: string): Promise<string> => {
//     const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const startedAt = new Date().toISOString();

//     const newSession: ActiveCoachingSession = {
//       sessionId,
//       sessionStatus: 'ACTIVE',
//       framework_type: frameworkType,
//       current_stage: stage,
//       started_at: startedAt,
//       transcript: [],
//       isSynthetic: isSyntheticSession
//     };

//     setActiveSession(newSession);

//     if (!isSyntheticSession && profile) {
//       try {
//         await supabase.from('coaching_sessions').insert({
//           id: sessionId,
//           employee_id: profile.id,
//           framework_type: frameworkType,
//           current_stage: stage,
//           session_stage: stage,
//           escalation_level: 'NONE'
//         });
//       } catch (error) {
//         console.error('Error persisting session to database:', error);
//       }
//     }

//     return sessionId;
//   };

//   const pauseSession = () => {
//     if (activeSession) {
//       setActiveSession({
//         ...activeSession,
//         sessionStatus: 'PAUSED'
//       });
//     }
//   };

//   const completeSession = async () => {
//     if (activeSession) {
//       const completedSession = {
//         ...activeSession,
//         sessionStatus: 'COMPLETED' as SessionStatus
//       };

//       setActiveSession(completedSession);

//       if (!isSyntheticSession && profile) {
//         try {
//           await supabase
//             .from('coaching_sessions')
//             .update({
//               completed_at: new Date().toISOString(),
//               session_summary: 'Session completed'
//             })
//             .eq('id', activeSession.sessionId);
//         } catch (error) {
//           console.error('Error completing session in database:', error);
//         }
//       }
//     }
//   };

//   const updateSessionStage = (stage: string) => {
//     if (activeSession) {
//       const updatedSession = {
//         ...activeSession,
//         current_stage: stage
//       };

//       setActiveSession(updatedSession);

//       if (!isSyntheticSession && profile) {
//         supabase
//           .from('coaching_sessions')
//           .update({ current_stage: stage })
//           .eq('id', activeSession.sessionId)
//           .then(() => {})
//           .catch(error => console.error('Error updating session stage:', error));
//       }
//     }
//   };

//   const addMessage = (type: 'USER' | 'AI' | 'SYSTEM', content: string) => {
//     if (activeSession) {
//       const message = {
//         id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//         type,
//         content,
//         timestamp: new Date().toISOString()
//       };

//       setActiveSession({
//         ...activeSession,
//         transcript: [...activeSession.transcript, message]
//       });

//       if (!isSyntheticSession && profile) {
//         supabase.from('conversation_interactions').insert({
//           session_id: activeSession.sessionId,
//           employee_id: profile.id,
//           message_type: type,
//           message_content: content,
//           framework_stage: activeSession.current_stage,
//           boundary_check_status: 'PASSED'
//         }).then(() => {}).catch(error => console.error('Error saving message:', error));
//       }
//     }
//   };

//   const clearSession = () => {
//     setActiveSession(null);
//   };

//   return (
//     <CoachingContext.Provider
//       value={{
//         activeSession,
//         startSession,
//         pauseSession,
//         completeSession,
//         updateSessionStage,
//         addMessage,
//         clearSession
//       }}
//     >
//       {children}
//     </CoachingContext.Provider>
//   );
// }

// export function useCoaching() {
//   const context = useContext(CoachingContext);
//   if (context === undefined) {
//     throw new Error('useCoaching must be used within a CoachingProvider');
//   }
//   return context;
// }
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type FrameworkType = 'GROW' | 'CLEAR' | 'ITC';

export type ActiveCoachingSession = {
  sessionId: string;
  sessionStatus: SessionStatus;
  framework_type: FrameworkType;
  current_stage: string;
  started_at: string;
  transcript: Array<{
    id: string;
    type: 'USER' | 'AI' | 'SYSTEM';
    content: string;
    timestamp: string;
  }>;
  isSynthetic: boolean;
};

type CoachingContextType = {
  activeSession: ActiveCoachingSession | null;
  startSession: (frameworkType: FrameworkType, stage: string) => Promise<string>;
  pauseSession: () => void;
  completeSession: () => Promise<void>;
  updateSessionStage: (stage: string) => void;
  addMessage: (type: 'USER' | 'AI' | 'SYSTEM', content: string) => void;
  clearSession: () => void;
};

const CoachingContext = createContext<CoachingContextType | undefined>(undefined);

export function CoachingProvider({ children }: { children: ReactNode }) {
  const { isSyntheticSession } = useAuth();

  const [activeSession, setActiveSession] = useState<ActiveCoachingSession | null>(() => {
    const stored = sessionStorage.getItem('activeCoachingSession');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  /* Persist session locally */
  useEffect(() => {
    if (activeSession) {
      sessionStorage.setItem('activeCoachingSession', JSON.stringify(activeSession));
    } else {
      sessionStorage.removeItem('activeCoachingSession');
    }
  }, [activeSession]);

  const startSession = async (
    frameworkType: FrameworkType,
    stage: string
  ): Promise<string> => {
    const sessionId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newSession: ActiveCoachingSession = {
      sessionId,
      sessionStatus: 'ACTIVE',
      framework_type: frameworkType,
      current_stage: stage,
      started_at: new Date().toISOString(),
      transcript: [],
      isSynthetic: isSyntheticSession,
    };

    setActiveSession(newSession);
    return sessionId;
  };

  const pauseSession = () => {
    if (!activeSession) return;

    setActiveSession({
      ...activeSession,
      sessionStatus: 'PAUSED',
    });
  };

  const completeSession = async () => {
    if (!activeSession) return;

    setActiveSession({
      ...activeSession,
      sessionStatus: 'COMPLETED',
    });
  };

  const updateSessionStage = (stage: string) => {
    if (!activeSession) return;

    setActiveSession({
      ...activeSession,
      current_stage: stage,
    });
  };

  const addMessage = (
    type: 'USER' | 'AI' | 'SYSTEM',
    content: string
  ) => {
    if (!activeSession) return;

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date().toISOString(),
    };

    setActiveSession({
      ...activeSession,
      transcript: [...activeSession.transcript, message],
    });
  };

  const clearSession = () => {
    setActiveSession(null);
  };

  return (
    <CoachingContext.Provider
      value={{
        activeSession,
        startSession,
        pauseSession,
        completeSession,
        updateSessionStage,
        addMessage,
        clearSession,
      }}
    >
      {children}
    </CoachingContext.Provider>
  );
}

export function useCoaching() {
  const context = useContext(CoachingContext);
  if (!context) {
    throw new Error('useCoaching must be used within a CoachingProvider');
  }
  return context;
}

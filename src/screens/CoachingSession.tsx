// import { useState, useEffect, useRef } from 'react';
// import { Send, Mic, Minimize2, Maximize2 } from 'lucide-react';
// import { FrameworkStepper } from '../components/FrameworkStepper';
// import { BoundaryChip } from '../components/BoundaryChip';
// import { Button } from '../components/Button';
// import { useAuth } from '../contexts/AuthContext';
// import { useCoaching } from '../contexts/CoachingContext';

// type CoachingSessionProps = {
//   sessionId?: string;
//   onComplete: (sessionId: string) => void;
//   onMinimize?: () => void;
// };

// type Message = {
//   id: string;
//   type: 'USER' | 'AI' | 'SYSTEM';
//   content: string;
//   timestamp: Date;
//   boundaryStatus?: 'PASSED' | 'FLAGGED' | 'ESCALATED';
// };

// export function CoachingSession({ sessionId, onComplete, onMinimize }: CoachingSessionProps) {
//   const { profile, isSyntheticSession } = useAuth();
//   const { activeSession, startSession, updateSessionStage, addMessage, completeSession } = useCoaching();
//   const [session, setSession] = useState<CoachingSessionType | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputValue, setInputValue] = useState('');
//   const [isMaximized, setIsMaximized] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [helperChips, setHelperChips] = useState<string[]>([]);
//   const [showHelpers, setShowHelpers] = useState(true);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const initSession = async () => {
//       if (activeSession && (sessionId === activeSession.sessionId || !sessionId)) {
//         setSession({
//           id: activeSession.sessionId,
//           employee_id: profile?.id || '',
//           framework_type: activeSession.framework_type,
//           current_stage: activeSession.current_stage,
//           session_stage: activeSession.current_stage,
//           escalation_level: 'NONE',
//           created_at: activeSession.started_at,
//           completed_at: null,
//           session_summary: null
//         });

//         if (activeSession.transcript.length > 0) {
//           setMessages(activeSession.transcript.map(t => ({
//             id: t.id,
//             type: t.type,
//             content: t.content,
//             timestamp: new Date(t.timestamp),
//             boundaryStatus: 'PASSED'
//           })));
//         } else {
//           const welcomeMessage: Message = {
//             id: 'welcome',
//             type: 'AI',
//             content: getWelcomeMessage(activeSession.framework_type, activeSession.current_stage),
//             timestamp: new Date(),
//             boundaryStatus: 'PASSED'
//           };
//           setMessages([welcomeMessage]);
//           addMessage('AI', welcomeMessage.content);
//         }

//         setHelperChips(getHelperChips(activeSession.framework_type, activeSession.current_stage));
//       } else if (sessionId) {
//         await loadExistingSession(sessionId);
//       } else {
//         await startNewSession();
//       }
//     };

//     initSession();
//   }, [sessionId, activeSession]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const loadExistingSession = async (id: string) => {
//     const { data: sessionData } = await supabase
//       .from('coaching_sessions')
//       .select('*')
//       .eq('id', id)
//       .maybeSingle();

//     if (sessionData) {
//       setSession(sessionData);

//       const { data: interactions } = await supabase
//         .from('conversation_interactions')
//         .select('*')
//         .eq('session_id', id)
//         .order('timestamp', { ascending: true });

//       if (interactions) {
//         setMessages(interactions.map(i => ({
//           id: i.id,
//           type: i.message_type,
//           content: i.message_content,
//           timestamp: new Date(i.timestamp),
//           boundaryStatus: i.boundary_check_status
//         })));
//       }
//     }
//   };

//   const startNewSession = async () => {
//     const framework = profile?.persona_type === 'OH-EC-IC' ? 'GROW' :
//                       profile?.persona_type === 'OH-MC-PM' ? 'CLEAR' :
//                       'GROW';

//     const initialStage = framework === 'GROW' ? 'Goal' :
//                         framework === 'CLEAR' ? 'Contract' :
//                         'Immunity Map';

//     await startSession(framework, initialStage);

//     const welcomeMessage: Message = {
//       id: 'welcome',
//       type: 'AI',
//       content: getWelcomeMessage(framework, initialStage),
//       timestamp: new Date(),
//       boundaryStatus: 'PASSED'
//     };

//     setMessages([welcomeMessage]);
//     setHelperChips(getHelperChips(framework, initialStage));

//     setTimeout(() => setShowHelpers(false), 10000);
//   };

//   const getWelcomeMessage = (framework: string, stage: string): string => {
//     if (framework === 'GROW') {
//       return `Welcome to your GROW coaching session. Let's start with the Goal stage. What would you like to work on today?`;
//     }
//     if (framework === 'CLEAR') {
//       return `Welcome to your CLEAR coaching session. Let's begin by Contracting. What brings you here today, and what would make this conversation valuable for you?`;
//     }
//     return `Welcome to your Immunity to Change session. Let's start by exploring what you want to change or improve.`;
//   };

//   const getHelperChips = (framework: string, stage: string): string[] => {
//     if (framework === 'GROW' && stage === 'Goal') {
//       return [
//         'Describe a specific situation',
//         'Tell me your ideal outcome',
//         'What would success look like?'
//       ];
//     }
//     if (framework === 'CLEAR' && stage === 'Contract') {
//       return [
//         'Share what\'s on your mind',
//         'What outcome would help you?',
//         'Where do you want to focus?'
//       ];
//     }
//     return ['Not sure? Start with what\'s challenging you'];
//   };

//   const handleSend = async () => {
//     if (!inputValue.trim() || !session) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       type: 'USER',
//       content: inputValue.trim(),
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     addMessage('USER', userMessage.content);
//     setInputValue('');
//     setLoading(true);

//     if (!isSyntheticSession && profile) {
//       await supabase.from('conversation_interactions').insert({
//         session_id: session.id,
//         employee_id: profile.id,
//         message_type: 'USER',
//         message_content: userMessage.content,
//         framework_stage: session.current_stage,
//         boundary_check_status: 'PASSED'
//       });
//     }

//     setTimeout(async () => {
//       const aiResponse = generateAIResponse(inputValue, session.framework_type, session.current_stage || 'Goal');

//       const aiMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         type: 'AI',
//         content: aiResponse.content,
//         timestamp: new Date(),
//         boundaryStatus: aiResponse.boundaryStatus
//       };

//       setMessages(prev => [...prev, aiMessage]);
//       addMessage('AI', aiResponse.content);

//       if (!isSyntheticSession && profile) {
//         await supabase.from('conversation_interactions').insert({
//           session_id: session.id,
//           employee_id: profile.id,
//           message_type: 'AI',
//           message_content: aiResponse.content,
//           framework_stage: session.current_stage,
//           boundary_check_status: aiResponse.boundaryStatus
//         });
//       }

//       if (aiResponse.nextStage && aiResponse.nextStage !== session.current_stage) {
//         if (!isSyntheticSession && profile) {
//           await supabase
//             .from('coaching_sessions')
//             .update({ current_stage: aiResponse.nextStage })
//             .eq('id', session.id);
//         }

//         updateSessionStage(aiResponse.nextStage);
//         setSession(prev => prev ? { ...prev, current_stage: aiResponse.nextStage } : null);
//         setHelperChips(getHelperChips(session.framework_type, aiResponse.nextStage));
//         setShowHelpers(true);
//         setTimeout(() => setShowHelpers(false), 10000);
//       }

//       setLoading(false);
//     }, 1500);
//   };

//   const generateAIResponse = (userInput: string, framework: string, stage: string) => {
//     const responses = {
//       GROW: {
//         Goal: {
//           content: `That's a great topic to explore. To make this more concrete, what specifically would you like to achieve? What would success look like for you?`,
//           nextStage: 'Reality'
//         },
//         Reality: {
//           content: `Thank you for sharing. Let's explore your current situation. What's happening now? What have you tried so far?`,
//           nextStage: 'Options'
//         },
//         Options: {
//           content: `I hear you. What options do you see? What else could you try? What if there were no constraints?`,
//           nextStage: 'Way Forward'
//         },
//         'Way Forward': {
//           content: `Excellent reflection. What specific actions will you take? When will you start? How will you know you're making progress?`,
//           nextStage: null
//         }
//       },
//       CLEAR: {
//         Contract: {
//           content: `Thank you for sharing that. I'm here to Listen and support your thinking. Tell me more about what's on your mind.`,
//           nextStage: 'Listen'
//         },
//         Listen: {
//           content: `I'm listening. What else? What's underneath that? Help me understand the full picture.`,
//           nextStage: 'Explore'
//         },
//         Explore: {
//           content: `Let's Explore this together. What patterns do you notice? What might be different perspectives on this situation?`,
//           nextStage: 'Action'
//         },
//         Action: {
//           content: `What actions feel right to you? What would you like to experiment with? What's one small step you could take?`,
//           nextStage: 'Review'
//         },
//         Review: {
//           content: `Let's Review. What insights have emerged? What will you take forward? How will you track your progress?`,
//           nextStage: null
//         }
//       }
//     };

//     const stageResponses = responses[framework as keyof typeof responses]?.[stage as keyof typeof responses.GROW];

//     return {
//       content: stageResponses?.content || `That's interesting. Tell me more about that.`,
//       boundaryStatus: 'PASSED' as const,
//       nextStage: stageResponses?.nextStage
//     };
//   };

//   const handleComplete = async () => {
//     if (!session) return;

//     await completeSession();

//     if (!isSyntheticSession) {
//       await supabase
//         .from('coaching_sessions')
//         .update({
//           completed_at: new Date().toISOString(),
//           session_summary: 'Session completed'
//         })
//         .eq('id', session.id);
//     }

//     onComplete(session.id);
//   };

//   if (!session) {
//     return (
//       <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-body text-[#64748B]">Starting your session...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
//       <div className="bg-white border-b border-[#E2E8F0] py-3 px-6 md:px-12">
//         <div className="max-w-[960px] mx-auto flex items-center justify-between">
//           <h1 className="text-h2">Live coaching session</h1>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setIsMaximized(!isMaximized)}
//               className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
//             >
//               {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       <FrameworkStepper
//         framework={session.framework_type}
//         currentStage={session.current_stage || 'Goal'}
//         personaType={profile?.persona_type}
//       />

//       <div className="flex-1 overflow-hidden flex flex-col">
//         <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6">
//           <div className="max-w-[960px] mx-auto space-y-4">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${message.type === 'USER' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[80%] px-4 py-3 rounded-lg ${
//                     message.type === 'USER'
//                       ? 'bg-[#1E40AF] text-white'
//                       : 'bg-white border border-[#E2E8F0] text-[#1E293B]'
//                   }`}
//                 >
//                   <p className="text-body whitespace-pre-wrap">{message.content}</p>
//                   {message.type === 'AI' && message.boundaryStatus === 'PASSED' && (
//                     <div className="mt-2">
//                       <BoundaryChip text="Boundary ✓" status="success" />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//             {loading && (
//               <div className="flex justify-start">
//                 <div className="bg-white border border-[#E2E8F0] px-4 py-3 rounded-lg">
//                   <div className="flex gap-2">
//                     <div className="w-2 h-2 bg-[#64748B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                     <div className="w-2 h-2 bg-[#64748B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                     <div className="w-2 h-2 bg-[#64748B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         {showHelpers && helperChips.length > 0 && (
//           <div className="px-6 md:px-12 pb-2">
//             <div className="max-w-[960px] mx-auto flex flex-wrap gap-2">
//               {helperChips.map((chip, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setInputValue(chip)}
//                   className="px-3 py-1 bg-[#F1F5F9] text-[#64748B] text-meta rounded-full hover:bg-[#E2E8F0] transition-colors"
//                 >
//                   {chip}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="border-t border-[#E2E8F0] bg-white px-6 md:px-12 py-4">
//           <div className="max-w-[960px] mx-auto flex gap-3">
//             <input
//               type="text"
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//               placeholder="Share your thoughts..."
//               className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
//               disabled={loading}
//             />
//             <button
//               onClick={handleSend}
//               disabled={loading || !inputValue.trim()}
//               className="p-3 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Send className="w-5 h-5" />
//             </button>
//             <button className="p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors">
//               <Mic className="w-5 h-5 text-[#64748B]" />
//             </button>
//           </div>

//           {session.current_stage === 'Way Forward' || session.current_stage === 'Review' ? (
//             <div className="max-w-[960px] mx-auto mt-3 text-center">
//               <Button onClick={handleComplete}>Complete Session & Create Action Plan</Button>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from 'react';
import { useCoaching } from '../contexts/CoachingContext';

export default function CoachingSession() {
  const {
  activeSession,
  startSession,
  pauseSession,
  completeSession,
  addMessage,
} = useCoaching();


  const [input, setInput] = useState('');

  if (!activeSession) {
    return (
      <div style={{ padding: 40 }}>
        <h2>No Active Session</h2>
        <button
          onClick={() => startSession('GROW', 'GOAL')}
        >
          Start New Session
        </button>
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim()) return;

    addMessage('USER', input);
    addMessage('AI', 'This is a synthetic AI response.');

    setInput('');
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Coaching Session</h1>

      <div style={{ marginBottom: 20 }}>
        <strong>Status:</strong> {activeSession.sessionStatus}
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Stage:</strong> {activeSession.current_stage}
      </div>

      <div
        style={{
          border: '1px solid #ccc',
          padding: 16,
          height: 300,
          overflowY: 'auto',
          marginBottom: 20,
        }}
      >
        {activeSession.transcript.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 10 }}>
            <strong>{msg.type}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={pauseSession}>Pause</button>
        <button onClick={completeSession} style={{ marginLeft: 10 }}>
          Complete
        </button>
      </div>
    </div>
  );
}

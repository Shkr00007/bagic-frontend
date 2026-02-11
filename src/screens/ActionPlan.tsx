// import { useState, useEffect } from 'react';
// import { Plus, Edit2, Trash2, Check, GripVertical } from 'lucide-react';
// import { Header } from '../components/Header';
// import { Button } from '../components/Button';
// import { BoundaryChip } from '../components/BoundaryChip';
// import { useAuth } from '../contexts/AuthContext';


// type ActionPlanProps = {
//   sessionId: string;
//   onComplete: () => void;
// };

// type ExperimentDraft = {
//   id: string;
//   title: string;
//   when: string;
//   howKnow: string;
//   isEditing: boolean;
// };

// export function ActionPlan({ sessionId, onComplete }: ActionPlanProps) {
//   const { profile } = useAuth();
//   const [session, setSession] = useState<CoachingSession | null>(null);
//   const [experiments, setExperiments] = useState<ExperimentDraft[]>([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newExperiment, setNewExperiment] = useState({ title: '', when: '', howKnow: '' });
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     loadSession();
//   }, [sessionId]);

//   const loadSession = async () => {
//     const { data } = await supabase
//       .from('coaching_sessions')
//       .select('*')
//       .eq('id', sessionId)
//       .maybeSingle();

//     if (data) {
//       setSession(data);

//       if (data.framework_type === 'GROW') {
//         setExperiments([
//           {
//             id: '1',
//             title: 'Practice 3-breath pause before presentations',
//             when: 'Next team meeting',
//             howKnow: 'Less shaky voice',
//             isEditing: false
//           },
//           {
//             id: '2',
//             title: 'Ask for 1 specific feedback from manager',
//             when: 'Friday 1:1',
//             howKnow: 'Clearer expectations',
//             isEditing: false
//           }
//         ]);
//       }
//     }
//   };

//   const handleAddExperiment = () => {
//     if (!newExperiment.title.trim()) return;

//     const experiment: ExperimentDraft = {
//       id: Date.now().toString(),
//       title: newExperiment.title,
//       when: newExperiment.when,
//       howKnow: newExperiment.howKnow,
//       isEditing: false
//     };

//     setExperiments(prev => [...prev, experiment]);
//     setNewExperiment({ title: '', when: '', howKnow: '' });
//     setShowAddModal(false);
//   };

//   const handleEditExperiment = (id: string, field: string, value: string) => {
//     setExperiments(prev =>
//       prev.map(exp =>
//         exp.id === id ? { ...exp, [field]: value } : exp
//       )
//     );
//   };

//   const handleToggleEdit = (id: string) => {
//     setExperiments(prev =>
//       prev.map(exp =>
//         exp.id === id ? { ...exp, isEditing: !exp.isEditing } : exp
//       )
//     );
//   };

//   const handleDeleteExperiment = (id: string) => {
//     setExperiments(prev => prev.filter(exp => exp.id !== id));
//   };

//   const handleSave = async () => {
//     if (!profile || !session) return;

//     setSaving(true);

//     try {
//       const nextWeek = new Date();
//       nextWeek.setDate(nextWeek.getDate() + 7);

//       for (const exp of experiments) {
//         await supabase.from('experiments').insert({
//           employee_id: profile.id,
//           session_id: sessionId,
//           experiment_title: exp.title,
//           experiment_description: `When: ${exp.when}\nHow I'll know: ${exp.howKnow}`,
//           next_review_date: nextWeek.toISOString(),
//           status: 'ACTIVE'
//         });
//       }

//       await supabase
//         .from('coaching_sessions')
//         .update({
//           outcome_summary: {
//             experiments_created: experiments.length,
//             experiments: experiments.map(e => ({ title: e.title, when: e.when, measure: e.howKnow }))
//           }
//         })
//         .eq('id', sessionId);

//       onComplete();
//     } catch (error) {
//       console.error('Error saving experiments:', error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleNewSession = () => {
//     onComplete();
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC]">
//       <Header />

//       <main className="max-w-[960px] mx-auto px-6 md:px-12 py-8">
//         <div className="mb-8 text-center">
//           <div className="inline-flex mb-4">
//             <BoundaryChip text={`Framework: ${session?.framework_type || 'GROW'} ✓`} />
//           </div>
//           <h1 className="text-h1 mb-2">Your {session?.framework_type || 'GROW'} session is complete</h1>
//           <p className="text-body text-[#64748B] mb-1">
//             Next: Turn reflection into experiments
//           </p>
//           <p className="text-meta text-[#64748B]">
//             You choose the actions. I help you reflect on results.
//           </p>
//         </div>

//         <div className="space-y-4 mb-8">
//           {experiments.map((exp, index) => (
//             <div
//               key={exp.id}
//               className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6"
//             >
//               <div className="flex items-start gap-3">
//                 <GripVertical className="w-5 h-5 text-[#64748B] mt-1 cursor-move" />

//                 <div className="flex-1">
//                   {exp.isEditing ? (
//                     <div className="space-y-3">
//                       <input
//                         type="text"
//                         value={exp.title}
//                         onChange={(e) => handleEditExperiment(exp.id, 'title', e.target.value)}
//                         className="w-full px-3 py-2 border border-[#E2E8F0] rounded text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
//                         placeholder="What will you try?"
//                       />
//                       <input
//                         type="text"
//                         value={exp.when}
//                         onChange={(e) => handleEditExperiment(exp.id, 'when', e.target.value)}
//                         className="w-full px-3 py-2 border border-[#E2E8F0] rounded text-meta focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
//                         placeholder="When will you do this?"
//                       />
//                       <input
//                         type="text"
//                         value={exp.howKnow}
//                         onChange={(e) => handleEditExperiment(exp.id, 'howKnow', e.target.value)}
//                         className="w-full px-3 py-2 border border-[#E2E8F0] rounded text-meta focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
//                         placeholder="How will you know it worked?"
//                       />
//                     </div>
//                   ) : (
//                     <div>
//                       <h3 className="text-body font-medium text-[#1E293B] mb-2">
//                         {exp.title}
//                       </h3>
//                       <div className="space-y-1">
//                         <p className="text-meta text-[#64748B]">
//                           <span className="font-medium">When:</span> {exp.when}
//                         </p>
//                         <p className="text-meta text-[#64748B]">
//                           <span className="font-medium">How I'll know:</span> {exp.howKnow}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleToggleEdit(exp.id)}
//                     className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
//                   >
//                     {exp.isEditing ? (
//                       <Check className="w-4 h-4 text-[#10B981]" />
//                     ) : (
//                       <Edit2 className="w-4 h-4 text-[#64748B]" />
//                     )}
//                   </button>
//                   <button
//                     onClick={() => handleDeleteExperiment(exp.id)}
//                     className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors"
//                   >
//                     <Trash2 className="w-4 h-4 text-[#EF4444]" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}

//           <button
//             onClick={() => setShowAddModal(true)}
//             className="w-full border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 hover:border-[#1E40AF] hover:bg-[#F1F5F9] transition-colors flex items-center justify-center gap-2 text-[#64748B] hover:text-[#1E40AF]"
//           >
//             <Plus className="w-5 h-5" />
//             <span className="text-body">Add experiment</span>
//           </button>
//         </div>

//         <div className="flex flex-col md:flex-row gap-4 justify-center">
//           <Button onClick={handleSave} disabled={saving || experiments.length === 0}>
//             {saving ? 'Saving...' : 'Save & review later'}
//           </Button>
//           <Button variant="secondary" onClick={handleNewSession}>
//             Start new session
//           </Button>
//         </div>

//         <p className="text-meta text-center text-[#64748B] mt-8">
//           Framework-governed coaching - All sessions private - Escalation-ready
//         </p>
//       </main>

//       {showAddModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
//             <h2 className="text-h2 mb-4">Add New Experiment</h2>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-body mb-2 text-[#1E293B]">
//                   What will you try?
//                 </label>
//                 <input
//                   type="text"
//                   value={newExperiment.title}
//                   onChange={(e) => setNewExperiment({ ...newExperiment, title: e.target.value })}
//                   className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
//                   placeholder="e.g., Practice active listening"
//                   autoFocus
//                 />
//               </div>

//               <div>
//                 <label className="block text-body mb-2 text-[#1E293B]">
//                   When will you do this?
//                 </label>
//                 <input
//                   type="text"
//                   value={newExperiment.when}
//                   onChange={(e) => setNewExperiment({ ...newExperiment, when: e.target.value })}
//                   className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
//                   placeholder="e.g., Next team meeting"
//                 />
//               </div>

//               <div>
//                 <label className="block text-body mb-2 text-[#1E293B]">
//                   How will you know it worked?
//                 </label>
//                 <input
//                   type="text"
//                   value={newExperiment.howKnow}
//                   onChange={(e) => setNewExperiment({ ...newExperiment, howKnow: e.target.value })}
//                   className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
//                   placeholder="e.g., Team members share more ideas"
//                 />
//               </div>
//             </div>

//             <div className="flex gap-3 mt-6">
//               <Button onClick={handleAddExperiment} fullWidth disabled={!newExperiment.title.trim()}>
//                 Add Experiment
//               </Button>
//               <Button variant="secondary" onClick={() => setShowAddModal(false)} fullWidth>
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

type ActionItem = {
  id: string;
  description: string;
  completed: boolean;
};

export function ActionPlan() {
  const { profile } = useAuth();
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [newAction, setNewAction] = useState('');

  const storageKey = profile
    ? `actionPlan-${profile.id}`
    : 'actionPlan-guest';

  /* =========================
     Load Saved Plan (Local)
  ========================= */

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setActions(JSON.parse(stored));
      } catch {
        setActions([]);
      }
    }
  }, [storageKey]);

  /* =========================
     Persist Plan
  ========================= */

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(actions));
  }, [actions, storageKey]);

  /* =========================
     Add Action
  ========================= */

  const addAction = () => {
    if (!newAction.trim()) return;

    const action: ActionItem = {
      id: `action-${Date.now()}`,
      description: newAction,
      completed: false,
    };

    setActions([...actions, action]);
    setNewAction('');
  };

  /* =========================
     Toggle Complete
  ========================= */

  const toggleComplete = (id: string) => {
    setActions(
      actions.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    );
  };

  /* =========================
     Delete Action
  ========================= */

  const deleteAction = (id: string) => {
    setActions(actions.filter((a) => a.id !== id));
  };

  /* =========================
     UI
  ========================= */

  return (
    <div style={{ padding: 40 }}>
      <h1>Action Plan</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={newAction}
          onChange={(e) => setNewAction(e.target.value)}
          placeholder="Add new action..."
          style={{ flex: 1 }}
        />
        <button onClick={addAction}>Add</button>
      </div>

      {actions.length === 0 && <p>No actions yet.</p>}

      {actions.map((action) => (
        <div
          key={action.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 10,
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 6,
            backgroundColor: action.completed ? '#e6ffe6' : '#fff',
          }}
        >
          <span
            style={{
              textDecoration: action.completed ? 'line-through' : 'none',
            }}
          >
            {action.description}
          </span>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => toggleComplete(action.id)}>
              {action.completed ? 'Undo' : 'Complete'}
            </button>
            <button onClick={() => deleteAction(action.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

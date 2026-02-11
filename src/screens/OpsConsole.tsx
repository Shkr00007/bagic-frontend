// // // import { useState, useEffect } from 'react';
// // // import { Activity, Database, Settings as SettingsIcon, Save, RotateCcw, FileText, RefreshCw } from 'lucide-react';
// // // import { HRSidebar } from '../components/HRSidebar';
// // // import { Button } from '../components/Button';
// // // import { useAuth } from '../contexts/AuthContext';
// // // import { supabase, AgentPipelineStatus, ErrorLog, FeatureFlag, WorkflowConfig, SystemEnvironment, CoachingSession, ConversationInteraction, ExplainabilityLog, EscalationEvent, GovernanceViolation } from '../lib/supabase';

// // // type OpsConsoleProps = {
// // //   onNavigate: (view: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops') => void;
// // // };

// // // type Tab = 'health' | 'lineage' | 'config';

// // // type SessionLineage = {
// // //   session: CoachingSession | null;
// // //   interactions: ConversationInteraction[];
// // //   explainabilityLogs: ExplainabilityLog[];
// // //   escalations: EscalationEvent[];
// // //   violations: GovernanceViolation[];
// // // };

// // // export function OpsConsole({ onNavigate }: OpsConsoleProps) {
// // //   const { signOut, user } = useAuth();
// // //   const [activeTab, setActiveTab] = useState<Tab>('health');
// // //   const [loading, setLoading] = useState(true);

// // //   const [agents, setAgents] = useState<AgentPipelineStatus[]>([]);
// // //   const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
// // //   const [pipelineMetrics, setPipelineMetrics] = useState({
// // //     evidenceWriteSuccess: 100,
// // //     sqlPerformance: 98,
// // //     activeWorkflows: { 'WF-001': 3, 'WF-002': 1, 'WF-003': 0, 'WF-004': 2 }
// // //   });

// // //   const [sessions, setSessions] = useState<CoachingSession[]>([]);
// // //   const [selectedSessionId, setSelectedSessionId] = useState<string>('');
// // //   const [lineageData, setLineageData] = useState<SessionLineage | null>(null);
// // //   const [expandedLineageItem, setExpandedLineageItem] = useState<string | null>(null);

// // //   const [environment, setEnvironment] = useState<SystemEnvironment | null>(null);
// // //   const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
// // //   const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
// // //   const [hasChanges, setHasChanges] = useState(false);

// // //   useEffect(() => {
// // //     loadData();
// // //   }, [activeTab]);

// // //   const loadData = async () => {
// // //     setLoading(true);

// // //     if (activeTab === 'health') {
// // //       await loadHealthData();
// // //     } else if (activeTab === 'lineage') {
// // //       await loadLineageData();
// // //     } else if (activeTab === 'config') {
// // //       await loadConfigData();
// // //     }

// // //     setLoading(false);
// // //   };

// // //   const loadHealthData = async () => {
// // //     const { data: agentData } = await supabase
// // //       .from('agent_pipeline_status')
// // //       .select('*')
// // //       .order('agent_code', { ascending: true });

// // //     const { data: errorData } = await supabase
// // //       .from('error_logs')
// // //       .select('*')
// // //       .order('occurred_at', { ascending: false })
// // //       .limit(10);

// // //     if (agentData) setAgents(agentData);
// // //     if (errorData) setErrorLogs(errorData);
// // //   };

// // //   const loadLineageData = async () => {
// // //     const { data: sessionData } = await supabase
// // //       .from('coaching_sessions')
// // //       .select('*')
// // //       .order('started_at', { ascending: false })
// // //       .limit(50);

// // //     if (sessionData) {
// // //       setSessions(sessionData);
// // //       if (sessionData.length > 0 && !selectedSessionId) {
// // //         setSelectedSessionId(sessionData[0].id);
// // //       }
// // //     }
// // //   };

// // //   const loadConfigData = async () => {
// // //     const { data: envData } = await supabase
// // //       .from('system_environment')
// // //       .select('*')
// // //       .eq('is_active', true)
// // //       .maybeSingle();

// // //     const { data: flagData } = await supabase
// // //       .from('feature_flags')
// // //       .select('*')
// // //       .order('flag_code', { ascending: true });

// // //     const { data: workflowData } = await supabase
// // //       .from('workflow_configs')
// // //       .select('*')
// // //       .order('workflow_code', { ascending: true });

// // //     if (envData) setEnvironment(envData);
// // //     if (flagData) setFeatureFlags(flagData);
// // //     if (workflowData) setWorkflows(workflowData);
// // //   };

// // //   const loadSessionLineage = async (sessionId: string) => {
// // //     const { data: sessionData } = await supabase
// // //       .from('coaching_sessions')
// // //       .select('*')
// // //       .eq('id', sessionId)
// // //       .maybeSingle();

// // //     const { data: interactionData } = await supabase
// // //       .from('conversation_interactions')
// // //       .select('*')
// // //       .eq('session_id', sessionId)
// // //       .order('interaction_number', { ascending: true });

// // //     const { data: explainData } = await supabase
// // //       .from('explainability_logs')
// // //       .select('*')
// // //       .eq('session_id', sessionId);

// // //     const { data: escalationData } = await supabase
// // //       .from('escalation_events')
// // //       .select('*')
// // //       .eq('session_id', sessionId);

// // //     const { data: violationData } = await supabase
// // //       .from('governance_violations')
// // //       .select('*')
// // //       .eq('session_id', sessionId);

// // //     setLineageData({
// // //       session: sessionData || null,
// // //       interactions: interactionData || [],
// // //       explainabilityLogs: explainData || [],
// // //       escalations: escalationData || [],
// // //       violations: violationData || []
// // //     });
// // //   };

// // //   useEffect(() => {
// // //     if (selectedSessionId && activeTab === 'lineage') {
// // //       loadSessionLineage(selectedSessionId);
// // //     }
// // //   }, [selectedSessionId, activeTab]);

// // //   const handleFlagToggle = (flagCode: string) => {
// // //     setFeatureFlags(prev => prev.map(flag =>
// // //       flag.flag_code === flagCode ? { ...flag, is_enabled: !flag.is_enabled } : flag
// // //     ));
// // //     setHasChanges(true);
// // //   };

// // //   const handleWorkflowToggle = (workflowCode: string) => {
// // //     setWorkflows(prev => prev.map(wf =>
// // //       wf.workflow_code === workflowCode ? { ...wf, is_enabled: !wf.is_enabled } : wf
// // //     ));
// // //     setHasChanges(true);
// // //   };

// // //   const handleSaveConfig = async () => {
// // //     for (const flag of featureFlags) {
// // //       await supabase
// // //         .from('feature_flags')
// // //         .update({
// // //           is_enabled: flag.is_enabled,
// // //           last_changed_by: user?.id,
// // //           last_changed_at: new Date().toISOString()
// // //         })
// // //         .eq('flag_code', flag.flag_code);

// // //       await supabase
// // //         .from('config_audit_log')
// // //         .insert({
// // //           change_type: 'FEATURE_FLAG',
// // //           entity_code: flag.flag_code,
// // //           new_value: { is_enabled: flag.is_enabled },
// // //           changed_by: user?.id,
// // //           reason: 'Ops console configuration update'
// // //         });
// // //     }

// // //     for (const wf of workflows) {
// // //       await supabase
// // //         .from('workflow_configs')
// // //         .update({
// // //           is_enabled: wf.is_enabled,
// // //           last_changed_by: user?.id,
// // //           last_changed_at: new Date().toISOString()
// // //         })
// // //         .eq('workflow_code', wf.workflow_code);

// // //       await supabase
// // //         .from('config_audit_log')
// // //         .insert({
// // //           change_type: 'WORKFLOW',
// // //           entity_code: wf.workflow_code,
// // //           new_value: { is_enabled: wf.is_enabled },
// // //           changed_by: user?.id,
// // //           reason: 'Ops console configuration update'
// // //         });
// // //     }

// // //     setHasChanges(false);
// // //     await loadConfigData();
// // //   };

// // //   const getStatusIcon = (status: string) => {
// // //     if (status === 'OK') return '🟢';
// // //     if (status === 'WARN') return '🟡';
// // //     return '🔴';
// // //   };

// // //   const formatLatency = (ms: number) => {
// // //     if (ms < 1000) return `${Math.round(ms)}ms`;
// // //     return `${(ms / 1000).toFixed(1)}s`;
// // //   };

// // //   const getSeverityColor = (severity: string) => {
// // //     if (severity === 'INFO') return 'text-[#64748B]';
// // //     if (severity === 'WARN') return 'text-[#F59E0B]';
// // //     if (severity === 'ERROR') return 'text-[#EF4444]';
// // //     return 'text-[#DC2626]';
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-[#F8FAFC] pl-64">
// // //       <HRSidebar currentView="ops" onNavigate={onNavigate} onSignOut={signOut} />

// // //       <main className="p-8">
// // //         <div className="max-w-[1600px] mx-auto">
// // //           <div className="mb-8">
// // //             <h1 className="text-h1 mb-2">Operations Console</h1>
// // //             <p className="text-body text-[#64748B]">System health, data lineage, and configuration</p>
// // //           </div>

// // //           <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] mb-6">
// // //             <div className="flex border-b border-[#E2E8F0]">
// // //               <button
// // //                 onClick={() => setActiveTab('health')}
// // //                 className={`flex items-center gap-2 px-6 py-4 text-body font-medium transition-colors ${
// // //                   activeTab === 'health'
// // //                     ? 'border-b-2 border-[#1E40AF] text-[#1E40AF]'
// // //                     : 'text-[#64748B] hover:text-[#1E293B]'
// // //                 }`}
// // //               >
// // //                 <Activity className="w-5 h-5" />
// // //                 Health
// // //               </button>
// // //               <button
// // //                 onClick={() => setActiveTab('lineage')}
// // //                 className={`flex items-center gap-2 px-6 py-4 text-body font-medium transition-colors ${
// // //                   activeTab === 'lineage'
// // //                     ? 'border-b-2 border-[#1E40AF] text-[#1E40AF]'
// // //                     : 'text-[#64748B] hover:text-[#1E293B]'
// // //                 }`}
// // //               >
// // //                 <Database className="w-5 h-5" />
// // //                 Lineage
// // //               </button>
// // //               <button
// // //                 onClick={() => setActiveTab('config')}
// // //                 className={`flex items-center gap-2 px-6 py-4 text-body font-medium transition-colors ${
// // //                   activeTab === 'config'
// // //                     ? 'border-b-2 border-[#1E40AF] text-[#1E40AF]'
// // //                     : 'text-[#64748B] hover:text-[#1E293B]'
// // //                 }`}
// // //               >
// // //                 <SettingsIcon className="w-5 h-5" />
// // //                 Config
// // //               </button>
// // //             </div>

// // //             <div className="p-6">
// // //               {loading ? (
// // //                 <div className="text-center py-12">
// // //                   <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
// // //                   <p className="text-body text-[#64748B]">Loading...</p>
// // //                 </div>
// // //               ) : (
// // //                 <>
// // //                   {activeTab === 'health' && (
// // //                     <>
// // //                       <div className="flex items-center justify-between mb-6">
// // //                         <h2 className="text-h2">Agent Pipeline Status</h2>
// // //                         <Button variant="secondary" onClick={loadHealthData}>
// // //                           <RefreshCw className="w-4 h-4 mr-2 inline" />
// // //                           Refresh
// // //                         </Button>
// // //                       </div>

// // //                       <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden mb-8">
// // //                         <table className="w-full">
// // //                           <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
// // //                             <tr>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Agent</th>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Status</th>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Latency</th>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Error Rate</th>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Sessions</th>
// // //                             </tr>
// // //                           </thead>
// // //                           <tbody>
// // //                             {agents.map((agent) => (
// // //                               <tr key={agent.id} className="border-b border-[#E2E8F0] last:border-0">
// // //                                 <td className="px-6 py-4">
// // //                                   <div className="text-body font-medium text-[#1E293B]">{agent.agent_code}</div>
// // //                                   <div className="text-caption text-[#64748B]">{agent.agent_name}</div>
// // //                                 </td>
// // //                                 <td className="px-6 py-4">
// // //                                   <span className="text-body">{getStatusIcon(agent.status)} {agent.status}</span>
// // //                                 </td>
// // //                                 <td className="px-6 py-4 text-body text-[#1E293B]">{formatLatency(agent.latency_ms)}</td>
// // //                                 <td className="px-6 py-4 text-body text-[#1E293B]">{agent.error_rate}%</td>
// // //                                 <td className="px-6 py-4 text-body text-[#1E293B]">{agent.session_count}</td>
// // //                               </tr>
// // //                             ))}
// // //                           </tbody>
// // //                         </table>
// // //                       </div>

// // //                       <h3 className="text-h3 mb-4">Pipeline Metrics</h3>
// // //                       <div className="grid grid-cols-3 gap-6 mb-8">
// // //                         <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                           <div className="text-caption text-[#64748B] mb-2">Evidence Tables</div>
// // //                           <div className="text-h1 text-[#10B981]">{pipelineMetrics.evidenceWriteSuccess}%</div>
// // //                           <div className="text-caption text-[#64748B]">write success</div>
// // //                         </div>
// // //                         <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                           <div className="text-caption text-[#64748B] mb-2">SQL Queries</div>
// // //                           <div className="text-h1 text-[#10B981]">{pipelineMetrics.sqlPerformance}%</div>
// // //                           <div className="text-caption text-[#64748B]">&lt;500ms</div>
// // //                         </div>
// // //                         <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                           <div className="text-caption text-[#64748B] mb-2">Active Workflows</div>
// // //                           <div className="text-body text-[#1E293B] space-y-1">
// // //                             {Object.entries(pipelineMetrics.activeWorkflows).map(([wf, count]) => (
// // //                               <div key={wf}>{wf} ({count})</div>
// // //                             ))}
// // //                           </div>
// // //                         </div>
// // //                       </div>

// // //                       <h3 className="text-h3 mb-4">Live Error Log (Last 10)</h3>
// // //                       <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
// // //                         <table className="w-full">
// // //                           <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
// // //                             <tr>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Time</th>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Severity</th>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Code</th>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Message</th>
// // //                               <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Agent</th>
// // //                             </tr>
// // //                           </thead>
// // //                           <tbody>
// // //                             {errorLogs.map((log) => (
// // //                               <tr key={log.id} className="border-b border-[#E2E8F0] last:border-0">
// // //                                 <td className="px-6 py-4 text-caption text-[#64748B]">
// // //                                   {new Date(log.occurred_at).toLocaleTimeString()}
// // //                                 </td>
// // //                                 <td className={`px-6 py-4 text-body font-medium ${getSeverityColor(log.severity)}`}>
// // //                                   {log.severity}
// // //                                 </td>
// // //                                 <td className="px-6 py-4 text-body text-[#1E293B]">{log.error_code}</td>
// // //                                 <td className="px-6 py-4 text-body text-[#1E293B]">{log.error_message}</td>
// // //                                 <td className="px-6 py-4 text-body text-[#64748B]">{log.agent_code || '-'}</td>
// // //                               </tr>
// // //                             ))}
// // //                           </tbody>
// // //                         </table>
// // //                       </div>
// // //                     </>
// // //                   )}

// // //                   {activeTab === 'lineage' && (
// // //                     <>
// // //                       <h2 className="text-h2 mb-6">Data Lineage Explorer</h2>

// // //                       <div className="mb-6">
// // //                         <label className="block text-body text-[#64748B] mb-2">Select Session:</label>
// // //                         <select
// // //                           value={selectedSessionId}
// // //                           onChange={(e) => setSelectedSessionId(e.target.value)}
// // //                           className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
// // //                         >
// // //                           {sessions.map((session) => (
// // //                             <option key={session.id} value={session.id}>
// // //                               {session.session_code} - {session.framework_type} - {new Date(session.started_at).toLocaleString()}
// // //                             </option>
// // //                           ))}
// // //                         </select>
// // //                       </div>

// // //                       {lineageData && (
// // //                         <div className="space-y-4">
// // //                           <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                             <div className="flex items-center gap-3 mb-2">
// // //                               <div className="text-body font-medium text-[#1E293B]">EmployeeProfile (BO-001)</div>
// // //                               <div className="text-h2 text-[#10B981]">✓</div>
// // //                             </div>
// // //                             {expandedLineageItem === 'profile' && lineageData.session && (
// // //                               <pre className="text-caption bg-[#F8FAFC] p-4 rounded mt-4 overflow-auto">
// // //                                 {JSON.stringify(lineageData.session, null, 2)}
// // //                               </pre>
// // //                             )}
// // //                             <button
// // //                               onClick={() => setExpandedLineageItem(expandedLineageItem === 'profile' ? null : 'profile')}
// // //                               className="text-caption text-[#1E40AF] mt-2"
// // //                             >
// // //                               {expandedLineageItem === 'profile' ? 'Hide JSON' : 'Show JSON'}
// // //                             </button>
// // //                           </div>

// // //                           <div className="flex items-center justify-center text-[#64748B]">↓</div>

// // //                           <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                             <div className="flex items-center gap-3 mb-2">
// // //                               <div className="text-body font-medium text-[#1E293B]">CoachingSession (BT-001)</div>
// // //                               <div className="text-h2 text-[#10B981]">✓</div>
// // //                             </div>
// // //                           </div>

// // //                           <div className="flex items-center justify-center text-[#64748B]">↓</div>

// // //                           <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                             <div className="flex items-center gap-3 mb-2">
// // //                               <div className="text-body font-medium text-[#1E293B]">ConversationInteractions (BT-002)</div>
// // //                               <div className="text-h2 text-[#10B981]">✓</div>
// // //                               <div className="text-body text-[#64748B] font-medium">{lineageData.interactions.length} interactions</div>
// // //                             </div>
// // //                           </div>

// // //                           <div className="flex items-center justify-center text-[#64748B]">↓</div>

// // //                           <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                             <div className="flex items-center gap-3 mb-2">
// // //                               <div className="text-body font-medium text-[#1E293B]">ExplainabilityLogs (BT-003)</div>
// // //                               <div className="text-h2 text-[#10B981]">✓</div>
// // //                               <div className="text-body text-[#64748B] font-medium">
// // //                                 {lineageData.explainabilityLogs.length > 0 ? '100% complete' : 'No logs'}
// // //                               </div>
// // //                             </div>
// // //                           </div>

// // //                           <div className="flex items-center justify-center text-[#64748B]">↓</div>

// // //                           <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                             <div className="flex items-center gap-3 mb-2">
// // //                               <div className="text-body font-medium text-[#1E293B]">EscalationEvents (BT-004)</div>
// // //                               {lineageData.escalations.length > 0 ? (
// // //                                 <>
// // //                                   <div className="text-h2 text-[#10B981]">✓</div>
// // //                                   <div className="text-body text-[#64748B] font-medium">{lineageData.escalations.length} events</div>
// // //                                 </>
// // //                               ) : (
// // //                                 <>
// // //                                   <div className="text-h2 text-[#64748B]">☐</div>
// // //                                   <div className="text-body text-[#64748B] font-medium">Not triggered</div>
// // //                                 </>
// // //                               )}
// // //                             </div>
// // //                           </div>

// // //                           <div className="flex items-center justify-center text-[#64748B]">↓</div>

// // //                           <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                             <div className="flex items-center gap-3 mb-2">
// // //                               <div className="text-body font-medium text-[#1E293B]">GovernanceViolations (BT-005)</div>
// // //                               {lineageData.violations.length > 0 ? (
// // //                                 <>
// // //                                   <div className="text-h2 text-[#EF4444]">✗</div>
// // //                                   <div className="text-body text-[#EF4444] font-medium">{lineageData.violations.length} violations</div>
// // //                                 </>
// // //                               ) : (
// // //                                 <>
// // //                                   <div className="text-h2 text-[#10B981]">✓</div>
// // //                                   <div className="text-body text-[#10B981] font-medium">Clean</div>
// // //                                 </>
// // //                               )}
// // //                             </div>
// // //                           </div>
// // //                         </div>
// // //                       )}
// // //                     </>
// // //                   )}

// // //                   {activeTab === 'config' && (
// // //                     <>
// // //                       <div className="flex items-center justify-between mb-6">
// // //                         <h2 className="text-h2">Configuration & Flags</h2>
// // //                         {hasChanges && (
// // //                           <div className="flex gap-3">
// // //                             <Button variant="secondary" onClick={loadConfigData}>
// // //                               <RotateCcw className="w-4 h-4 mr-2 inline" />
// // //                               Rollback
// // //                             </Button>
// // //                             <Button variant="primary" onClick={handleSaveConfig}>
// // //                               <Save className="w-4 h-4 mr-2 inline" />
// // //                               Save
// // //                             </Button>
// // //                           </div>
// // //                         )}
// // //                       </div>

// // //                       <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 mb-6">
// // //                         <h3 className="text-h3 mb-4">Environment</h3>
// // //                         <div className="flex items-center gap-4">
// // //                           <span className="text-body text-[#64748B]">Current:</span>
// // //                           <span className="text-body font-medium text-[#1E293B] bg-[#F1F5F9] px-4 py-2 rounded">
// // //                             {environment?.environment || 'POC'}
// // //                           </span>
// // //                         </div>
// // //                       </div>

// // //                       <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 mb-6">
// // //                         <h3 className="text-h3 mb-4">Feature Flags</h3>
// // //                         <div className="space-y-3">
// // //                           {featureFlags.map((flag) => (
// // //                             <div key={flag.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
// // //                               <div className="flex-1">
// // //                                 <div className="text-body font-medium text-[#1E293B] mb-1">{flag.flag_name}</div>
// // //                                 <div className="text-caption text-[#64748B]">{flag.description}</div>
// // //                               </div>
// // //                               <label className="flex items-center gap-3 cursor-pointer">
// // //                                 <input
// // //                                   type="checkbox"
// // //                                   checked={flag.is_enabled}
// // //                                   onChange={() => handleFlagToggle(flag.flag_code)}
// // //                                   className="w-5 h-5 rounded border-[#E2E8F0] text-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]"
// // //                                 />
// // //                                 <span className="text-body text-[#64748B]">
// // //                                   {flag.is_enabled ? 'Enabled' : 'Disabled'}
// // //                                 </span>
// // //                               </label>
// // //                             </div>
// // //                           ))}
// // //                         </div>
// // //                       </div>

// // //                       <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
// // //                         <h3 className="text-h3 mb-4">Workflow Overrides</h3>
// // //                         <div className="space-y-3">
// // //                           {workflows.map((wf) => (
// // //                             <div key={wf.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
// // //                               <div className="flex-1">
// // //                                 <div className="text-body font-medium text-[#1E293B] mb-1">
// // //                                   {wf.workflow_code}: {wf.workflow_name}
// // //                                 </div>
// // //                                 <div className="text-caption text-[#64748B]">Active instances: {wf.active_count}</div>
// // //                               </div>
// // //                               <label className="flex items-center gap-3 cursor-pointer">
// // //                                 <input
// // //                                   type="checkbox"
// // //                                   checked={wf.is_enabled}
// // //                                   onChange={() => handleWorkflowToggle(wf.workflow_code)}
// // //                                   className="w-5 h-5 rounded border-[#E2E8F0] text-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]"
// // //                                 />
// // //                                 <span className="text-body text-[#64748B]">
// // //                                   {wf.is_enabled ? 'Enabled' : 'Disabled'}
// // //                                 </span>
// // //                               </label>
// // //                             </div>
// // //                           ))}
// // //                         </div>
// // //                       </div>
// // //                     </>
// // //                   )}
// // //                 </>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </main>
// // //     </div>
// // //   );
// // // }
// // import { useState, useEffect, useCallback } from 'react';
// // import {
// //   Activity,
// //   Database,
// //   Settings as SettingsIcon,
// //   Save,
// //   RotateCcw,
// //   RefreshCw
// // } from 'lucide-react';
// // import { HRSidebar } from '../components/HRSidebar';
// // import { Button } from '../components/Button';
// // import { useAuth } from '../contexts/AuthContext';
// // import {
// //   supabase,
// //   AgentPipelineStatus,
// //   ErrorLog,
// //   FeatureFlag,
// //   WorkflowConfig,
// //   SystemEnvironment,
// //   CoachingSession,
// //   ConversationInteraction,
// //   ExplainabilityLog,
// //   EscalationEvent,
// //   GovernanceViolation
// // } from '../lib/supabase';

// // type Tab = 'health' | 'lineage' | 'config';

// // type SessionLineage = {
// //   session: CoachingSession | null;
// //   interactions: ConversationInteraction[];
// //   explainabilityLogs: ExplainabilityLog[];
// //   escalations: EscalationEvent[];
// //   violations: GovernanceViolation[];
// // };

// // export function OpsConsole({ onNavigate }: any) {
// //   const { signOut, user } = useAuth();

// //   const [activeTab, setActiveTab] = useState<Tab>('health');
// //   const [loading, setLoading] = useState(false);
// //   const [saving, setSaving] = useState(false);

// //   const [agents, setAgents] = useState<AgentPipelineStatus[]>([]);
// //   const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

// //   const [sessions, setSessions] = useState<CoachingSession[]>([]);
// //   const [selectedSessionId, setSelectedSessionId] = useState('');
// //   const [lineageData, setLineageData] = useState<SessionLineage | null>(null);

// //   const [environment, setEnvironment] = useState<SystemEnvironment | null>(null);
// //   const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
// //   const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
// //   const [hasChanges, setHasChanges] = useState(false);

// //   /* ===============================
// //      LOADERS
// //   =============================== */

// //   const loadHealthData = useCallback(async () => {
// //     try {
// //       setLoading(true);

// //       const [agentsRes, errorsRes] = await Promise.all([
// //         supabase
// //           .from('agent_pipeline_status')
// //           .select('*')
// //           .order('agent_code', { ascending: true }),

// //         supabase
// //           .from('error_logs')
// //           .select('*')
// //           .order('occurred_at', { ascending: false })
// //           .limit(10)
// //       ]);

// //       if (agentsRes.error) throw agentsRes.error;
// //       if (errorsRes.error) throw errorsRes.error;

// //       setAgents(agentsRes.data || []);
// //       setErrorLogs(errorsRes.data || []);
// //     } catch (error) {
// //       console.error('Health Load Error:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   const loadLineageData = useCallback(async () => {
// //     try {
// //       setLoading(true);

// //       const { data, error } = await supabase
// //         .from('coaching_sessions')
// //         .select('*')
// //         .order('started_at', { ascending: false })
// //         .limit(50);

// //       if (error) throw error;

// //       setSessions(data || []);
// //       if (data && data.length > 0) {
// //         setSelectedSessionId(data[0].id);
// //       }
// //     } catch (error) {
// //       console.error('Lineage Load Error:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   const loadSessionLineage = useCallback(async (sessionId: string) => {
// //     try {
// //       setLoading(true);

// //       const [
// //         sessionRes,
// //         interactionsRes,
// //         explainRes,
// //         escalationRes,
// //         violationRes
// //       ] = await Promise.all([
// //         supabase.from('coaching_sessions').select('*').eq('id', sessionId).maybeSingle(),
// //         supabase.from('conversation_interactions').select('*').eq('session_id', sessionId),
// //         supabase.from('explainability_logs').select('*').eq('session_id', sessionId),
// //         supabase.from('escalation_events').select('*').eq('session_id', sessionId),
// //         supabase.from('governance_violations').select('*').eq('session_id', sessionId)
// //       ]);

// //       if (sessionRes.error) throw sessionRes.error;

// //       setLineageData({
// //         session: sessionRes.data,
// //         interactions: interactionsRes.data || [],
// //         explainabilityLogs: explainRes.data || [],
// //         escalations: escalationRes.data || [],
// //         violations: violationRes.data || []
// //       });
// //     } catch (error) {
// //       console.error('Session Lineage Error:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   const loadConfigData = useCallback(async () => {
// //     try {
// //       setLoading(true);

// //       const [envRes, flagsRes, workflowsRes] = await Promise.all([
// //         supabase.from('system_environment').select('*').eq('is_active', true).maybeSingle(),
// //         supabase.from('feature_flags').select('*').order('flag_code'),
// //         supabase.from('workflow_configs').select('*').order('workflow_code')
// //       ]);

// //       if (envRes.error) throw envRes.error;

// //       setEnvironment(envRes.data);
// //       setFeatureFlags(flagsRes.data || []);
// //       setWorkflows(workflowsRes.data || []);
// //     } catch (error) {
// //       console.error('Config Load Error:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   /* ===============================
// //      TAB EFFECT
// //   =============================== */

// //   useEffect(() => {
// //     if (activeTab === 'health') loadHealthData();
// //     if (activeTab === 'lineage') loadLineageData();
// //     if (activeTab === 'config') loadConfigData();
// //   }, [activeTab, loadHealthData, loadLineageData, loadConfigData]);

// //   useEffect(() => {
// //     if (selectedSessionId && activeTab === 'lineage') {
// //       loadSessionLineage(selectedSessionId);
// //     }
// //   }, [selectedSessionId, activeTab, loadSessionLineage]);

// //   /* ===============================
// //      CONFIG ACTIONS
// //   =============================== */

// //   const handleFlagToggle = (code: string) => {
// //     setFeatureFlags(prev =>
// //       prev.map(f =>
// //         f.flag_code === code ? { ...f, is_enabled: !f.is_enabled } : f
// //       )
// //     );
// //     setHasChanges(true);
// //   };

// //   const handleWorkflowToggle = (code: string) => {
// //     setWorkflows(prev =>
// //       prev.map(w =>
// //         w.workflow_code === code ? { ...w, is_enabled: !w.is_enabled } : w
// //       )
// //     );
// //     setHasChanges(true);
// //   };

// //   const handleSaveConfig = async () => {
// //     try {
// //       setSaving(true);

// //       await Promise.all([
// //         ...featureFlags.map(flag =>
// //           supabase
// //             .from('feature_flags')
// //             .update({
// //               is_enabled: flag.is_enabled,
// //               last_changed_by: user?.id,
// //               last_changed_at: new Date().toISOString()
// //             })
// //             .eq('flag_code', flag.flag_code)
// //         ),

// //         ...workflows.map(wf =>
// //           supabase
// //             .from('workflow_configs')
// //             .update({
// //               is_enabled: wf.is_enabled,
// //               last_changed_by: user?.id,
// //               last_changed_at: new Date().toISOString()
// //             })
// //             .eq('workflow_code', wf.workflow_code)
// //         )
// //       ]);

// //       setHasChanges(false);
// //       await loadConfigData();
// //     } catch (error) {
// //       console.error('Save Config Error:', error);
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   /* ===============================
// //      UI HELPERS
// //   =============================== */

// //   const getStatusIcon = (status: string) =>
// //     status === 'OK' ? '🟢' : status === 'WARN' ? '🟡' : '🔴';

// //   /* ===============================
// //      RENDER
// //   =============================== */

// //   return (
// //     <div className="min-h-screen bg-[#F8FAFC] pl-64">
// //       <HRSidebar currentView="ops" onNavigate={onNavigate} onSignOut={signOut} />

// //       <main className="p-8">
// //         <h1 className="text-2xl font-semibold mb-6">Operations Console</h1>

// //         {/* Tabs */}
// //         <div className="flex gap-4 mb-6">
// //           <Button variant="secondary" onClick={() => setActiveTab('health')}>
// //             <Activity className="w-4 h-4 mr-2" /> Health
// //           </Button>
// //           <Button variant="secondary" onClick={() => setActiveTab('lineage')}>
// //             <Database className="w-4 h-4 mr-2" /> Lineage
// //           </Button>
// //           <Button variant="secondary" onClick={() => setActiveTab('config')}>
// //             <SettingsIcon className="w-4 h-4 mr-2" /> Config
// //           </Button>
// //         </div>

// //         {loading && <p>Loading...</p>}

// //         {/* HEALTH */}
// //         {activeTab === 'health' && !loading && (
// //           <>
// //             <div className="mb-4 flex justify-between">
// //               <h2 className="text-lg font-medium">Agent Pipeline</h2>
// //               <Button variant="secondary" onClick={loadHealthData}>
// //                 <RefreshCw className="w-4 h-4 mr-2" /> Refresh
// //               </Button>
// //             </div>

// //             {agents.map(agent => (
// //               <div key={agent.id} className="p-4 bg-white rounded mb-3 shadow">
// //                 {getStatusIcon(agent.status)} {agent.agent_name}
// //               </div>
// //             ))}
// //           </>
// //         )}

// //         {/* LINEAGE */}
// //         {activeTab === 'lineage' && !loading && (
// //           <>
// //             <select
// //               value={selectedSessionId}
// //               onChange={e => setSelectedSessionId(e.target.value)}
// //               className="mb-4 p-2 border rounded"
// //             >
// //               {sessions.map(s => (
// //                 <option key={s.id} value={s.id}>
// //                   {s.session_code}
// //                 </option>
// //               ))}
// //             </select>

// //             {lineageData && (
// //               <pre className="bg-white p-4 rounded shadow text-xs overflow-auto">
// //                 {JSON.stringify(lineageData, null, 2)}
// //               </pre>
// //             )}
// //           </>
// //         )}

// //         {/* CONFIG */}
// //         {activeTab === 'config' && !loading && (
// //           <>
// //             {featureFlags.map(flag => (
// //               <div key={flag.id} className="flex justify-between p-3 bg-white rounded mb-2">
// //                 <span>{flag.flag_name}</span>
// //                 <input
// //                   type="checkbox"
// //                   checked={flag.is_enabled}
// //                   onChange={() => handleFlagToggle(flag.flag_code)}
// //                 />
// //               </div>
// //             ))}

// //             {hasChanges && (
// //               <div className="mt-4">
// //                 <Button variant="primary" onClick={handleSaveConfig} disabled={saving}>
// //                   <Save className="w-4 h-4 mr-2" />
// //                   {saving ? 'Saving...' : 'Save Changes'}
// //                 </Button>
// //               </div>
// //             )}
// //           </>
// //         )}
// //       </main>
// //     </div>
// //   );
// // }
// import { useState, useEffect } from "react";
// import {
//   Activity,
//   Database,
//   Settings as SettingsIcon,
//   Save,
//   RotateCcw,
//   RefreshCw,
// } from "lucide-react";

// type Tab = "health" | "lineage" | "config";

// export function OpsConsole({ onNavigate }: any) {
//   const [activeTab, setActiveTab] = useState<Tab>("health");
//   const [loading, setLoading] = useState(false);
//   const [hasChanges, setHasChanges] = useState(false);

//   const [agents, setAgents] = useState<any[]>([]);
//   const [errorLogs, setErrorLogs] = useState<any[]>([]);
//   const [sessions, setSessions] = useState<any[]>([]);
//   const [selectedSessionId, setSelectedSessionId] = useState("");
//   const [featureFlags, setFeatureFlags] = useState<any[]>([]);
//   const [workflows, setWorkflows] = useState<any[]>([]);

//   /* ================= MOCK LOADERS ================= */

//   const loadHealthData = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setAgents([
//         {
//           id: "1",
//           agent_code: "AG-001",
//           agent_name: "Coaching Agent",
//           status: "OK",
//           latency_ms: 320,
//           error_rate: 0.5,
//           session_count: 24,
//         },
//         {
//           id: "2",
//           agent_code: "AG-002",
//           agent_name: "Escalation Agent",
//           status: "WARN",
//           latency_ms: 780,
//           error_rate: 2.1,
//           session_count: 12,
//         },
//       ]);

//       setErrorLogs([
//         {
//           id: "1",
//           occurred_at: new Date().toISOString(),
//           severity: "WARN",
//           error_code: "E-101",
//           error_message: "Latency spike detected",
//           agent_code: "AG-002",
//         },
//       ]);

//       setLoading(false);
//     }, 500);
//   };

//   const loadLineageData = () => {
//     setLoading(true);
//     setTimeout(() => {
//       const mockSessions = [
//         {
//           id: "S-001",
//           session_code: "SESSION-001",
//           framework_type: "GROW",
//           started_at: new Date().toISOString(),
//         },
//       ];

//       setSessions(mockSessions);
//       setSelectedSessionId(mockSessions[0].id);
//       setLoading(false);
//     }, 400);
//   };

//   const loadConfigData = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setFeatureFlags([
//         {
//           id: "F-001",
//           flag_code: "AI_COACHING",
//           flag_name: "AI Coaching Enabled",
//           description: "Enable AI coaching workflows",
//           is_enabled: true,
//         },
//         {
//           id: "F-002",
//           flag_code: "AUTO_ESCALATE",
//           flag_name: "Auto Escalation",
//           description: "Automatically escalate high-risk sessions",
//           is_enabled: false,
//         },
//       ]);

//       setWorkflows([
//         {
//           id: "W-001",
//           workflow_code: "WF-001",
//           workflow_name: "Performance Review",
//           active_count: 3,
//           is_enabled: true,
//         },
//       ]);

//       setLoading(false);
//     }, 400);
//   };

//   /* ================= EFFECT ================= */

//   useEffect(() => {
//     if (activeTab === "health") loadHealthData();
//     if (activeTab === "lineage") loadLineageData();
//     if (activeTab === "config") loadConfigData();
//   }, [activeTab]);

//   /* ================= HELPERS ================= */

//   const getStatusIcon = (status: string) => {
//     if (status === "OK") return "🟢";
//     if (status === "WARN") return "🟡";
//     return "🔴";
//   };

//   const handleFlagToggle = (code: string) => {
//     setFeatureFlags((prev) =>
//       prev.map((f) =>
//         f.flag_code === code ? { ...f, is_enabled: !f.is_enabled } : f
//       )
//     );
//     setHasChanges(true);
//   };

//   const handleWorkflowToggle = (code: string) => {
//     setWorkflows((prev) =>
//       prev.map((w) =>
//         w.workflow_code === code ? { ...w, is_enabled: !w.is_enabled } : w
//       )
//     );
//     setHasChanges(true);
//   };

//   const handleSave = () => {
//     setHasChanges(false);
//     alert("Mock configuration saved ✅");
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] p-8">
//       <h1 className="text-2xl font-semibold mb-6">Operations Console</h1>

//       {/* Tabs */}
//       <div className="flex gap-4 mb-6">
//         <button onClick={() => setActiveTab("health")}>
//           <Activity className="inline w-4 h-4 mr-1" /> Health
//         </button>
//         <button onClick={() => setActiveTab("lineage")}>
//           <Database className="inline w-4 h-4 mr-1" /> Lineage
//         </button>
//         <button onClick={() => setActiveTab("config")}>
//           <SettingsIcon className="inline w-4 h-4 mr-1" /> Config
//         </button>
//       </div>

//       {loading && <p>Loading...</p>}

//       {/* ================= HEALTH ================= */}
//       {activeTab === "health" && !loading && (
//         <>
//           <button onClick={loadHealthData} className="mb-4">
//             <RefreshCw className="inline w-4 h-4 mr-1" />
//             Refresh
//           </button>

//           {agents.map((agent) => (
//             <div key={agent.id} className="bg-white p-4 rounded shadow mb-3">
//               <div className="font-medium">
//                 {getStatusIcon(agent.status)} {agent.agent_name}
//               </div>
//               <div>Latency: {agent.latency_ms}ms</div>
//               <div>Error Rate: {agent.error_rate}%</div>
//               <div>Sessions: {agent.session_count}</div>
//             </div>
//           ))}

//           <h3 className="mt-6 font-semibold">Recent Errors</h3>
//           {errorLogs.map((log) => (
//             <div key={log.id} className="bg-white p-3 rounded shadow mt-2">
//               {log.severity} - {log.error_message}
//             </div>
//           ))}
//         </>
//       )}

//       {/* ================= LINEAGE ================= */}
//       {activeTab === "lineage" && !loading && (
//         <>
//           <select
//             value={selectedSessionId}
//             onChange={(e) => setSelectedSessionId(e.target.value)}
//             className="mb-4 p-2 border rounded"
//           >
//             {sessions.map((s) => (
//               <option key={s.id} value={s.id}>
//                 {s.session_code}
//               </option>
//             ))}
//           </select>

//           <div className="bg-white p-4 rounded shadow">
//             <p>Mock Lineage Flow:</p>
//             <p>EmployeeProfile → CoachingSession → ConversationInteractions → Governance</p>
//           </div>
//         </>
//       )}

//       {/* ================= CONFIG ================= */}
//       {activeTab === "config" && !loading && (
//         <>
//           <h3 className="font-semibold mb-2">Feature Flags</h3>
//           {featureFlags.map((flag) => (
//             <div key={flag.id} className="flex justify-between bg-white p-3 rounded mb-2 shadow">
//               <span>{flag.flag_name}</span>
//               <input
//                 type="checkbox"
//                 checked={flag.is_enabled}
//                 onChange={() => handleFlagToggle(flag.flag_code)}
//               />
//             </div>
//           ))}

//           <h3 className="font-semibold mt-4 mb-2">Workflows</h3>
//           {workflows.map((wf) => (
//             <div key={wf.id} className="flex justify-between bg-white p-3 rounded mb-2 shadow">
//               <span>{wf.workflow_name}</span>
//               <input
//                 type="checkbox"
//                 checked={wf.is_enabled}
//                 onChange={() => handleWorkflowToggle(wf.workflow_code)}
//               />
//             </div>
//           ))}

//           {hasChanges && (
//             <button
//               onClick={handleSave}
//               className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
//             >
//               <Save className="inline w-4 h-4 mr-1" />
//               Save Changes
//             </button>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCoaching } from '../contexts/CoachingContext';

export function OpsConsole() {
  const { profile } = useAuth();
  const { activeSession } = useCoaching();

  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  /* =========================
     Load stored sessions (local only)
  ========================= */

  useEffect(() => {
    const stored = sessionStorage.getItem('activeCoachingSession');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionHistory([parsed]);
      } catch {
        setSessionHistory([]);
      }
    }
  }, []);

  /* =========================
     Access Guard (Admin Only)
  ========================= */

  if (!profile?.is_admin) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view Ops Console.</p>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <div style={{ padding: 40 }}>
      <h1>Operations Console</h1>

      <div style={{ marginTop: 30 }}>
        <h2>Active Session</h2>
        {activeSession ? (
          <div style={cardStyle}>
            <p><strong>Session ID:</strong> {activeSession.sessionId}</p>
            <p><strong>Status:</strong> {activeSession.sessionStatus}</p>
            <p><strong>Framework:</strong> {activeSession.framework_type}</p>
            <p><strong>Current Stage:</strong> {activeSession.current_stage}</p>
            <p><strong>Messages:</strong> {activeSession.transcript.length}</p>
          </div>
        ) : (
          <p>No active session.</p>
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>Session History (Local)</h2>

        {sessionHistory.length === 0 && <p>No stored sessions found.</p>}

        {sessionHistory.map((session) => (
          <div key={session.sessionId} style={cardStyle}>
            <p><strong>ID:</strong> {session.sessionId}</p>
            <p><strong>Status:</strong> {session.sessionStatus}</p>
            <p><strong>Framework:</strong> {session.framework_type}</p>
            <p><strong>Stage:</strong> {session.current_stage}</p>
            <p><strong>Started:</strong> {new Date(session.started_at).toLocaleString()}</p>
            <p><strong>Messages:</strong> {session.transcript?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   Simple Styling
========================= */

const cardStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  backgroundColor: '#f9f9f9',
};

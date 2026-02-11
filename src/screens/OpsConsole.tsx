import { useState, useEffect } from 'react';
import { Activity, Database, Settings as SettingsIcon, Save, RotateCcw, FileText, RefreshCw } from 'lucide-react';
import { HRSidebar } from '../components/HRSidebar';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, AgentPipelineStatus, ErrorLog, FeatureFlag, WorkflowConfig, SystemEnvironment, CoachingSession, ConversationInteraction, ExplainabilityLog, EscalationEvent, GovernanceViolation } from '../lib/supabase';

type OpsConsoleProps = {
  onNavigate: (view: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops') => void;
};

type Tab = 'health' | 'lineage' | 'config';

type SessionLineage = {
  session: CoachingSession | null;
  interactions: ConversationInteraction[];
  explainabilityLogs: ExplainabilityLog[];
  escalations: EscalationEvent[];
  violations: GovernanceViolation[];
};

export function OpsConsole({ onNavigate }: OpsConsoleProps) {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('health');
  const [loading, setLoading] = useState(true);

  const [agents, setAgents] = useState<AgentPipelineStatus[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [pipelineMetrics, setPipelineMetrics] = useState({
    evidenceWriteSuccess: 100,
    sqlPerformance: 98,
    activeWorkflows: { 'WF-001': 3, 'WF-002': 1, 'WF-003': 0, 'WF-004': 2 }
  });

  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [lineageData, setLineageData] = useState<SessionLineage | null>(null);
  const [expandedLineageItem, setExpandedLineageItem] = useState<string | null>(null);

  const [environment, setEnvironment] = useState<SystemEnvironment | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);

    if (activeTab === 'health') {
      await loadHealthData();
    } else if (activeTab === 'lineage') {
      await loadLineageData();
    } else if (activeTab === 'config') {
      await loadConfigData();
    }

    setLoading(false);
  };

  const loadHealthData = async () => {
    const { data: agentData } = await supabase
      .from('agent_pipeline_status')
      .select('*')
      .order('agent_code', { ascending: true });

    const { data: errorData } = await supabase
      .from('error_logs')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(10);

    if (agentData) setAgents(agentData);
    if (errorData) setErrorLogs(errorData);
  };

  const loadLineageData = async () => {
    const { data: sessionData } = await supabase
      .from('coaching_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (sessionData) {
      setSessions(sessionData);
      if (sessionData.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessionData[0].id);
      }
    }
  };

  const loadConfigData = async () => {
    const { data: envData } = await supabase
      .from('system_environment')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    const { data: flagData } = await supabase
      .from('feature_flags')
      .select('*')
      .order('flag_code', { ascending: true });

    const { data: workflowData } = await supabase
      .from('workflow_configs')
      .select('*')
      .order('workflow_code', { ascending: true });

    if (envData) setEnvironment(envData);
    if (flagData) setFeatureFlags(flagData);
    if (workflowData) setWorkflows(workflowData);
  };

  const loadSessionLineage = async (sessionId: string) => {
    const { data: sessionData } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    const { data: interactionData } = await supabase
      .from('conversation_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('interaction_number', { ascending: true });

    const { data: explainData } = await supabase
      .from('explainability_logs')
      .select('*')
      .eq('session_id', sessionId);

    const { data: escalationData } = await supabase
      .from('escalation_events')
      .select('*')
      .eq('session_id', sessionId);

    const { data: violationData } = await supabase
      .from('governance_violations')
      .select('*')
      .eq('session_id', sessionId);

    setLineageData({
      session: sessionData || null,
      interactions: interactionData || [],
      explainabilityLogs: explainData || [],
      escalations: escalationData || [],
      violations: violationData || []
    });
  };

  useEffect(() => {
    if (selectedSessionId && activeTab === 'lineage') {
      loadSessionLineage(selectedSessionId);
    }
  }, [selectedSessionId, activeTab]);

  const handleFlagToggle = (flagCode: string) => {
    setFeatureFlags(prev => prev.map(flag =>
      flag.flag_code === flagCode ? { ...flag, is_enabled: !flag.is_enabled } : flag
    ));
    setHasChanges(true);
  };

  const handleWorkflowToggle = (workflowCode: string) => {
    setWorkflows(prev => prev.map(wf =>
      wf.workflow_code === workflowCode ? { ...wf, is_enabled: !wf.is_enabled } : wf
    ));
    setHasChanges(true);
  };

  const handleSaveConfig = async () => {
    for (const flag of featureFlags) {
      await supabase
        .from('feature_flags')
        .update({
          is_enabled: flag.is_enabled,
          last_changed_by: user?.id,
          last_changed_at: new Date().toISOString()
        })
        .eq('flag_code', flag.flag_code);

      await supabase
        .from('config_audit_log')
        .insert({
          change_type: 'FEATURE_FLAG',
          entity_code: flag.flag_code,
          new_value: { is_enabled: flag.is_enabled },
          changed_by: user?.id,
          reason: 'Ops console configuration update'
        });
    }

    for (const wf of workflows) {
      await supabase
        .from('workflow_configs')
        .update({
          is_enabled: wf.is_enabled,
          last_changed_by: user?.id,
          last_changed_at: new Date().toISOString()
        })
        .eq('workflow_code', wf.workflow_code);

      await supabase
        .from('config_audit_log')
        .insert({
          change_type: 'WORKFLOW',
          entity_code: wf.workflow_code,
          new_value: { is_enabled: wf.is_enabled },
          changed_by: user?.id,
          reason: 'Ops console configuration update'
        });
    }

    setHasChanges(false);
    await loadConfigData();
  };

  const getStatusIcon = (status: string) => {
    if (status === 'OK') return '🟢';
    if (status === 'WARN') return '🟡';
    return '🔴';
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'INFO') return 'text-[#64748B]';
    if (severity === 'WARN') return 'text-[#F59E0B]';
    if (severity === 'ERROR') return 'text-[#EF4444]';
    return 'text-[#DC2626]';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <HRSidebar currentView="ops" onNavigate={onNavigate} onSignOut={signOut} />

      <main className="p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-h1 mb-2">Operations Console</h1>
            <p className="text-body text-[#64748B]">System health, data lineage, and configuration</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] mb-6">
            <div className="flex border-b border-[#E2E8F0]">
              <button
                onClick={() => setActiveTab('health')}
                className={`flex items-center gap-2 px-6 py-4 text-body font-medium transition-colors ${
                  activeTab === 'health'
                    ? 'border-b-2 border-[#1E40AF] text-[#1E40AF]'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <Activity className="w-5 h-5" />
                Health
              </button>
              <button
                onClick={() => setActiveTab('lineage')}
                className={`flex items-center gap-2 px-6 py-4 text-body font-medium transition-colors ${
                  activeTab === 'lineage'
                    ? 'border-b-2 border-[#1E40AF] text-[#1E40AF]'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <Database className="w-5 h-5" />
                Lineage
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-6 py-4 text-body font-medium transition-colors ${
                  activeTab === 'config'
                    ? 'border-b-2 border-[#1E40AF] text-[#1E40AF]'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <SettingsIcon className="w-5 h-5" />
                Config
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-body text-[#64748B]">Loading...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'health' && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-h2">Agent Pipeline Status</h2>
                        <Button variant="secondary" onClick={loadHealthData}>
                          <RefreshCw className="w-4 h-4 mr-2 inline" />
                          Refresh
                        </Button>
                      </div>

                      <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden mb-8">
                        <table className="w-full">
                          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <tr>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Agent</th>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Status</th>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Latency</th>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Error Rate</th>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Sessions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {agents.map((agent) => (
                              <tr key={agent.id} className="border-b border-[#E2E8F0] last:border-0">
                                <td className="px-6 py-4">
                                  <div className="text-body font-medium text-[#1E293B]">{agent.agent_code}</div>
                                  <div className="text-caption text-[#64748B]">{agent.agent_name}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-body">{getStatusIcon(agent.status)} {agent.status}</span>
                                </td>
                                <td className="px-6 py-4 text-body text-[#1E293B]">{formatLatency(agent.latency_ms)}</td>
                                <td className="px-6 py-4 text-body text-[#1E293B]">{agent.error_rate}%</td>
                                <td className="px-6 py-4 text-body text-[#1E293B]">{agent.session_count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <h3 className="text-h3 mb-4">Pipeline Metrics</h3>
                      <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                          <div className="text-caption text-[#64748B] mb-2">Evidence Tables</div>
                          <div className="text-h1 text-[#10B981]">{pipelineMetrics.evidenceWriteSuccess}%</div>
                          <div className="text-caption text-[#64748B]">write success</div>
                        </div>
                        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                          <div className="text-caption text-[#64748B] mb-2">SQL Queries</div>
                          <div className="text-h1 text-[#10B981]">{pipelineMetrics.sqlPerformance}%</div>
                          <div className="text-caption text-[#64748B]">&lt;500ms</div>
                        </div>
                        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                          <div className="text-caption text-[#64748B] mb-2">Active Workflows</div>
                          <div className="text-body text-[#1E293B] space-y-1">
                            {Object.entries(pipelineMetrics.activeWorkflows).map(([wf, count]) => (
                              <div key={wf}>{wf} ({count})</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-h3 mb-4">Live Error Log (Last 10)</h3>
                      <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <tr>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Time</th>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Severity</th>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Code</th>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Message</th>
                              <th className="text-left px-6 py-3 text-caption font-medium text-[#64748B]">Agent</th>
                            </tr>
                          </thead>
                          <tbody>
                            {errorLogs.map((log) => (
                              <tr key={log.id} className="border-b border-[#E2E8F0] last:border-0">
                                <td className="px-6 py-4 text-caption text-[#64748B]">
                                  {new Date(log.occurred_at).toLocaleTimeString()}
                                </td>
                                <td className={`px-6 py-4 text-body font-medium ${getSeverityColor(log.severity)}`}>
                                  {log.severity}
                                </td>
                                <td className="px-6 py-4 text-body text-[#1E293B]">{log.error_code}</td>
                                <td className="px-6 py-4 text-body text-[#1E293B]">{log.error_message}</td>
                                <td className="px-6 py-4 text-body text-[#64748B]">{log.agent_code || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {activeTab === 'lineage' && (
                    <>
                      <h2 className="text-h2 mb-6">Data Lineage Explorer</h2>

                      <div className="mb-6">
                        <label className="block text-body text-[#64748B] mb-2">Select Session:</label>
                        <select
                          value={selectedSessionId}
                          onChange={(e) => setSelectedSessionId(e.target.value)}
                          className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                        >
                          {sessions.map((session) => (
                            <option key={session.id} value={session.id}>
                              {session.session_code} - {session.framework_type} - {new Date(session.started_at).toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {lineageData && (
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-body font-medium text-[#1E293B]">EmployeeProfile (BO-001)</div>
                              <div className="text-h2 text-[#10B981]">✓</div>
                            </div>
                            {expandedLineageItem === 'profile' && lineageData.session && (
                              <pre className="text-caption bg-[#F8FAFC] p-4 rounded mt-4 overflow-auto">
                                {JSON.stringify(lineageData.session, null, 2)}
                              </pre>
                            )}
                            <button
                              onClick={() => setExpandedLineageItem(expandedLineageItem === 'profile' ? null : 'profile')}
                              className="text-caption text-[#1E40AF] mt-2"
                            >
                              {expandedLineageItem === 'profile' ? 'Hide JSON' : 'Show JSON'}
                            </button>
                          </div>

                          <div className="flex items-center justify-center text-[#64748B]">↓</div>

                          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-body font-medium text-[#1E293B]">CoachingSession (BT-001)</div>
                              <div className="text-h2 text-[#10B981]">✓</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center text-[#64748B]">↓</div>

                          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-body font-medium text-[#1E293B]">ConversationInteractions (BT-002)</div>
                              <div className="text-h2 text-[#10B981]">✓</div>
                              <div className="text-body text-[#64748B] font-medium">{lineageData.interactions.length} interactions</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center text-[#64748B]">↓</div>

                          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-body font-medium text-[#1E293B]">ExplainabilityLogs (BT-003)</div>
                              <div className="text-h2 text-[#10B981]">✓</div>
                              <div className="text-body text-[#64748B] font-medium">
                                {lineageData.explainabilityLogs.length > 0 ? '100% complete' : 'No logs'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center text-[#64748B]">↓</div>

                          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-body font-medium text-[#1E293B]">EscalationEvents (BT-004)</div>
                              {lineageData.escalations.length > 0 ? (
                                <>
                                  <div className="text-h2 text-[#10B981]">✓</div>
                                  <div className="text-body text-[#64748B] font-medium">{lineageData.escalations.length} events</div>
                                </>
                              ) : (
                                <>
                                  <div className="text-h2 text-[#64748B]">☐</div>
                                  <div className="text-body text-[#64748B] font-medium">Not triggered</div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-center text-[#64748B]">↓</div>

                          <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-body font-medium text-[#1E293B]">GovernanceViolations (BT-005)</div>
                              {lineageData.violations.length > 0 ? (
                                <>
                                  <div className="text-h2 text-[#EF4444]">✗</div>
                                  <div className="text-body text-[#EF4444] font-medium">{lineageData.violations.length} violations</div>
                                </>
                              ) : (
                                <>
                                  <div className="text-h2 text-[#10B981]">✓</div>
                                  <div className="text-body text-[#10B981] font-medium">Clean</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'config' && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-h2">Configuration & Flags</h2>
                        {hasChanges && (
                          <div className="flex gap-3">
                            <Button variant="secondary" onClick={loadConfigData}>
                              <RotateCcw className="w-4 h-4 mr-2 inline" />
                              Rollback
                            </Button>
                            <Button variant="primary" onClick={handleSaveConfig}>
                              <Save className="w-4 h-4 mr-2 inline" />
                              Save
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 mb-6">
                        <h3 className="text-h3 mb-4">Environment</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-body text-[#64748B]">Current:</span>
                          <span className="text-body font-medium text-[#1E293B] bg-[#F1F5F9] px-4 py-2 rounded">
                            {environment?.environment || 'POC'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 mb-6">
                        <h3 className="text-h3 mb-4">Feature Flags</h3>
                        <div className="space-y-3">
                          {featureFlags.map((flag) => (
                            <div key={flag.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                              <div className="flex-1">
                                <div className="text-body font-medium text-[#1E293B] mb-1">{flag.flag_name}</div>
                                <div className="text-caption text-[#64748B]">{flag.description}</div>
                              </div>
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={flag.is_enabled}
                                  onChange={() => handleFlagToggle(flag.flag_code)}
                                  className="w-5 h-5 rounded border-[#E2E8F0] text-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]"
                                />
                                <span className="text-body text-[#64748B]">
                                  {flag.is_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
                        <h3 className="text-h3 mb-4">Workflow Overrides</h3>
                        <div className="space-y-3">
                          {workflows.map((wf) => (
                            <div key={wf.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
                              <div className="flex-1">
                                <div className="text-body font-medium text-[#1E293B] mb-1">
                                  {wf.workflow_code}: {wf.workflow_name}
                                </div>
                                <div className="text-caption text-[#64748B]">Active instances: {wf.active_count}</div>
                              </div>
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={wf.is_enabled}
                                  onChange={() => handleWorkflowToggle(wf.workflow_code)}
                                  className="w-5 h-5 rounded border-[#E2E8F0] text-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]"
                                />
                                <span className="text-body text-[#64748B]">
                                  {wf.is_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

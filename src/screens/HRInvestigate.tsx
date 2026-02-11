import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Download, FileJson, Filter, X } from 'lucide-react';
import { HRSidebar } from '../components/HRSidebar';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ExplainabilityLog, GovernanceViolation, EscalationEvent, ConversationInteraction } from '../lib/supabase';

type HRInvestigateProps = {
  onNavigate: (view: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops') => void;
};

type InvestigationView = 'explainability' | 'violations';
type ViolationFilter = 'all' | 'open' | 'critical';

export function HRInvestigate({ onNavigate }: HRInvestigateProps) {
  const { signOut } = useAuth();
  const [view, setView] = useState<InvestigationView>('explainability');
  const [loading, setLoading] = useState(true);

  const [interactions, setInteractions] = useState<ConversationInteraction[]>([]);
  const [selectedInteraction, setSelectedInteraction] = useState<ConversationInteraction | null>(null);
  const [explainabilityLog, setExplainabilityLog] = useState<ExplainabilityLog | null>(null);

  const [violations, setViolations] = useState<GovernanceViolation[]>([]);
  const [escalations, setEscalations] = useState<EscalationEvent[]>([]);
  const [violationFilter, setViolationFilter] = useState<ViolationFilter>('all');
  const [selectedViolation, setSelectedViolation] = useState<GovernanceViolation | null>(null);
  const [violationsTab, setViolationsTab] = useState<'violations' | 'escalations'>('violations');

  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (view === 'explainability') {
      loadExplainabilityData();
    } else {
      loadViolationsData();
    }
  }, [view]);

  const loadExplainabilityData = async () => {
    setLoading(true);

    const { data: interactionsData } = await supabase
      .from('conversation_interactions')
      .select('*')
      .eq('message_type', 'AI')
      .order('timestamp', { ascending: true })
      .limit(50);

    if (interactionsData) {
      setInteractions(interactionsData);
      if (interactionsData.length > 0) {
        setSelectedInteraction(interactionsData[0]);
        loadExplainabilityLog(interactionsData[0].id);
      }
    }

    setLoading(false);
  };

  const loadExplainabilityLog = async (interactionId: string) => {
    const { data } = await supabase
      .from('explainability_logs')
      .select('*')
      .eq('interaction_id', interactionId)
      .maybeSingle();

    setExplainabilityLog(data);
  };

  const loadViolationsData = async () => {
    setLoading(true);

    const { data: violationsData } = await supabase
      .from('governance_violations')
      .select('*')
      .order('detected_at', { ascending: false });

    const { data: escalationsData } = await supabase
      .from('escalation_events')
      .select('*')
      .order('escalated_at', { ascending: false });

    if (violationsData) setViolations(violationsData);
    if (escalationsData) setEscalations(escalationsData);

    setLoading(false);
  };

  const handleInteractionSelect = (interaction: ConversationInteraction) => {
    setSelectedInteraction(interaction);
    loadExplainabilityLog(interaction.id);
    setShowJson(false);
  };

  const handleExportLog = () => {
    if (!explainabilityLog) return;

    const dataStr = JSON.stringify(explainabilityLog, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `explainability-log-${explainabilityLog.id}.json`;
    link.click();
  };

  const handleUpdateViolation = async (violationId: string, status: string) => {
    await supabase
      .from('governance_violations')
      .update({ status, resolved_at: status === 'Closed' ? new Date().toISOString() : null })
      .eq('id', violationId);

    loadViolationsData();
    setSelectedViolation(null);
  };

  const getFilteredViolations = () => {
    if (violationFilter === 'all') return violations;
    if (violationFilter === 'open') return violations.filter(v => v.status !== 'Closed');
    if (violationFilter === 'critical') return violations.filter(v => v.severity === 'CRITICAL');
    return violations;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
      case 'HIGH': return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
      case 'MEDIUM': return 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20';
      case 'LOW': return 'text-[#64748B] bg-[#64748B]/10 border-[#64748B]/20';
      default: return 'text-[#64748B] bg-[#64748B]/10 border-[#64748B]/20';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMins > 0) return `${diffMins}m`;
    return 'just now';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <HRSidebar currentView="investigate" onNavigate={onNavigate} onSignOut={signOut} />

      <main className="p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-h1 mb-2">Investigation Tools</h1>
              <p className="text-body text-[#64748B]">
                {view === 'explainability'
                  ? 'Why did AI respond that way?'
                  : 'Violations and escalation management'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={view === 'explainability' ? 'primary' : 'secondary'}
                onClick={() => setView('explainability')}
              >
                Explainability
              </Button>
              <Button
                variant={view === 'violations' ? 'primary' : 'secondary'}
                onClick={() => setView('violations')}
              >
                Violations & Escalations
              </Button>
            </div>
          </div>

          {view === 'explainability' ? (
            <div className="flex gap-6">
              <div className="w-[30%] bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0]">
                  <h2 className="text-h3 text-[#1E293B]">Select Session</h2>
                  <p className="text-meta text-[#64748B] mt-1">AI responses to investigate</p>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : (
                    interactions.map((interaction) => (
                      <button
                        key={interaction.id}
                        onClick={() => handleInteractionSelect(interaction)}
                        className={`w-full text-left p-4 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors ${
                          selectedInteraction?.id === interaction.id ? 'bg-[#EFF6FF] border-l-4 border-l-[#1E40AF]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <div className="flex-1">
                            <p className="text-meta text-[#64748B]">
                              {new Date(interaction.timestamp).toLocaleString()}
                            </p>
                            <p className="text-body text-[#1E293B] mt-1">
                              {interaction.message_content.substring(0, 80)}
                              {interaction.message_content.length > 80 ? '...' : ''}
                            </p>
                          </div>
                          {selectedInteraction?.id === interaction.id && (
                            <div className="text-[#1E40AF]">▶</div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex-1 bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
                {selectedInteraction && explainabilityLog ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-h2 text-[#1E293B]">Why this response?</h2>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setShowJson(!showJson)}>
                          <FileJson className="w-4 h-4 mr-2 inline" />
                          {showJson ? 'Hide' : 'View'} JSON
                        </Button>
                        <Button variant="secondary" onClick={handleExportLog}>
                          <Download className="w-4 h-4 mr-2 inline" />
                          Export
                        </Button>
                      </div>
                    </div>

                    {showJson ? (
                      <div className="bg-[#1E293B] text-[#10B981] p-6 rounded-lg overflow-auto" style={{ maxHeight: '60vh' }}>
                        <pre className="text-sm">{JSON.stringify(explainabilityLog.decision_tree, null, 2)}</pre>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <p className="text-body text-[#64748B] mb-2">AI Response:</p>
                          <p className="text-body text-[#1E293B] font-medium p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                            "{explainabilityLog.ai_response}"
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-[#10B981]/10 text-[#10B981] rounded-full font-medium">
                              1
                            </div>
                            <div className="flex-1">
                              <p className="text-body text-[#1E293B] font-medium">
                                Framework: {explainabilityLog.framework_applied}{' '}
                                {explainabilityLog.framework_stage && `${explainabilityLog.framework_stage} stage`}
                              </p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-[#10B981]" />
                          </div>

                          <div className="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-[#10B981]/10 text-[#10B981] rounded-full font-medium">
                              2
                            </div>
                            <div className="flex-1">
                              <p className="text-body text-[#1E293B] font-medium mb-1">ICF Competencies:</p>
                              <div className="flex flex-wrap gap-2">
                                {explainabilityLog.icf_competencies.map((comp, idx) => (
                                  <span
                                    key={idx}
                                    className="text-meta px-3 py-1 bg-[#3B82F6]/10 text-[#3B82F6] rounded-full"
                                  >
                                    {comp}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-[#10B981]" />
                          </div>

                          <div className="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-[#10B981]/10 text-[#10B981] rounded-full font-medium">
                              3
                            </div>
                            <div className="flex-1">
                              <p className="text-body text-[#1E293B] font-medium mb-1">Boundaries Applied:</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(explainabilityLog.boundaries_checked).map(([key, value], idx) => (
                                  <span
                                    key={idx}
                                    className="text-meta px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center gap-1"
                                  >
                                    {key} {value === 'passed' && '✓'}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-[#10B981]" />
                          </div>

                          <div className="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-[#10B981]/10 text-[#10B981] rounded-full font-medium">
                              4
                            </div>
                            <div className="flex-1">
                              <p className="text-body text-[#1E293B] font-medium">Reasoning:</p>
                              <p className="text-body text-[#64748B] mt-1">{explainabilityLog.reasoning}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 border border-[#E2E8F0] rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-[#10B981]/10 text-[#10B981] rounded-full font-medium">
                              5
                            </div>
                            <div className="flex-1">
                              <p className="text-body text-[#1E293B] font-medium mb-1">Escalation Check:</p>
                              <p className="text-body text-[#64748B]">
                                Emotional intensity {explainabilityLog.escalation_check.emotional_intensity}% &lt;{' '}
                                {explainabilityLog.escalation_check.threshold}% threshold
                              </p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-[#10B981]" />
                          </div>
                        </div>

                        <div className="p-4 bg-[#EFF6FF] border border-[#3B82F6]/20 rounded-lg">
                          <p className="text-body text-[#1E293B] font-medium mb-2">Human-readable summary:</p>
                          <p className="text-body text-[#64748B] italic">"{explainabilityLog.reasoning}"</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-body text-[#64748B]">
                      {loading ? 'Loading...' : 'Select an AI response to view explanation'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden">
              <div className="border-b border-[#E2E8F0]">
                <div className="flex">
                  {[
                    { id: 'violations', label: 'Violations' },
                    { id: 'escalations', label: 'Escalations' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setViolationsTab(tab.id as any)}
                      className={`px-6 py-4 text-body font-medium transition-colors ${
                        violationsTab === tab.id
                          ? 'text-[#1E40AF] border-b-2 border-[#1E40AF]'
                          : 'text-[#64748B] hover:text-[#1E293B]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {violationsTab === 'violations' ? (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <Filter className="w-5 h-5 text-[#64748B]" />
                      <div className="flex gap-2">
                        {(['all', 'open', 'critical'] as ViolationFilter[]).map(filter => (
                          <button
                            key={filter}
                            onClick={() => setViolationFilter(filter)}
                            className={`px-4 py-2 rounded-lg text-body font-medium transition-colors ${
                              violationFilter === filter
                                ? 'bg-[#1E40AF] text-white'
                                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                            }`}
                          >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-body text-[#64748B]">Loading violations...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#E2E8F0]">
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">ID</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Type</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Severity</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Status</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Age</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredViolations().map(violation => (
                              <tr key={violation.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                                <td className="py-4 px-4 text-body text-[#1E293B]">{violation.violation_code}</td>
                                <td className="py-4 px-4 text-body text-[#64748B]">{violation.violation_type}</td>
                                <td className="py-4 px-4">
                                  <span className={`text-meta px-3 py-1 rounded border ${getSeverityColor(violation.severity)}`}>
                                    {violation.severity}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-body text-[#64748B]">{violation.status}</td>
                                <td className="py-4 px-4 text-body text-[#64748B]">{getTimeAgo(violation.detected_at)}</td>
                                <td className="py-4 px-4">
                                  <button
                                    onClick={() => setSelectedViolation(violation)}
                                    className="text-body text-[#1E40AF] hover:underline"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-body text-[#64748B]">Loading escalations...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#E2E8F0]">
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">ID</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Trigger</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Target</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Urgency</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Status</th>
                              <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Age</th>
                            </tr>
                          </thead>
                          <tbody>
                            {escalations.map(escalation => (
                              <tr key={escalation.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                                <td className="py-4 px-4 text-body text-[#1E293B]">{escalation.escalation_code}</td>
                                <td className="py-4 px-4 text-body text-[#64748B]">{escalation.trigger_condition}</td>
                                <td className="py-4 px-4 text-body text-[#64748B]">{escalation.target_type}</td>
                                <td className="py-4 px-4">
                                  <span className={`text-meta px-3 py-1 rounded border ${getSeverityColor(escalation.urgency_level)}`}>
                                    {escalation.urgency_level}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-body text-[#64748B]">{escalation.status}</td>
                                <td className="py-4 px-4 text-body text-[#64748B]">{getTimeAgo(escalation.escalated_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedViolation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 text-[#1E293B]">Violation Details</h2>
              <button
                onClick={() => setSelectedViolation(null)}
                className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-body text-[#64748B]">Code:</span>
                <span className="text-body text-[#1E293B] font-medium">{selectedViolation.violation_code}</span>
                <span className={`text-meta px-3 py-1 rounded border ${getSeverityColor(selectedViolation.severity)}`}>
                  {selectedViolation.severity}
                </span>
              </div>

              <div>
                <p className="text-body text-[#64748B] mb-2">Type:</p>
                <p className="text-body text-[#1E293B]">{selectedViolation.violation_type}</p>
              </div>

              <div>
                <p className="text-body text-[#64748B] mb-2">Original Text:</p>
                <p className="text-body text-[#1E293B] p-4 bg-[#FEE2E2] rounded-lg border border-[#EF4444]/20">
                  "{selectedViolation.original_text}"
                </p>
              </div>

              {selectedViolation.corrected_text && (
                <div>
                  <p className="text-body text-[#64748B] mb-2">Corrected Text:</p>
                  <p className="text-body text-[#1E293B] p-4 bg-[#D1FAE5] rounded-lg border border-[#10B981]/20">
                    "{selectedViolation.corrected_text}"
                  </p>
                </div>
              )}

              <div>
                <p className="text-body text-[#64748B] mb-2">Status:</p>
                <select
                  value={selectedViolation.status}
                  onChange={(e) => handleUpdateViolation(selectedViolation.id, e.target.value)}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                >
                  <option value="Auto-corrected">Auto-corrected</option>
                  <option value="HR Review">HR Review</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setSelectedViolation(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

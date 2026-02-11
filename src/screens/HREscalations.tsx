import { useState, useEffect } from 'react';
import { AlertTriangle, Edit2, Play, Plus, Save, X } from 'lucide-react';
import { HRSidebar } from '../components/HRSidebar';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, EscalationRule } from '../lib/supabase';

type HREscalationsProps = {
  onNavigate: (view: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops') => void;
};

type EditingRule = EscalationRule & { isNew?: boolean };

export function HREscalations({ onNavigate }: HREscalationsProps) {
  const { signOut, profile } = useAuth();
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<EditingRule | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [saveMessage, setSaveMessage] = useState('');

  const isHRGov = profile?.admin_role === 'OH-HR-GOV';

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    const { data } = await supabase
      .from('escalation_rules')
      .select('*')
      .order('urgency_level', { ascending: false });

    if (data) setRules(data);
    setLoading(false);
  };

  const handleEditRule = (rule: EscalationRule) => {
    setEditingRule({ ...rule });
  };

  const handleAddRule = () => {
    setEditingRule({
      id: crypto.randomUUID(),
      rule_name: '',
      trigger_condition: '',
      trigger_threshold: 80,
      target_type: 'HR Coach',
      urgency_level: 'MEDIUM',
      is_enabled: true,
      triggered_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true
    });
  };

  const handleSaveRule = async () => {
    if (!editingRule || !isHRGov) return;

    try {
      if (editingRule.isNew) {
        const { id, isNew, ...ruleData } = editingRule;
        await supabase
          .from('escalation_rules')
          .insert([ruleData]);
      } else {
        const { isNew, ...ruleData } = editingRule;
        await supabase
          .from('escalation_rules')
          .update(ruleData)
          .eq('id', editingRule.id);
      }

      setSaveMessage('Rule saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
      setEditingRule(null);
      loadRules();
    } catch (error) {
      setSaveMessage('Error saving rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!isHRGov) return;

    if (confirm('Are you sure you want to delete this rule?')) {
      await supabase
        .from('escalation_rules')
        .delete()
        .eq('id', id);

      loadRules();
    }
  };

  const handleTestRule = () => {
    const triggeredRules = rules.filter(rule => {
      if (!rule.is_enabled) return false;

      const input = testInput.toLowerCase();

      if (rule.rule_name.includes('Clinical') &&
          (input.includes('stressed') || input.includes('anxious') || input.includes('depressed'))) {
        return true;
      }

      if (rule.rule_name.includes('Emotional') &&
          (input.includes('really') || input.includes('very') || input.includes('extremely'))) {
        return true;
      }

      return false;
    });

    setTestResults({
      input: testInput,
      triggeredRules: triggeredRules.map(r => ({
        name: r.rule_name,
        target: r.target_type,
        urgency: r.urgency_level
      })),
      escalationPath: triggeredRules.length > 0
        ? `Alert → ${triggeredRules[0].target_type} (${triggeredRules[0].urgency_level})`
        : 'No escalation triggered'
    });
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
      case 'HIGH': return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
      case 'MEDIUM': return 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20';
      case 'LOW': return 'text-[#64748B] bg-[#64748B]/10 border-[#64748B]/20';
      default: return 'text-[#64748B] bg-[#64748B]/10 border-[#64748B]/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <HRSidebar currentView="escalations" onNavigate={onNavigate} onSignOut={signOut} />

      <main className="p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-h1 mb-2">Escalation Rules</h1>
              <p className="text-body text-[#64748B]">
                When should AI hand off to humans?
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setTestMode(!testMode)}>
                <Play className="w-4 h-4 mr-2 inline" />
                {testMode ? 'Hide Test Mode' : 'Test Mode'}
              </Button>
              {isHRGov && (
                <Button onClick={handleAddRule}>
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add Rule
                </Button>
              )}
            </div>
          </div>

          {saveMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              saveMessage.includes('Error')
                ? 'bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]'
                : 'bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]'
            }`}>
              {saveMessage}
            </div>
          )}

          {!isHRGov && (
            <div className="mb-6 bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] px-4 py-3 rounded-lg text-body">
              Escalation rule changes require OH-HR-GOV role
            </div>
          )}

          {testMode && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
              <h2 className="text-h2 mb-4">Test Escalation Rules</h2>
              <p className="text-body text-[#64748B] mb-4">
                Simulate a user message to see which rules would trigger
              </p>

              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="I'm really stressed about my boss..."
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF] mb-4"
                rows={3}
              />

              <Button onClick={handleTestRule}>
                <Play className="w-4 h-4 mr-2 inline" />
                Simulate
              </Button>

              {testResults && (
                <div className="mt-6 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <h3 className="text-body font-medium text-[#1E293B] mb-3">Test Results</h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-meta text-[#64748B] mb-1">Input:</p>
                      <p className="text-body text-[#1E293B]">"{testResults.input}"</p>
                    </div>

                    <div>
                      <p className="text-meta text-[#64748B] mb-1">Escalation Path:</p>
                      <p className="text-body text-[#1E293B] font-medium">{testResults.escalationPath}</p>
                    </div>

                    {testResults.triggeredRules.length > 0 && (
                      <div>
                        <p className="text-meta text-[#64748B] mb-2">Triggered Rules:</p>
                        <div className="space-y-2">
                          {testResults.triggeredRules.map((rule: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded border border-[#E2E8F0]">
                              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                              <div className="flex-1">
                                <p className="text-body text-[#1E293B]">{rule.name}</p>
                                <p className="text-meta text-[#64748B]">Target: {rule.target}</p>
                              </div>
                              <span className={`text-meta px-2 py-1 rounded border ${getUrgencyColor(rule.urgency)}`}>
                                {rule.urgency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-[#E2E8F0]">
                <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-body text-[#64748B]">Loading escalation rules...</p>
              </div>
            ) : (
              rules.map(rule => (
                <div
                  key={rule.id}
                  className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-h3 text-[#1E293B]">{rule.rule_name}</h3>
                        <span className={`text-meta px-2 py-1 rounded border ${getUrgencyColor(rule.urgency_level)}`}>
                          {rule.urgency_level}
                        </span>
                        <span className={`text-meta px-2 py-1 rounded ${
                          rule.is_enabled
                            ? 'bg-[#10B981]/10 text-[#10B981]'
                            : 'bg-[#64748B]/10 text-[#64748B]'
                        }`}>
                          {rule.is_enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-body text-[#64748B]">
                          <strong>Trigger:</strong> {rule.trigger_condition}
                        </p>
                        <p className="text-body text-[#64748B]">
                          <strong>Target:</strong> {rule.target_type}
                        </p>
                        <p className="text-meta text-[#64748B]">
                          Triggered {rule.triggered_count} times
                        </p>
                      </div>
                    </div>

                    {isHRGov && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-2 text-[#64748B] hover:text-[#1E40AF] hover:bg-[#F1F5F9] rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {editingRule && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <h2 className="text-h2 mb-6">
                  {editingRule.isNew ? 'Add Escalation Rule' : 'Edit Escalation Rule'}
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-body text-[#64748B] mb-2">Rule Name</label>
                    <input
                      type="text"
                      value={editingRule.rule_name}
                      onChange={(e) => setEditingRule({ ...editingRule, rule_name: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="block text-body text-[#64748B] mb-2">Trigger Condition</label>
                    <input
                      type="text"
                      value={editingRule.trigger_condition}
                      onChange={(e) => setEditingRule({ ...editingRule, trigger_condition: e.target.value })}
                      placeholder="Mental health keywords >80%"
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="block text-body text-[#64748B] mb-2">
                      Threshold: {editingRule.trigger_threshold}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={editingRule.trigger_threshold}
                      onChange={(e) => setEditingRule({ ...editingRule, trigger_threshold: Number(e.target.value) })}
                      className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-body text-[#64748B] mb-2">Target Type</label>
                    <select
                      value={editingRule.target_type}
                      onChange={(e) => setEditingRule({ ...editingRule, target_type: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      <option>EAP</option>
                      <option>HR Coach</option>
                      <option>Manager</option>
                      <option>System Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-body text-[#64748B] mb-2">Urgency Level</label>
                    <select
                      value={editingRule.urgency_level}
                      onChange={(e) => setEditingRule({ ...editingRule, urgency_level: e.target.value as any })}
                      className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      <option>CRITICAL</option>
                      <option>HIGH</option>
                      <option>MEDIUM</option>
                      <option>LOW</option>
                    </select>
                  </div>

                  <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingRule.is_enabled}
                        onChange={(e) => setEditingRule({ ...editingRule, is_enabled: e.target.checked })}
                        className="w-5 h-5 text-[#1E40AF] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#1E40AF]"
                      />
                      <span className="ml-2 text-body text-[#64748B]">Enable this rule</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setEditingRule(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRule}>
                    <Save className="w-4 h-4 mr-2 inline" />
                    Save Rule
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

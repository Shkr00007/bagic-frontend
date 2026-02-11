import { useState, useEffect } from 'react';
import { Lock, Settings as SettingsIcon, Save, Eye } from 'lucide-react';
import { HRSidebar } from '../components/HRSidebar';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, FrameworkPersonaMapping, BoundaryRule, GuardrailRule } from '../lib/supabase';

type HRConfigureProps = {
  onNavigate: (view: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops') => void;
};

type Tab = 'frameworks' | 'boundaries' | 'guardrails';

export function HRConfigure({ onNavigate }: HRConfigureProps) {
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('frameworks');
  const [frameworkMappings, setFrameworkMappings] = useState<FrameworkPersonaMapping[]>([]);
  const [boundaryRules, setBoundaryRules] = useState<BoundaryRule[]>([]);
  const [guardrailRules, setGuardrailRules] = useState<GuardrailRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const isHRGov = profile?.admin_role === 'OH-HR-GOV';

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    const { data: mappings } = await supabase
      .from('framework_persona_mapping')
      .select('*')
      .order('persona_type, framework_type');

    const { data: boundaries } = await supabase
      .from('boundary_rules')
      .select('*')
      .order('rule_code');

    const { data: guardrails } = await supabase
      .from('guardrail_rules')
      .select('*')
      .order('rule_name');

    if (mappings) setFrameworkMappings(mappings);
    if (boundaries) setBoundaryRules(boundaries);
    if (guardrails) setGuardrailRules(guardrails);

    setLoading(false);
  };

  const handleFrameworkToggle = (personaType: string, frameworkType: string, enabled: boolean) => {
    setFrameworkMappings(prev =>
      prev.map(m =>
        m.persona_type === personaType && m.framework_type === frameworkType
          ? { ...m, is_enabled: enabled }
          : m
      )
    );
  };

  const handleBoundaryThresholdChange = (ruleCode: string, value: number) => {
    setBoundaryRules(prev =>
      prev.map(r =>
        r.rule_code === ruleCode
          ? { ...r, threshold_value: value }
          : r
      )
    );
  };

  const handleGuardrailToggle = (id: string, enabled: boolean) => {
    setGuardrailRules(prev =>
      prev.map(g =>
        g.id === id
          ? { ...g, is_enabled: enabled }
          : g
      )
    );
  };

  const handleSave = async () => {
    if (!isHRGov) return;

    setSaving(true);
    setSaveMessage('');

    try {
      for (const mapping of frameworkMappings) {
        await supabase
          .from('framework_persona_mapping')
          .update({
            is_enabled: mapping.is_enabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', mapping.id);
      }

      for (const rule of boundaryRules) {
        if (!rule.is_hard_constraint) {
          await supabase
            .from('boundary_rules')
            .update({
              threshold_value: rule.threshold_value,
              updated_at: new Date().toISOString()
            })
            .eq('id', rule.id);
        }
      }

      for (const guardrail of guardrailRules) {
        await supabase
          .from('guardrail_rules')
          .update({
            is_enabled: guardrail.is_enabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', guardrail.id);
      }

      setSaveMessage('Configuration saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const getPersonaLabel = (type: string): string => {
    if (type === 'OH-EC-IC') return 'Early Career';
    if (type === 'OH-MC-PM') return 'Manager';
    if (type === 'OH-SL') return 'Senior Leader';
    return type;
  };

  const frameworks = ['GROW', 'CLEAR', 'KOLB', 'ITC'];
  const personas = ['OH-EC-IC', 'OH-MC-PM', 'OH-SL'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <HRSidebar currentView="configure" onNavigate={onNavigate} onSignOut={signOut} />

      <main className="p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-h1 mb-2">Framework Configuration</h1>
              <p className="text-body text-[#64748B]">
                Which frameworks are active for each persona?
              </p>
            </div>
            {isHRGov && (
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2 inline" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
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
              Configuration changes require OH-HR-GOV role
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="border-b border-[#E2E8F0]">
              <div className="flex">
                {[
                  { id: 'frameworks', label: 'Frameworks' },
                  { id: 'boundaries', label: 'Boundaries' },
                  { id: 'guardrails', label: 'Guardrails' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`px-6 py-4 text-body font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-[#1E40AF] border-b-2 border-[#1E40AF]'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-body text-[#64748B]">Loading configuration...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'frameworks' && (
                    <div>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#E2E8F0]">
                            <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">
                              Framework
                            </th>
                            {personas.map(persona => (
                              <th key={persona} className="text-center py-3 px-4 text-body font-medium text-[#64748B]">
                                {getPersonaLabel(persona)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {frameworks.map(framework => (
                            <tr key={framework} className="border-b border-[#E2E8F0] last:border-0">
                              <td className="py-4 px-4 text-body text-[#1E293B] font-medium">
                                {framework}
                              </td>
                              {personas.map(persona => {
                                const mapping = frameworkMappings.find(
                                  m => m.persona_type === persona && m.framework_type === framework
                                );
                                return (
                                  <td key={persona} className="py-4 px-4 text-center">
                                    <label className="inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={mapping?.is_enabled ?? false}
                                        onChange={(e) => handleFrameworkToggle(persona, framework, e.target.checked)}
                                        disabled={!isHRGov}
                                        className="w-5 h-5 text-[#1E40AF] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#1E40AF] disabled:opacity-50"
                                      />
                                      <span className="ml-2 text-body text-[#64748B]">
                                        {mapping?.is_enabled ? 'ON' : 'OFF'}
                                      </span>
                                    </label>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="mt-6 flex items-center gap-3 p-4 bg-[#F1F5F9] rounded-lg">
                        <Eye className="w-5 h-5 text-[#64748B]" />
                        <p className="text-body text-[#64748B]">
                          Preview impact: Changes will affect new coaching sessions immediately
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'boundaries' && (
                    <div>
                      <div className="mb-6 flex items-center gap-3 p-4 bg-[#F1F5F9] rounded-lg">
                        <p className="text-body text-[#64748B]">
                          <strong>Legend:</strong> 🔒 = Hard constraint (always enforced) | ⚙️ = Configurable threshold
                        </p>
                      </div>

                      <div className="space-y-4">
                        {boundaryRules.map(rule => (
                          <div
                            key={rule.id}
                            className="p-4 border border-[#E2E8F0] rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-h3">
                                    {rule.is_hard_constraint ? '🔒' : '⚙️'}
                                  </span>
                                  <h3 className="text-body font-medium text-[#1E293B]">
                                    {rule.rule_code} - {rule.rule_name}
                                  </h3>
                                  <span className={`text-meta px-2 py-1 rounded ${
                                    rule.is_enabled
                                      ? 'bg-[#10B981]/10 text-[#10B981]'
                                      : 'bg-[#64748B]/10 text-[#64748B]'
                                  }`}>
                                    {rule.is_enabled ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                                <p className="text-body text-[#64748B]">{rule.description}</p>
                              </div>
                            </div>

                            {!rule.is_hard_constraint && rule.threshold_value !== null && (
                              <div className="mt-4">
                                <label className="block text-body text-[#64748B] mb-2">
                                  Threshold: {rule.threshold_value}%
                                </label>
                                <input
                                  type="range"
                                  min="70"
                                  max="95"
                                  step="5"
                                  value={rule.threshold_value}
                                  onChange={(e) => handleBoundaryThresholdChange(rule.rule_code, Number(e.target.value))}
                                  disabled={!isHRGov}
                                  className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                />
                                <div className="flex justify-between text-meta text-[#64748B] mt-1">
                                  <span>70%</span>
                                  <span>95%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'guardrails' && (
                    <div className="space-y-4">
                      {guardrailRules.map(rule => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between p-4 border border-[#E2E8F0] rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="text-body font-medium text-[#1E293B] mb-1">
                              {rule.rule_name}
                            </h3>
                            <p className="text-body text-[#64748B]">
                              Threshold: {rule.threshold_value}
                            </p>
                          </div>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rule.is_enabled}
                              onChange={(e) => handleGuardrailToggle(rule.id, e.target.checked)}
                              disabled={!isHRGov}
                              className="w-5 h-5 text-[#1E40AF] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#1E40AF] disabled:opacity-50"
                            />
                            <span className="ml-2 text-body text-[#64748B]">
                              {rule.is_enabled ? 'ON' : 'OFF'}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
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

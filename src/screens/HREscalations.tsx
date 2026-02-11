import { useState, useEffect } from 'react';
import { AlertTriangle, Edit2, Play, Plus, Save, X } from 'lucide-react';
import { HRSidebar } from '../components/HRSidebar';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

type HREscalationsProps = {
  onNavigate: (
    view:
      | 'dashboard'
      | 'configure'
      | 'investigate'
      | 'escalations'
      | 'executive'
      | 'ops'
  ) => void;
};

type EscalationRule = {
  id: string;
  rule_name: string;
  trigger_condition: string;
  trigger_threshold: number;
  target_type: string;
  urgency_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_enabled: boolean;
  triggered_count: number;
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

  const isHRGov = profile?.is_admin === true;

  /* =========================
     Load Synthetic Rules
  ========================= */

  useEffect(() => {
    const stored = localStorage.getItem('escalation-rules');

    if (stored) {
      setRules(JSON.parse(stored));
    } else {
      const defaultRules: EscalationRule[] = [
        {
          id: crypto.randomUUID(),
          rule_name: 'Clinical Distress',
          trigger_condition: 'Mental health keywords',
          trigger_threshold: 80,
          target_type: 'HR Coach',
          urgency_level: 'HIGH',
          is_enabled: true,
          triggered_count: 3,
        },
        {
          id: crypto.randomUUID(),
          rule_name: 'Emotional Intensity',
          trigger_condition: 'Repeated strong emotional words',
          trigger_threshold: 70,
          target_type: 'Manager',
          urgency_level: 'MEDIUM',
          is_enabled: true,
          triggered_count: 5,
        },
      ];

      setRules(defaultRules);
      localStorage.setItem('escalation-rules', JSON.stringify(defaultRules));
    }

    setLoading(false);
  }, []);

  /* =========================
     Save Rules
  ========================= */

  const persistRules = (updated: EscalationRule[]) => {
    setRules(updated);
    localStorage.setItem('escalation-rules', JSON.stringify(updated));
  };

  const handleSaveRule = () => {
    if (!editingRule || !isHRGov) return;

    let updatedRules;

    if (editingRule.isNew) {
      updatedRules = [...rules, { ...editingRule }];
    } else {
      updatedRules = rules.map((r) =>
        r.id === editingRule.id ? editingRule : r
      );
    }

    persistRules(updatedRules);
    setEditingRule(null);
    setSaveMessage('Rule saved successfully');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteRule = (id: string) => {
    if (!isHRGov) return;

    if (confirm('Delete this rule?')) {
      const updated = rules.filter((r) => r.id !== id);
      persistRules(updated);
    }
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
      isNew: true,
    });
  };

  /* =========================
     Test Mode
  ========================= */

  const handleTestRule = () => {
    const triggeredRules = rules.filter((rule) => {
      if (!rule.is_enabled) return false;

      const input = testInput.toLowerCase();

      if (
        rule.rule_name.includes('Clinical') &&
        (input.includes('stressed') ||
          input.includes('anxious') ||
          input.includes('depressed'))
      ) {
        return true;
      }

      if (
        rule.rule_name.includes('Emotional') &&
        (input.includes('really') ||
          input.includes('very') ||
          input.includes('extremely'))
      ) {
        return true;
      }

      return false;
    });

    setTestResults({
      input: testInput,
      triggeredRules,
      escalationPath:
        triggeredRules.length > 0
          ? `Alert → ${triggeredRules[0].target_type} (${triggeredRules[0].urgency_level})`
          : 'No escalation triggered',
    });
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-600';
      case 'HIGH':
        return 'text-orange-500';
      case 'MEDIUM':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <HRSidebar
        currentView="escalations"
        onNavigate={onNavigate}
        onSignOut={signOut}
      />

      <main className="p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between mb-8">
            <h1 className="text-h1">Escalation Rules (Synthetic)</h1>

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

          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white p-6 rounded-lg border mb-4"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{rule.rule_name}</h3>
                  <p className="text-sm text-gray-500">
                    {rule.trigger_condition}
                  </p>
                  <p className={`text-sm ${getUrgencyColor(rule.urgency_level)}`}>
                    {rule.urgency_level}
                  </p>
                </div>

                {isHRGov && (
                  <div className="flex gap-2">
                    <button onClick={() => setEditingRule(rule)}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteRule(rule.id)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {editingRule && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-[500px]">
                <input
                  value={editingRule.rule_name}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, rule_name: e.target.value })
                  }
                  className="w-full border p-2 mb-4"
                  placeholder="Rule Name"
                />

                <Button onClick={handleSaveRule}>
                  <Save className="w-4 h-4 mr-2 inline" />
                  Save Rule
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

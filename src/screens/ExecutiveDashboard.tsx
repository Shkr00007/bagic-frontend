import { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, TrendingDown, AlertTriangle, Download, FileText } from 'lucide-react';
import { HRSidebar } from '../components/HRSidebar';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, OKRKeyResult, PersonaMetrics, POCHealthMetrics } from '../lib/supabase';

type ExecutiveDashboardProps = {
  onNavigate: (view: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops') => void;
};

export function ExecutiveDashboard({ onNavigate }: ExecutiveDashboardProps) {
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [keyResults, setKeyResults] = useState<OKRKeyResult[]>([]);
  const [personaMetrics, setPersonaMetrics] = useState<PersonaMetrics[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<POCHealthMetrics | null>(null);
  const [previousHealthMetrics, setPreviousHealthMetrics] = useState<POCHealthMetrics | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const { data: krData } = await supabase
      .from('okr_key_results')
      .select('*')
      .order('kr_code', { ascending: true });

    const { data: personaData } = await supabase
      .from('persona_metrics')
      .select('*')
      .order('persona_type', { ascending: true });

    const { data: healthData } = await supabase
      .from('poc_health_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(2);

    if (krData) setKeyResults(krData);
    if (personaData) setPersonaMetrics(personaData);
    if (healthData && healthData.length > 0) {
      setHealthMetrics(healthData[0]);
      if (healthData.length > 1) {
        setPreviousHealthMetrics(healthData[1]);
      }
    }

    setLoading(false);
  };

  const handleExportReport = async () => {
    const reportData = {
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      key_results: keyResults,
      persona_metrics: personaMetrics,
      health_metrics: healthMetrics,
      summary: {
        all_criteria_met: keyResults.every(kr => kr.status === 'Met'),
        total_users: personaMetrics.reduce((sum, p) => sum + p.total_users, 0),
        total_sessions: personaMetrics.reduce((sum, p) => sum + p.total_sessions, 0),
        avg_effectiveness: personaMetrics.reduce((sum, p) => sum + p.effectiveness_score, 0) / personaMetrics.length
      }
    };

    await supabase
      .from('poc_reports')
      .insert({
        report_name: `POC Report - ${new Date().toLocaleDateString()}`,
        period_start: reportData.period_start,
        period_end: reportData.period_end,
        summary_data: reportData,
        generated_by: user?.id
      });

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `poc-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const allCriteriaMet = keyResults.every(kr => kr.status === 'Met');

  const getKRIcon = (krCode: string) => {
    const icons: Record<string, string> = {
      'KR1': '✓',
      'KR2': '0',
      'KR3': '✓',
      'KR4': '✓',
      'KR5': '✓'
    };
    return icons[krCode] || '✓';
  };

  const getKRLabel = (krCode: string) => {
    const labels: Record<string, string> = {
      'KR1': 'Framework',
      'KR2': 'Violations',
      'KR3': 'Explainability',
      'KR4': 'Journeys',
      'KR5': 'Effectiveness'
    };
    return labels[krCode] || '';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <HRSidebar currentView="executive" onNavigate={onNavigate} onSignOut={signOut} />

      <main className="p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-h1 mb-2">AI Coach POC - Success Criteria</h1>
              <p className="text-body text-[#64748B]">
                {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-body text-[#64748B]">Loading dashboard metrics...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-h3 text-[#1E293B] mb-4">OKR Status - Key Results</h2>
                <div className="grid grid-cols-5 gap-4">
                  {keyResults.map((kr) => (
                    <div
                      key={kr.id}
                      className={`bg-white rounded-lg shadow-sm border p-6 ${
                        kr.status === 'Met' ? 'border-[#10B981]' : 'border-[#E2E8F0]'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-caption text-[#64748B] mb-2">{kr.kr_code}</div>
                        <div className="text-4xl font-bold text-[#1E293B] mb-2">
                          {kr.kr_code === 'KR2' ? kr.current_value : `${kr.current_value}${kr.unit}`}
                        </div>
                        <div className="text-body text-[#64748B] mb-3">{getKRLabel(kr.kr_code)} {getKRIcon(kr.kr_code)}</div>
                        {kr.status === 'Met' && (
                          <div className="flex items-center justify-center text-[#10B981]">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-h3 text-[#1E293B] mb-4">Persona Impact</h2>
                <div className="grid grid-cols-2 gap-6">
                  {personaMetrics.slice(0, 2).map((persona) => (
                    <div key={persona.id} className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
                      <h3 className="text-h3 text-[#1E293B] mb-4">{persona.persona_type}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-body text-[#64748B]">Active Users:</span>
                          <span className="text-body text-[#1E293B] font-medium">{persona.total_users} users</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body text-[#64748B]">Sessions:</span>
                          <span className="text-body text-[#1E293B] font-medium">
                            {persona.total_sessions} {persona.primary_framework} sessions
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body text-[#64748B]">
                            {persona.confidence_change !== null ? 'Confidence:' : 'Stress:'}
                          </span>
                          <span className={`text-body font-medium flex items-center gap-2 ${
                            (persona.confidence_change !== null && persona.confidence_change > 0) ||
                            (persona.stress_change !== null && persona.stress_change < 0)
                              ? 'text-[#10B981]'
                              : 'text-[#EF4444]'
                          }`}>
                            {persona.confidence_change !== null ? (
                              <>
                                {persona.confidence_change > 0 ? '+' : ''}{persona.confidence_change}%
                                {persona.confidence_change > 0 && <TrendingUp className="w-4 h-4" />}
                              </>
                            ) : (
                              <>
                                {persona.stress_change}%
                                {persona.stress_change! < 0 && <TrendingDown className="w-4 h-4" />}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-h3 text-[#1E293B] mb-4">Risk & Health</h2>
                <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-body text-[#64748B] mb-2">Compliance Trend</div>
                      <div className="flex items-center gap-3">
                        <span className="text-body text-[#64748B]">
                          {previousHealthMetrics?.compliance_rate}%
                        </span>
                        <span className="text-body text-[#64748B]">→</span>
                        <span className="text-h2 text-[#10B981] font-bold">{healthMetrics?.compliance_rate}%</span>
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-body text-[#64748B] mb-2">Escalation Rate</div>
                      <div className="flex items-center gap-3">
                        <span className="text-h2 text-[#3B82F6] font-bold">{healthMetrics?.escalation_rate}%</span>
                        <span className="text-body text-[#64748B]">(appropriate)</span>
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-body text-[#64748B] mb-2">Live Sessions</div>
                      <div className="flex items-center gap-3">
                        <span className="text-h2 text-[#1E293B] font-bold">{healthMetrics?.active_sessions} active</span>
                        <span className="text-body text-[#64748B]">|</span>
                        <span className="text-body text-[#10B981] font-medium">{healthMetrics?.violations_today} violations today</span>
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {allCriteriaMet ? (
                      <>
                        <div className="flex items-center justify-center w-12 h-12 bg-[#10B981]/10 rounded-full">
                          <CheckCircle className="w-6 h-6 text-[#10B981]" />
                        </div>
                        <div>
                          <div className="text-h3 text-[#10B981] mb-1">All success criteria met</div>
                          <div className="text-body text-[#64748B]">POC ready for production evaluation</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center w-12 h-12 bg-[#F59E0B]/10 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
                        </div>
                        <div>
                          <div className="text-h3 text-[#F59E0B] mb-1">Some criteria not yet met</div>
                          <div className="text-body text-[#64748B]">Continue POC and monitor progress</div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={handleExportReport}>
                      <Download className="w-4 h-4 mr-2 inline" />
                      Export POC Report
                    </Button>
                    <Button variant="secondary" onClick={() => onNavigate('investigate')}>
                      <FileText className="w-4 h-4 mr-2 inline" />
                      View Detailed Logs
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

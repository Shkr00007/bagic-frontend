import { useEffect, useState } from 'react';
import { TrendingUp, Eye, Settings, Target, ArrowRight } from 'lucide-react';
import { HRSidebar } from '../components/HRSidebar';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase, GovernanceMetrics } from '../lib/supabase';

type HRHomeProps = {
  onNavigate: (view: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops') => void;
};

type KPICard = {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'critical';
  sqlRef: string;
  trend?: 'up' | 'down' | 'stable';
};

export function HRHome({ onNavigate }: HRHomeProps) {
  const { signOut } = useAuth();
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('Last 30 days');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    const { data } = await supabase
      .from('governance_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setMetrics(data);
    }

    setLoading(false);
  };

  const kpis: KPICard[] = metrics ? [
    {
      label: 'Framework compliance',
      value: `${metrics.framework_compliance_rate}%`,
      status: metrics.framework_compliance_rate === 100 ? 'success' : 'warning',
      sqlRef: 'SQL-001',
      trend: 'stable'
    },
    {
      label: 'Ethical violations',
      value: String(metrics.ethical_violations_count),
      status: metrics.ethical_violations_count === 0 ? 'success' : 'critical',
      sqlRef: 'SQL-002',
      trend: 'stable'
    },
    {
      label: 'Explainability complete',
      value: `${metrics.explainability_rate}%`,
      status: metrics.explainability_rate === 100 ? 'success' : 'warning',
      sqlRef: 'SQL-003',
      trend: 'stable'
    },
    {
      label: 'Active escalations',
      value: String(metrics.active_escalations_count),
      status: metrics.active_escalations_count === 0 ? 'success' : 'warning',
      sqlRef: 'BT-004',
      trend: 'stable'
    }
  ] : [];

  const getStatusIcon = (status: string) => {
    if (status === 'success') return '✓';
    if (status === 'warning') return '⚠';
    return '✗';
  };

  const getStatusColor = (status: string) => {
    if (status === 'success') return 'text-[#10B981]';
    if (status === 'warning') return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <HRSidebar currentView="dashboard" onNavigate={onNavigate} onSignOut={signOut} />

      <main className="p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-h1 mb-2">AI Coach Health</h1>
              <p className="text-body text-[#64748B]">{dateRange}</p>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-body text-[#64748B]">Loading metrics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-h1 mb-2 flex items-center gap-2">
                          <span className={getStatusColor(kpi.status)}>{kpi.value}</span>
                          <span className={`text-h2 ${getStatusColor(kpi.status)}`}>
                            {getStatusIcon(kpi.status)}
                          </span>
                        </h3>
                        <p className="text-body text-[#64748B] mb-1">{kpi.label}</p>
                        <p className="text-meta text-[#64748B]">[{kpi.sqlRef}]</p>
                      </div>
                      {kpi.trend === 'stable' && (
                        <div className="flex items-center text-[#64748B]">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                      {kpi.trend === 'up' && (
                        <div className="flex items-center text-[#10B981]">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
                <h2 className="text-h2 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-4 gap-4">
                  <Button variant="primary" onClick={() => onNavigate('dashboard')}>
                    <Eye className="w-4 h-4 mr-2 inline" />
                    View recent sessions
                  </Button>
                  <Button variant="secondary" onClick={() => onNavigate('investigate')}>
                    View violations
                  </Button>
                  <Button variant="secondary" onClick={() => onNavigate('configure')}>
                    <Settings className="w-4 h-4 mr-2 inline" />
                    Configure rules
                  </Button>
                  <Button variant="secondary" onClick={() => onNavigate('executive')}>
                    <Target className="w-4 h-4 mr-2 inline" />
                    POC OKRs
                  </Button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-meta text-[#64748B]">
                  Zero-tolerance compliance - Framework-governed - Audit-ready
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

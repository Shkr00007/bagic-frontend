// import { useEffect, useState } from 'react';
// import { Check, AlertCircle } from 'lucide-react';
// import { HRSidebar } from '../components/HRSidebar';
// import { useAuth } from '../contexts/AuthContext';
// import { supabase, GovernanceMetrics, FrameworkUsageStats, PersonaAdoptionStats } from '../lib/supabase';

// type HRDashboardProps = {
//   onNavigate: (view: 'dashboard' | 'configure' | 'investigate' | 'escalations' | 'executive' | 'ops') => void;
// };

// export function HRDashboard({ onNavigate }: HRDashboardProps) {
//   const { signOut } = useAuth();
//   const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
//   const [frameworkStats, setFrameworkStats] = useState<FrameworkUsageStats[]>([]);
//   const [personaStats, setPersonaStats] = useState<PersonaAdoptionStats[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadAllMetrics();
//   }, []);

//   const loadAllMetrics = async () => {
//     const { data: metricsData } = await supabase
//       .from('governance_metrics')
//       .select('*')
//       .order('metric_date', { ascending: false })
//       .limit(1)
//       .maybeSingle();

//     if (metricsData) {
//       setMetrics(metricsData);
//     }

//     const { data: frameworkData } = await supabase
//       .from('framework_usage_stats')
//       .select('*')
//       .order('stat_date', { ascending: false })
//       .limit(10);

//     if (frameworkData) {
//       const latestDate = frameworkData[0]?.stat_date;
//       const latestFrameworks = frameworkData.filter(f => f.stat_date === latestDate);
//       setFrameworkStats(latestFrameworks);
//     }

//     const { data: personaData } = await supabase
//       .from('persona_adoption_stats')
//       .select('*')
//       .order('stat_date', { ascending: false })
//       .limit(10);

//     if (personaData) {
//       const latestDate = personaData[0]?.stat_date;
//       const latestPersonas = personaData.filter(p => p.stat_date === latestDate);
//       setPersonaStats(latestPersonas);
//     }

//     setLoading(false);
//   };

//   const totalFrameworkUsage = frameworkStats.reduce((sum, stat) => sum + stat.usage_count, 0);

//   const getPersonaLabel = (type: string): string => {
//     if (type === 'OH-EC-IC') return 'Early Career';
//     if (type === 'OH-MC-PM') return 'Manager';
//     if (type === 'OH-SL') return 'Senior Leadership';
//     return type;
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] pl-64">
//       <HRSidebar currentView="dashboard" onNavigate={onNavigate} onSignOut={signOut} />

//       <main className="p-8">
//         <div className="max-w-[1200px] mx-auto">
//           <div className="mb-8">
//             <h1 className="text-h1 mb-2">Compliance & Risk</h1>
//             <p className="text-body text-[#64748B]">30 day trend</p>
//           </div>

//           {loading ? (
//             <div className="text-center py-12">
//               <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//               <p className="text-body text-[#64748B]">Loading compliance metrics...</p>
//             </div>
//           ) : (
//             <>
//               <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 mb-6">
//                 <h2 className="text-h2 mb-6">Critical Metrics</h2>
//                 <div className="grid grid-cols-4 gap-6">
//                   <div className="border-r border-[#E2E8F0] pr-6">
//                     <div className="flex items-center gap-2 mb-2">
//                       <p className="text-body text-[#64748B]">Framework mapping</p>
//                       <span className="text-meta text-[#64748B]">[SQL-001]</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <p className="text-h1 text-[#10B981]">{metrics?.framework_compliance_rate}%</p>
//                       <Check className="w-6 h-6 text-[#10B981]" />
//                     </div>
//                   </div>

//                   <div className="border-r border-[#E2E8F0] pr-6">
//                     <div className="flex items-center gap-2 mb-2">
//                       <p className="text-body text-[#64748B]">Violations</p>
//                       <span className="text-meta text-[#64748B]">[SQL-002]</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <p className="text-h1 text-[#10B981]">{metrics?.ethical_violations_count}</p>
//                       <Check className="w-6 h-6 text-[#10B981]" />
//                     </div>
//                   </div>

//                   <div className="border-r border-[#E2E8F0] pr-6">
//                     <div className="flex items-center gap-2 mb-2">
//                       <p className="text-body text-[#64748B]">Explainability</p>
//                       <span className="text-meta text-[#64748B]">[SQL-003]</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <p className="text-h1 text-[#10B981]">{metrics?.explainability_rate}%</p>
//                       <Check className="w-6 h-6 text-[#10B981]" />
//                     </div>
//                   </div>

//                   <div>
//                     <div className="flex items-center gap-2 mb-2">
//                       <p className="text-body text-[#64748B]">Escalations</p>
//                       <span className="text-meta text-[#64748B]">[SQL-005]</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <p className="text-h1 text-[#F59E0B]">{metrics?.active_escalations_count}</p>
//                       <AlertCircle className="w-6 h-6 text-[#F59E0B]" />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 mb-6">
//                 <h2 className="text-h2 mb-6">Framework Breakdown</h2>
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-[#E2E8F0]">
//                       <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Framework</th>
//                       <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Usage</th>
//                       <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">Compliance</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {frameworkStats.map((stat) => {
//                       const percentage = totalFrameworkUsage > 0
//                         ? Math.round((stat.usage_count / totalFrameworkUsage) * 100)
//                         : 0;

//                       return (
//                         <tr key={stat.id} className="border-b border-[#E2E8F0] last:border-0">
//                           <td className="py-4 px-4 text-body text-[#1E293B]">{stat.framework_type}</td>
//                           <td className="py-4 px-4 text-body text-[#64748B]">{percentage}%</td>
//                           <td className="py-4 px-4">
//                             <div className="flex items-center gap-2">
//                               <span className="text-body text-[#10B981]">{stat.compliance_rate}%</span>
//                               <Check className="w-4 h-4 text-[#10B981]" />
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8">
//                 <div className="flex items-center gap-2 mb-6">
//                   <h2 className="text-h2">Persona Adoption</h2>
//                   <span className="text-meta text-[#64748B]">[SQL-004]</span>
//                 </div>
//                 <div className="space-y-4">
//                   {personaStats.map((stat) => (
//                     <div key={stat.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg">
//                       <div className="flex-1">
//                         <p className="text-body text-[#1E293B] mb-1">{getPersonaLabel(stat.persona_type)}</p>
//                         <div className="flex items-center gap-3">
//                           <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
//                             <div
//                               className="h-full bg-[#1E40AF] rounded-full"
//                               style={{ width: `${stat.adoption_rate}%` }}
//                             />
//                           </div>
//                           <span className="text-body text-[#64748B] w-16 text-right">
//                             {stat.adoption_rate}% active
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="mt-8 text-center">
//                 <p className="text-meta text-[#64748B]">
//                   Zero-tolerance compliance - Framework-governed - Audit-ready
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { HRSidebar } from '../components/HRSidebar';
import { useAuth } from '../contexts/AuthContext';

type HRDashboardProps = {
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

type GovernanceMetrics = {
  framework_compliance_rate: number;
  ethical_violations_count: number;
  explainability_rate: number;
  active_escalations_count: number;
};

type FrameworkUsageStats = {
  id: string;
  framework_type: string;
  usage_count: number;
  compliance_rate: number;
};

type PersonaAdoptionStats = {
  id: string;
  persona_type: string;
  adoption_rate: number;
};

export function HRDashboard({ onNavigate }: HRDashboardProps) {
  const { signOut } = useAuth();

  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [frameworkStats, setFrameworkStats] = useState<FrameworkUsageStats[]>([]);
  const [personaStats, setPersonaStats] = useState<PersonaAdoptionStats[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     Load Synthetic Metrics
  ========================= */

  useEffect(() => {
    setLoading(true);

    // Synthetic Governance Metrics
    setMetrics({
      framework_compliance_rate: 98,
      ethical_violations_count: 0,
      explainability_rate: 95,
      active_escalations_count: 1,
    });

    // Synthetic Framework Usage
    setFrameworkStats([
      { id: '1', framework_type: 'GROW', usage_count: 45, compliance_rate: 99 },
      { id: '2', framework_type: 'CLEAR', usage_count: 30, compliance_rate: 96 },
      { id: '3', framework_type: 'ITC', usage_count: 25, compliance_rate: 94 },
    ]);

    // Synthetic Persona Adoption
    setPersonaStats([
      { id: '1', persona_type: 'OH-EC-IC', adoption_rate: 88 },
      { id: '2', persona_type: 'OH-MC-PM', adoption_rate: 76 },
      { id: '3', persona_type: 'OH-SL', adoption_rate: 69 },
    ]);

    setLoading(false);
  }, []);

  const totalFrameworkUsage = frameworkStats.reduce(
    (sum, stat) => sum + stat.usage_count,
    0
  );

  const getPersonaLabel = (type: string): string => {
    if (type === 'OH-EC-IC') return 'Early Career';
    if (type === 'OH-MC-PM') return 'Manager';
    if (type === 'OH-SL') return 'Senior Leadership';
    return type;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pl-64">
      <HRSidebar
        currentView="dashboard"
        onNavigate={onNavigate}
        onSignOut={signOut}
      />

      <main className="p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-h1 mb-2">Compliance & Risk</h1>
            <p className="text-body text-[#64748B]">
              Synthetic 30-day trend
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-body text-[#64748B]">
                Loading compliance metrics...
              </p>
            </div>
          ) : (
            <>
              {/* Critical Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 mb-6">
                <h2 className="text-h2 mb-6">Critical Metrics</h2>
                <div className="grid grid-cols-4 gap-6">
                  <MetricCard
                    label="Framework mapping"
                    value={`${metrics?.framework_compliance_rate}%`}
                    success
                  />
                  <MetricCard
                    label="Violations"
                    value={`${metrics?.ethical_violations_count}`}
                    success
                  />
                  <MetricCard
                    label="Explainability"
                    value={`${metrics?.explainability_rate}%`}
                    success
                  />
                  <MetricCard
                    label="Escalations"
                    value={`${metrics?.active_escalations_count}`}
                    warning
                  />
                </div>
              </div>

              {/* Framework Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 mb-6">
                <h2 className="text-h2 mb-6">Framework Breakdown</h2>

                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">
                        Framework
                      </th>
                      <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">
                        Usage
                      </th>
                      <th className="text-left py-3 px-4 text-body font-medium text-[#64748B]">
                        Compliance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {frameworkStats.map((stat) => {
                      const percentage =
                        totalFrameworkUsage > 0
                          ? Math.round(
                              (stat.usage_count / totalFrameworkUsage) * 100
                            )
                          : 0;

                      return (
                        <tr
                          key={stat.id}
                          className="border-b border-[#E2E8F0] last:border-0"
                        >
                          <td className="py-4 px-4 text-body text-[#1E293B]">
                            {stat.framework_type}
                          </td>
                          <td className="py-4 px-4 text-body text-[#64748B]">
                            {percentage}%
                          </td>
                          <td className="py-4 px-4 text-[#10B981] flex items-center gap-2">
                            {stat.compliance_rate}%
                            <Check className="w-4 h-4" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Persona Adoption */}
              <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8">
                <h2 className="text-h2 mb-6">Persona Adoption</h2>

                <div className="space-y-4">
                  {personaStats.map((stat) => (
                    <div
                      key={stat.id}
                      className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-body text-[#1E293B] mb-1">
                          {getPersonaLabel(stat.persona_type)}
                        </p>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1E40AF] rounded-full"
                              style={{ width: `${stat.adoption_rate}%` }}
                            />
                          </div>

                          <span className="text-body text-[#64748B] w-16 text-right">
                            {stat.adoption_rate}% active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-meta text-[#64748B]">
                  Synthetic compliance mode - Local only - Audit simulation
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================
   Reusable Metric Card
========================= */

function MetricCard({
  label,
  value,
  success,
  warning,
}: {
  label: string;
  value: string;
  success?: boolean;
  warning?: boolean;
}) {
  return (
    <div>
      <p className="text-body text-[#64748B] mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <p
          className={`text-h1 ${
            success ? 'text-[#10B981]' : warning ? 'text-[#F59E0B]' : ''
          }`}
        >
          {value}
        </p>
        {success && <Check className="w-6 h-6 text-[#10B981]" />}
        {warning && <AlertCircle className="w-6 h-6 text-[#F59E0B]" />}
      </div>
    </div>
  );
}

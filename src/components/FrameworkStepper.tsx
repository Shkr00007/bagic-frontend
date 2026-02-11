type FrameworkType = 'GROW' | 'CLEAR' | 'ITC' | 'KOLB';

type FrameworkStepperProps = {
  framework: FrameworkType;
  currentStage: string;
  personaType?: string;
};

const FRAMEWORK_STAGES = {
  GROW: ['Goal', 'Reality', 'Options', 'Way Forward'],
  CLEAR: ['Contract', 'Listen', 'Explore', 'Action', 'Review'],
  ITC: ['Immunity Map', 'Competing Commitments', 'Big Assumptions', 'Safe Experiments'],
  KOLB: ['Experience', 'Reflect', 'Conceptualize', 'Experiment']
};

export function FrameworkStepper({ framework, currentStage, personaType }: FrameworkStepperProps) {
  const stages = FRAMEWORK_STAGES[framework] || FRAMEWORK_STAGES.GROW;

  const getPersonaLabel = () => {
    if (personaType === 'OH-EC-IC') return 'EC-IC';
    if (personaType === 'OH-MC-PM') return 'MC-PM';
    if (personaType === 'OH-SL') return 'SL';
    return '';
  };

  return (
    <div className="bg-white border-b border-[#E2E8F0] py-3 px-6 md:px-12">
      <div className="max-w-[960px] mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-meta text-[#64748B]">Framework:</span>
            <span className="text-body font-medium text-[#1E40AF]">{framework}</span>
            {personaType && (
              <span className="text-meta text-[#64748B]">({getPersonaLabel()})</span>
            )}
          </div>
          <span className="text-meta text-[#10B981]">Boundary check ✓</span>
        </div>

        <div className="flex items-center gap-2">
          {stages.map((stage, index) => {
            const isActive = stage === currentStage;
            const isPassed = stages.indexOf(currentStage) > index;

            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-full h-2 rounded-full transition-colors ${
                    isActive || isPassed ? 'bg-[#1E40AF]' : 'bg-[#E2E8F0]'
                  }`} />
                  <div className="flex items-center gap-1 mt-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-[#1E40AF]' : isPassed ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'
                    }`} />
                    <span className={`text-meta whitespace-nowrap ${
                      isActive ? 'text-[#1E40AF] font-medium' : 'text-[#64748B]'
                    }`}>
                      {stage}
                    </span>
                  </div>
                </div>
                {index < stages.length - 1 && (
                  <div className="w-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

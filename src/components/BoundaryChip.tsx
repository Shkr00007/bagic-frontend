import { Check } from 'lucide-react';

type BoundaryChipProps = {
  text: string;
  status?: 'success' | 'warning' | 'critical';
};

export function BoundaryChip({ text, status = 'success' }: BoundaryChipProps) {
  const statusStyles = {
    success: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    critical: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-meta ${statusStyles[status]}`}>
      {status === 'success' && <Check className="w-3 h-3" />}
      {text}
    </span>
  );
}

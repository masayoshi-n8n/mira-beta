import { cn } from '@/lib/utils';
import type { ConfidenceLevel } from '@/lib/types';

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  className?: string;
}

const CONFIG = {
  high: { label: 'High confidence', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  inferred: { label: 'Inferred', dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  discarded: { label: 'Low confidence', dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50' },
};

export function ConfidenceIndicator({ level, className }: ConfidenceIndicatorProps) {
  const c = CONFIG[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        c.bg,
        c.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}

import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import type { KnowledgeBaseItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  status: KnowledgeBaseItem['status'];
  className?: string;
}

const CONFIG = {
  ready: { icon: CheckCircle2, label: 'Ready', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  queued: { icon: Clock, label: 'Queued', color: 'text-muted-foreground', bg: 'bg-muted' },
  processing: { icon: Loader2, label: 'Processing', color: 'text-blue-600', bg: 'bg-blue-50' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-600', bg: 'bg-red-50' },
};

export function ProcessingStatus({ status, className }: ProcessingStatusProps) {
  const { icon: Icon, label, color, bg } = CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
        bg,
        color,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', status === 'processing' && 'animate-spin')} />
      {label}
    </span>
  );
}

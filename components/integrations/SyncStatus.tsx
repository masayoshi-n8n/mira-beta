import { CheckCircle2, Loader2, AlertCircle, WifiOff } from 'lucide-react';
import type { Integration } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SyncStatusProps {
  status: Integration['status'];
}

const CONFIG = {
  connected: { icon: CheckCircle2, label: 'Connected', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  syncing: { icon: Loader2, label: 'Syncing…', color: 'text-blue-600', bg: 'bg-blue-50' },
  error: { icon: AlertCircle, label: 'Error', color: 'text-red-600', bg: 'bg-red-50' },
  disconnected: { icon: WifiOff, label: 'Disconnected', color: 'text-muted-foreground', bg: 'bg-muted' },
};

export function SyncStatus({ status }: SyncStatusProps) {
  const { icon: Icon, label, color, bg } = CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', bg, color)}>
      <Icon className={cn('h-3 w-3', status === 'syncing' && 'animate-spin')} />
      {label}
    </span>
  );
}

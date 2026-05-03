import {
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ActivityItem } from '@/lib/types';

interface ActivityFeedProps {
  items: ActivityItem[];
}

const TYPE_CONFIG = {
  node_added: {
    icon: <PlusCircle className="h-4 w-4" />,
    color: 'text-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700',
    label: 'Added',
  },
  conflict_detected: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700',
    label: 'Conflict',
  },
  sync_completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Synced',
  },
  extraction_failed: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Failed',
  },
} as const;

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const visible = items.slice(0, 7);

  return (
    <div className="rounded-xl border bg-background">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Activity</h2>
      </div>
      <div className="divide-y">
        {visible.map((item) => {
          const config = TYPE_CONFIG[item.type];
          return (
            <div key={item.id} className="flex items-start gap-3 px-4 py-3">
              <div className={`mt-0.5 shrink-0 ${config.color}`}>
                {config.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`h-4 px-1.5 text-[10px] border-0 ${config.badge}`}
                  >
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(item.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

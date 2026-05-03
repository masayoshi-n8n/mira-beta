import { Network, GitBranch, Plug, CalendarDays } from 'lucide-react';

interface LPMStatsSummaryProps {
  nodeCount: number;
  edgeCount: number;
  integrationCount: number;
  daysOfContext: number;
}

interface StatItem {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

export function LPMStatsSummary({
  nodeCount,
  edgeCount,
  integrationCount,
  daysOfContext,
}: LPMStatsSummaryProps) {
  const stats: StatItem[] = [
    {
      icon: <Network className="h-4 w-4" />,
      value: nodeCount,
      label: 'nodes mapped',
      color: 'text-indigo-600',
    },
    {
      icon: <GitBranch className="h-4 w-4" />,
      value: edgeCount,
      label: 'connections',
      color: 'text-violet-600',
    },
    {
      icon: <Plug className="h-4 w-4" />,
      value: integrationCount,
      label: 'active integrations',
      color: 'text-blue-600',
    },
    {
      icon: <CalendarDays className="h-4 w-4" />,
      value: daysOfContext,
      label: 'days of context',
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3"
        >
          <div className={`shrink-0 ${stat.color}`}>{stat.icon}</div>
          <div>
            <p className="text-xl font-semibold leading-none">{stat.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

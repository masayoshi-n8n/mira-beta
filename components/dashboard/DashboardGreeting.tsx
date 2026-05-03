'use client';

import { useStore } from '@/lib/store';

export function DashboardGreeting() {
  const user = useStore((s) => s.user);
  const name = user?.name?.split(' ')[0] ?? 'there';

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {greeting}, {name}.
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Here&apos;s what Mira has been tracking in your product context.
      </p>
    </div>
  );
}

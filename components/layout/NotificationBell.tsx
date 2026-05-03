'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { getNotifications } from '@/lib/data';
import { cn } from '@/lib/utils';

const TYPE_LABELS = {
  sync_completed: 'Sync',
  extraction_failed: 'Error',
  conflict_detected: 'Conflict',
};

const TYPE_COLORS = {
  sync_completed: 'bg-green-100 text-green-700',
  extraction_failed: 'bg-red-100 text-red-700',
  conflict_detected: 'bg-yellow-100 text-yellow-700',
};

export function NotificationBell() {
  const { notificationCount, resetNotifications } = useStore();
  const notifications = getNotifications();

  return (
    <Sheet>
      <SheetTrigger
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={resetNotifications}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
            {notificationCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'rounded-lg border p-3 text-sm',
                !n.read && 'border-indigo-200 bg-indigo-50/50'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    'shrink-0 rounded px-1.5 py-0.5 text-xs font-medium',
                    TYPE_COLORS[n.type]
                  )}
                >
                  {TYPE_LABELS[n.type]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(n.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1.5 text-muted-foreground">{n.message}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import Link from 'next/link';
import { NotificationBell } from './NotificationBell';
import { useStore } from '@/lib/store';

export function GlobalHeader() {
  const user = useStore((s) => s.user);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AC';

  return (
    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
      {/* Workspace selector */}
      <button className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50 transition-colors">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 text-[10px] font-bold text-gray-700">
          {initials}
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Workspace</span>
          <span className="text-sm font-medium text-gray-800 mt-0.5">Personal</span>
        </div>
        <svg className="h-4 w-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 9l4-4 4 4" />
          <path d="M8 15l4 4 4-4" />
        </svg>
      </button>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        <Link href="/settings">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 hover:bg-indigo-200 transition-colors">
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalNav } from './GlobalNav';
import { NotificationBell } from './NotificationBell';
import { UploadButton } from './UploadButton';
import { useStore } from '@/lib/store';

export function GlobalHeader() {
  const { user, logout } = useStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/onboarding');
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AC';

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-xs font-bold text-white">M</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Mira</span>
        </Link>

        {/* Center nav */}
        <GlobalNav />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <UploadButton />
          <NotificationBell />
          <Link href="/settings">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 hover:bg-indigo-200 transition-colors"
              aria-label="Settings"
            >
              {initials}
            </button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-7 w-7"
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

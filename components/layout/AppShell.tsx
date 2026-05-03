'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { GlobalHeader } from './GlobalHeader';
import { UploadModal } from '@/components/upload/UploadModal';
import { useStore } from '@/lib/store';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const hasHydrated = useStore((s) => s._hasHydrated);
  const login = useStore((s) => s.login);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const isPublicRoute = pathname === '/' || pathname === '/onboarding';

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoggedIn && !isPublicRoute) {
      // Auto-login as the demo user so any URL works without a manual login step
      login({ name: 'Alex Chen', email: 'alex.chen@linkedin.com', role: 'Product Manager', company: 'LinkedIn' });
      completeOnboarding();
    }
  }, [isLoggedIn, isPublicRoute, hasHydrated, login, completeOnboarding]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!hasHydrated || !isLoggedIn) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <GlobalHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <UploadModal />
    </div>
  );
}

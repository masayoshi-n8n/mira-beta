'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { GlobalHeader } from './GlobalHeader';
import { UploadModal } from '@/components/upload/UploadModal';
import { useStore } from '@/lib/store';

interface AppShellProps {
  children: React.ReactNode;
}

const DEMO_USER = {
  name: 'Alex Chen',
  email: 'alex.chen@linkedin.com',
  role: 'Product Manager',
  company: 'LinkedIn',
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const login = useStore((s) => s.login);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const isPublicRoute = pathname === '/' || pathname === '/onboarding';

  // Auto-login as demo user on any protected route so direct URLs always work
  useEffect(() => {
    if (!isLoggedIn && !isPublicRoute) {
      login(DEMO_USER);
      completeOnboarding();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isPublicRoute) {
    return <>{children}</>;
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

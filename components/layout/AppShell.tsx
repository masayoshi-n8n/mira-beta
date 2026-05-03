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
  const isPublicRoute = pathname === '/' || pathname === '/onboarding';

  useEffect(() => {
    if (!isLoggedIn && !isPublicRoute) {
      router.push('/');
    }
  }, [isLoggedIn, isPublicRoute, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isLoggedIn) {
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

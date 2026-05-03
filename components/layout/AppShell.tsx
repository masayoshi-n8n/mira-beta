'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const isPublicRoute = pathname === '/onboarding' || pathname === '/';

  useEffect(() => {
    if (!isLoggedIn && !isPublicRoute) {
      router.push('/onboarding');
    }
  }, [isLoggedIn, isPublicRoute, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <GlobalHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <UploadModal />
    </div>
  );
}

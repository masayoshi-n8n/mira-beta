'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Database, Layers, Store, Settings, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/product-map', label: 'Product Map', icon: Network },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: Database },
  { href: '/projects', label: 'Projects', icon: Layers },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
];

const PI_ITEMS = ['Product Identity', 'Task Intent', 'Documents', 'Live Data'];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full w-60 shrink-0 border-r border-gray-200 bg-white px-4 py-6">
      <Link href="/dashboard" className="mb-8 px-2">
        <span className="text-[28px] font-bold leading-none" style={{ color: '#4F3DD5' }}>Mira</span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-[#4F3DD5]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <Icon
                className={cn('h-4 w-4 shrink-0', active ? 'text-[#4F3DD5]' : 'text-gray-400')}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 space-y-2.5">
        <p className="px-3 text-xs font-semibold text-gray-700 tracking-wide">
          Product Intelligence
        </p>
        <div className="flex flex-col gap-0.5">
          {PI_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-2.5 rounded-md px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
              <span className="text-sm text-gray-400">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/knowledge-base"
        className="mt-3 px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-75"
        style={{ color: '#4F3DD5' }}
      >
        What Mira Knows
      </Link>

      <div className="mt-auto">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-indigo-50 text-[#4F3DD5]'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
          )}
        >
          <Settings
            className={cn(
              'h-4 w-4 shrink-0',
              pathname === '/settings' ? 'text-[#4F3DD5]' : 'text-gray-400'
            )}
          />
          Settings
        </Link>
      </div>
    </aside>
  );
}

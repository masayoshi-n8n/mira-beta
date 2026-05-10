'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Database, Layers, Workflow, Settings, Network, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/projects', label: 'Projects', icon: Layers },
  { href: '/product-map', label: 'Product Map', icon: Network },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: Database },
  { href: '/integrations', label: 'Integrations', icon: Workflow },
];

const PI_ITEMS = ['Product Identity', 'Task Intent', 'Documents', 'Live Data'];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useStore((s) => s.setSidebarCollapsed);

  return (
    <aside
      className={cn(
        'flex flex-col h-full shrink-0 border-r border-gray-200 bg-white py-6 transition-all duration-200 overflow-hidden',
        collapsed ? 'w-14 px-2' : 'w-60 px-4'
      )}
    >
      {/* Logo + toggle */}
      <div className={cn('flex items-center mb-8', collapsed ? 'justify-center' : 'justify-between px-2')}>
        <Link href="/dashboard" className="shrink-0">
          {collapsed ? (
            <span className="text-xl font-bold leading-none" style={{ color: '#4F3DD5' }}>M</span>
          ) : (
            <span className="text-[28px] font-bold leading-none" style={{ color: '#4F3DD5' }}>Mira</span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
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
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center rounded-lg transition-colors',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-indigo-50 text-[#4F3DD5]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <Icon
                className={cn('h-4 w-4 shrink-0', active ? 'text-[#4F3DD5]' : 'text-gray-400')}
              />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Product Intelligence section — hidden when collapsed */}
      {!collapsed && (
        <>
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
        </>
      )}

      {/* Bottom: expand button (collapsed) or settings link (expanded) */}
      <div className="mt-auto flex flex-col gap-0.5">
        {collapsed ? (
          <>
            <Link
              href="/settings"
              title="Settings"
              className={cn(
                'flex items-center justify-center rounded-lg p-2.5 transition-colors',
                pathname === '/settings'
                  ? 'bg-indigo-50 text-[#4F3DD5]'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
            </Link>
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="flex items-center justify-center rounded-lg p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : (
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
        )}
      </div>
    </aside>
  );
}

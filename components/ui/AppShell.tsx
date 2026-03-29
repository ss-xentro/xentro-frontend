'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import AppShellSidebar, { NavIcon, MOBILE_NAV_ITEMS, DASHBOARD_PATH, getDashboardUrl } from './AppShellSidebar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = isAuthenticated
    ? [{ icon: 'dashboard', label: 'Dashboard', href: getDashboardUrl(user?.role), path: DASHBOARD_PATH }, ...MOBILE_NAV_ITEMS]
    : MOBILE_NAV_ITEMS;

  function isActive(item: typeof navItems[number]) {
    if (item.href === '/explore/institute') return pathname.startsWith('/explore');
    if (item.href === '/events') return pathname === '/events' || pathname.startsWith('/events/');
    if (item.label === 'Dashboard') {
      const dashHref = item.href;
      return pathname === dashHref || pathname.startsWith(dashHref + '/');
    }
    return pathname === item.href;
  }

  return (
    <div className="h-screen bg-background text-(--primary) font-sans overflow-hidden">
      <div className="flex h-full">
        <AppShellSidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

        <main className="flex-1 min-w-0 border-r border-(--border) overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-(--background)/95 backdrop-blur-xl border-t border-(--border) z-50">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.icon}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                  active ? 'bg-(--accent-light)' : '',
                )}
              >
                <NavIcon svgPath={item.path} active={active} />
                <span className={cn('text-[10px] font-medium', active ? 'text-(--primary)' : 'text-(--secondary-light)')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

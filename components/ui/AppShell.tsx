'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import AppShellSidebar, { NavIcon, NAV_ITEMS, DASHBOARD_PATH, getDashboardUrl } from './AppShellSidebar';

interface AppShellProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
  secondarySidebar?: ReactNode;
}

export default function AppShell({ children, rightSidebar, secondarySidebar }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = isAuthenticated
    ? [{ icon: 'dashboard', label: 'Dashboard', href: getDashboardUrl(user?.role), path: DASHBOARD_PATH }, ...NAV_ITEMS]
    : NAV_ITEMS;

  function isActive(item: typeof navItems[number]) {
    if (item.href === '/explore/institute') return pathname.startsWith('/explore');
    if (item.label === 'Dashboard') {
      const dashHref = item.href;
      return pathname === dashHref || pathname.startsWith(dashHref + '/');
    }
    return pathname === item.href;
  }

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white font-sans">
      <div className="max-w-360 mx-auto flex">
        <AppShellSidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

        {secondarySidebar}

        <main className="flex-1 min-w-0 border-r border-white/10">
          {children}
        </main>

        {rightSidebar && (
          <aside className="sticky top-0 h-screen w-80 shrink-0 hidden xl:block p-4 overflow-y-auto">
            {rightSidebar}
          </aside>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0B0D10]/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.icon}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                  active ? 'bg-white/10' : '',
                )}
              >
                <NavIcon svgPath={item.path} active={active} />
                <span className={cn('text-[10px] font-medium', active ? 'text-white' : 'text-gray-500')}>
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { BASE_NAV_ITEMS, getDashboardUrl, DASHBOARD_NAV_PATH, EXPLORE_TABS } from './_lib/constants';
import ExploreSidebar from './_components/ExploreSidebar';

function NavIcon({ path, active }: { path: string; active?: boolean }) {
  return (
    <svg
      className={cn('w-6 h-6 transition-all duration-200', active ? 'text-white' : 'text-gray-400')}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={active ? 2.5 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = isAuthenticated
    ? [
        ...BASE_NAV_ITEMS,
        {
          icon: 'dashboard',
          label: 'Dashboard',
          href: getDashboardUrl(user?.role),
          path: DASHBOARD_NAV_PATH,
        },
      ]
    : BASE_NAV_ITEMS;

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white font-sans">
      <div className="max-w-360 mx-auto flex">
        <ExploreSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0B0D10]/90 border-b border-white/10">
            <div className="px-6 pt-5 pb-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">Explore</h1>
              <p className="text-sm text-gray-500 mt-0.5">Discover institutions, startups, and mentors on Xentro</p>
            </div>
            <div className="flex px-6 gap-1">
              {EXPLORE_TABS.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      'relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-t-lg',
                      isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    )}
                  >
                    {tab.label}
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0B0D10]/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              item.href === '/explore/institute' ? pathname.startsWith('/explore') : pathname === item.href;
            return (
              <Link
                key={item.icon}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                  isActive ? 'bg-white/10' : ''
                )}
              >
                <NavIcon path={item.path} active={isActive} />
                <span className={cn('text-[10px] font-medium', isActive ? 'text-white' : 'text-gray-500')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 bg-[#0B0D10]/95 backdrop-blur-xl border-b border-white/10 z-40 flex gap-1 px-4 pt-3 pb-0">
        {EXPLORE_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-colors',
                isActive ? 'text-white' : 'text-gray-500'
              )}
            >
              {tab.label}
              {isActive && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

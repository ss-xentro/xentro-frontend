'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { cn } from '@/lib/utils';

const exploreTabs = [
  { label: 'Institutions', href: '/explore/institute' },
  { label: 'Startups', href: '/explore/startups' },
  { label: 'Mentors', href: '/explore/mentors' },
];

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0B0D10]/90 border-b border-white/10">
        <div className="px-6 pt-5 pb-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">Explore</h1>
          <p className="text-sm text-gray-500 mt-0.5">Discover institutions, startups, and mentors on Xentro</p>
          <div className="md:hidden mt-4 -mx-1 overflow-x-auto">
            <div className="inline-flex min-w-full gap-2 px-1 pb-1">
              {exploreTabs.map((tab) => {
                const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      'flex-1 min-w-[120px] text-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 border',
                      isActive
                        ? 'bg-white text-[#0B0D10] border-white'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10',
                    )}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>
    </AuthGuard>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { EXPLORE_TABS } from './_lib/constants';

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Header + Tabs */}
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
    </>
  );
}

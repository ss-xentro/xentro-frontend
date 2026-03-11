'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGateModal from '@/components/public/AuthGateModal';
import { mockPosts, getDashboardUrl } from './_lib/constants';
import FeedSidebar from './_components/FeedSidebar';
import PostCard from './_components/PostCard';
import RightSidebar from './_components/RightSidebar';
import NavIcon from './_components/NavIcon';
import { cn } from '@/lib/utils';

export default function FeedPage() {
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = isAuthenticated ? [
    { icon: 'dashboard', label: 'Dashboard', href: getDashboardUrl(user?.role) },
    { icon: 'feed', label: 'Feed', href: '/feed' },
    { icon: 'explore', label: 'Explore', href: '/explore/institute' },
    { icon: 'bell', label: 'Notifications', href: '/notifications' },
  ] : [];

  const requireAuth = (callback?: () => void) => {
    if (!isAuthenticated) {
      setAuthGateOpen(true);
      return;
    }
    callback?.();
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white font-sans">
      <div className="max-w-360 mx-auto flex">
        {/* Left Sidebar - Navigation */}
        <FeedSidebar />

        {/* Main Feed */}
        <main className="flex-1 min-w-0 border-r border-white/10">
          <div className="max-w-170 mx-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0B0D10]/80 border-b border-white/10 p-4">
              {isAuthenticated ? (
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 shrink-0" />
                  <button className="flex-1 text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:bg-white/[0.07] transition-colors text-[15px]">
                    What&apos;s happening?
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src="/xentro-logo.png" alt="Xentro" width={32} height={32} className="rounded-lg" />
                    <span className="text-white font-bold text-lg">Feed</span>
                  </div>
                  <Link href="/join" className="px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                    Join Xentro
                  </Link>
                </div>
              )}
            </div>

            {/* Posts Feed */}
            <div className="p-4">
              {mockPosts.map((post, index) => (
                <PostCard key={post.id} post={post} isLast={index === mockPosts.length - 1} onRequireAuth={!isAuthenticated ? () => setAuthGateOpen(true) : undefined} />
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Trending & Suggestions */}
        <RightSidebar onRequireAuth={() => requireAuth()} />
      </div>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0B0D10]/95 backdrop-blur-xl border-t border-white/10 z-50">
          <div className="flex items-center justify-around px-2 py-3">
            {navItems.map((item) => {
              let isActive = false;
              if (item.href === '/explore/institute') {
                isActive = pathname.startsWith('/explore');
              } else if (item.label === 'Dashboard') {
                isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              } else {
                isActive = pathname === item.href;
              }

              return (
                <Link
                  key={item.icon}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                    isActive ? 'bg-white/10' : ''
                  )}
                >
                  <NavIcon icon={item.icon} active={isActive} />
                  <span className={cn('text-[10px] font-medium', isActive ? 'text-white' : 'text-gray-500')}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Mobile FAB */}
      {isAuthenticated && (
        <button className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Auth Gate Modal */}
      <AuthGateModal isOpen={authGateOpen} onClose={() => setAuthGateOpen(false)} />
    </div>
  );
}

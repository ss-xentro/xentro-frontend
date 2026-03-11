'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import AuthGateModal from '@/components/public/AuthGateModal';
import { mockPosts } from './_lib/constants';
import PostCard from './_components/PostCard';
import RightSidebar from './_components/RightSidebar';

export default function FeedPage() {
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const requireAuth = (callback?: () => void) => {
    if (!isAuthenticated) {
      setAuthGateOpen(true);
      return;
    }
    callback?.();
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 overflow-y-auto">
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
      </div>

      {/* Right Sidebar */}
      <aside className="sticky top-0 h-full w-80 shrink-0 hidden xl:block p-4 overflow-y-auto border-l border-white/10">
        <RightSidebar onRequireAuth={() => requireAuth()} />
      </aside>

      {/* Auth Gate Modal */}
      <AuthGateModal isOpen={authGateOpen} onClose={() => setAuthGateOpen(false)} />
    </div>
  );
}

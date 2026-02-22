'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  replies: number;
  reposts: number;
  likes: number;
  bookmarks: number;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Chen',
      username: 'sarahchen',
      avatar: '/api/placeholder/48/48',
    },
    content: 'Just closed our Series A! Excited to scale our climate tech solution to 50+ cities by 2027. Building the future we want to see 🌍',
    image: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800',
    timestamp: '2h',
    replies: 24,
    reposts: 89,
    likes: 342,
    bookmarks: 56,
  },
  {
    id: '2',
    author: {
      name: 'Alex Kumar',
      username: 'alexkumar',
      avatar: '/api/placeholder/48/48',
    },
    content: 'New research paper on AI-driven drug discovery just published. We reduced screening time from 6 months to 2 weeks. Science is accelerating.',
    timestamp: '4h',
    replies: 67,
    reposts: 234,
    likes: 891,
    bookmarks: 145,
  },
  {
    id: '3',
    author: {
      name: 'Maya Rodriguez',
      username: 'mayarodriguez',
      avatar: '/api/placeholder/48/48',
    },
    content: 'Reflecting on 3 years building in stealth. Sometimes the best strategy is to ship quietly and let the product speak. Our beta waitlist hit 10k today.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    timestamp: '6h',
    replies: 156,
    reposts: 423,
    likes: 1247,
    bookmarks: 289,
  },
];

const navItems = [
  { icon: 'home', label: 'Home', href: '/feed' },
  { icon: 'explore', label: 'Explore', href: '/explore/institute' },
  { icon: 'bell', label: 'Notifications', href: '/notifications' },
];

const trending = [
  { tag: 'ClimaTech', posts: '2.4K' },
  { tag: 'SeriesA', posts: '1.8K' },
  { tag: 'AI Research', posts: '3.2K' },
  { tag: 'Sustainability', posts: '892' },
];

const suggestions = [
  { name: 'TechVentures', username: 'techventures', avatar: '/api/placeholder/40/40' },
  { name: 'Innovation Hub', username: 'innovationhub', avatar: '/api/placeholder/40/40' },
  { name: 'Startup Insider', username: 'startupinsider', avatar: '/api/placeholder/40/40' },
];

function NavIcon({ icon, active }: { icon: string; active?: boolean }) {
  const iconPaths: Record<string, string> = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    explore: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  };

  return (
    <svg
      className={cn('w-6 h-6 transition-all duration-200', active ? 'text-white' : 'text-gray-400')}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={active ? 2.5 : 2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon]} />
    </svg>
  );
}

function PostCard({ post, isLast }: { post: Post; isLast?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div
      className={cn(
        'relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20',
        'animate-fadeIn',
        !isLast && 'mb-3'
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 overflow-hidden">
            <div className="w-full h-full bg-gray-700" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white text-[15px]">{post.author.name}</span>
            <span className="text-gray-500 text-[14px]">@{post.author.username}</span>
            <span className="text-gray-600 text-[14px]">·</span>
            <span className="text-gray-600 text-[14px]">{post.timestamp}</span>
          </div>

          {/* Post Text */}
          <p className="text-gray-200 text-[15px] leading-relaxed mb-3">{post.content}</p>

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md pt-1">
            {/* Reply */}
            <button className="group flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-[13px]">{post.replies}</span>
            </button>

            {/* Repost */}
            <button className="group flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-[13px]">{post.reposts}</span>
            </button>

            {/* Like */}
            <button
              onClick={() => setLiked(!liked)}
              className={cn(
                'group flex items-center gap-2 transition-colors',
                liked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                liked ? 'bg-pink-500/10 scale-110' : 'group-hover:bg-pink-500/10'
              )}>
                <svg className="w-4.5 h-4.5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-[13px]">{post.likes + (liked ? 1 : 0)}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={cn(
                'group flex items-center gap-2 transition-colors',
                bookmarked ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'
              )}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                <svg className="w-4.5 h-4.5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  startup: 'Startup Founder',
  mentor: 'Mentor',
  institution: 'Institution',
  investor: 'Investor',
};

export default function FeedPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Derive username from email
  const username = user?.email ? user.email.split('@')[0] : 'guest';

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white font-sans">
      <div className="max-w-360 mx-auto flex">
        {/* Left Sidebar - Navigation */}
        <aside
          className={cn(
            'relative sticky top-0 h-screen shrink-0 border-r border-white/10 hidden md:flex flex-col transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-20' : 'w-72'
          )}
        >
          <div className="flex-1 flex flex-col items-center px-3 py-6 overflow-hidden">
            {/* Logo + Collapse Toggle */}
            <div className={cn('mb-6 w-full', !isCollapsed && 'px-2')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Image
                    src="/xentro-logo.png"
                    alt="Xentro"
                    width={36}
                    height={36}
                    className="rounded-lg shrink-0"
                  />
                  <span
                    className={cn(
                      'text-white font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300',
                      isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                    )}
                  >
                    Xentro
                  </span>
                </div>
                {/* Collapse button */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={cn(
                    'shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200',
                    isCollapsed && 'mx-auto mt-1'
                  )}
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <svg
                    className={cn('w-4 h-4 text-gray-400 transition-transform duration-300', isCollapsed && 'rotate-180')}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              {/* Divider + Role — hidden when collapsed */}
              <div
                className={cn(
                  'mt-4 overflow-hidden transition-all duration-300',
                  isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto'
                )}
              >
                <div className="h-px bg-white/10 mb-3" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  {user?.role ? (ROLE_LABELS[user.role] ?? user.role) : 'Guest'}
                </span>
              </div>
            </div>

            {/* Search Bar */}
            {!isCollapsed && (
              <div className="mb-4 w-full px-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-200"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-1 w-full">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/explore/institute'
                    ? pathname.startsWith('/explore')
                    : pathname === item.href;
                return (
                  <Link
                    key={item.icon}
                    href={item.href}
                    className={cn(
                      'relative w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 group',
                      isCollapsed ? 'justify-center' : '',
                      isActive ? 'bg-white/10 animate-navHighlight' : 'hover:bg-white/5'
                    )}
                  >
                    <NavIcon icon={item.icon} active={isActive} />

                    <span
                      className={cn(
                        'text-[15px] font-medium transition-all duration-300 whitespace-nowrap overflow-hidden',
                        isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                        isActive ? 'text-white' : 'text-gray-400'
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Tooltip when collapsed */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Profile Section */}
          <div className="p-3 border-t border-white/10" ref={profileRef}>
            {/* Profile Popup */}
            {profileOpen && (
              <div className="absolute bottom-20 left-3 right-3 bg-[#15181C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'Guest'}</p>
                  <p className="text-xs text-gray-400 truncate">@{username}</p>
                </div>
                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  {/* Preferences */}
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preferences
                  </button>

                  {/* Help */}
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help &amp; Support
                  </button>

                  <div className="my-1 h-px bg-white/10" />

                  {/* Login / Logout */}
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out @{username}
                    </button>
                  ) : (
                    <Link
                      href="/join"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Log in
                    </Link>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group relative',
                isCollapsed && 'justify-center',
                profileOpen && 'bg-white/5'
              )}
            >
              {/* Avatar */}
              <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              {/* Name + username — hidden when collapsed */}
              <div
                className={cn(
                  'flex-1 text-left overflow-hidden transition-all duration-300',
                  isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                )}
              >
                <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Guest'}</p>
                <p className="text-xs text-gray-400 truncate">@{username}</p>
              </div>
              {/* More icon */}
              {!isCollapsed && (
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              )}
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {user?.name ?? 'Guest'}
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 min-w-0 border-r border-white/10">
          <div className="max-w-170 mx-auto">
            {/* Sticky Compose Bar */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0B0D10]/80 border-b border-white/10 p-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 shrink-0" />
                <button className="flex-1 text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:bg-white/[0.07] transition-colors text-[15px]">
                  What's happening?
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="p-4">
              {mockPosts.map((post, index) => (
                <PostCard key={post.id} post={post} isLast={index === mockPosts.length - 1} />
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Trending & Suggestions */}
        <aside className="sticky top-0 h-screen w-80 shrink-0 hidden xl:block p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Trending */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-white mb-4">Trending</h2>
              <div className="space-y-4">
                {trending.map((item) => (
                  <button key={item.tag} className="w-full text-left hover:bg-white/5 rounded-xl p-2 transition-colors">
                    <p className="text-gray-500 text-xs mb-1">Trending</p>
                    <p className="text-white font-semibold text-[15px]">#{item.tag}</p>
                    <p className="text-gray-500 text-xs mt-1">{item.posts} posts</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-white mb-4">Who to follow</h2>
              <div className="space-y-4">
                {suggestions.map((user) => (
                  <div key={user.username} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{user.name}</p>
                      <p className="text-gray-500 text-xs">@{user.username}</p>
                    </div>
                    <button className="px-4 py-1.5 bg-white text-[#0B0D10] rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0B0D10]/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              item.href === '/explore/institute'
                ? pathname.startsWith('/explore')
                : pathname === item.href;
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

      {/* Mobile FAB */}
      <button className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

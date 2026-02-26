'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import AuthGateModal from './AuthGateModal';

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
    {
        id: '4',
        author: {
            name: 'David Park',
            username: 'davidpark',
            avatar: '/api/placeholder/48/48',
        },
        content: 'Fundraising tip: Your deck should tell a story, not recite metrics. Investors fund vision backed by traction, not traction alone. Make them feel the future.',
        timestamp: '8h',
        replies: 89,
        reposts: 312,
        likes: 724,
        bookmarks: 198,
    },
    {
        id: '5',
        author: {
            name: 'Priya Sharma',
            username: 'priyasharma',
            avatar: '/api/placeholder/48/48',
        },
        content: 'Our open-source ML framework just hit 5K GitHub stars ⭐ Community contributions have grown 300% this quarter. Open source wins again.',
        timestamp: '10h',
        replies: 45,
        reposts: 178,
        likes: 567,
        bookmarks: 112,
    },
];

const trending = [
    { tag: 'ClimaTech', posts: '2.4K' },
    { tag: 'SeriesA', posts: '1.8K' },
    { tag: 'AI Research', posts: '3.2K' },
    { tag: 'Sustainability', posts: '892' },
    { tag: 'OpenSource', posts: '1.1K' },
];

function GuestPostCard({ post, isLast, onInteract }: { post: Post; isLast?: boolean; onInteract: () => void }) {
    return (
        <div
            className={cn(
                'relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20',
                !isLast && 'mb-3'
            )}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 overflow-hidden">
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

                    {/* Actions — all gated */}
                    <div className="flex items-center justify-between max-w-md pt-1">
                        {/* Reply */}
                        <button onClick={onInteract} className="group flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <span className="text-[13px]">{post.replies}</span>
                        </button>

                        {/* Repost */}
                        <button onClick={onInteract} className="group flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <span className="text-[13px]">{post.reposts}</span>
                        </button>

                        {/* Like */}
                        <button onClick={onInteract} className="group flex items-center gap-2 text-gray-500 hover:text-pink-400 transition-colors">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <span className="text-[13px]">{post.likes}</span>
                        </button>

                        {/* Bookmark */}
                        <button onClick={onInteract} className="group flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default function GuestFeed() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    const openAuthGate = () => setShowAuthModal(true);

    return (
        <div className="min-h-screen bg-[#0B0D10] text-white font-sans">
            {/* Guest Navbar */}
            <nav className="sticky top-0 z-50 bg-[#0B0D10]/90 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/xentro-logo.png"
                            alt="Xentro"
                            width={36}
                            height={36}
                            className="rounded-lg"
                        />
                        <span className="text-white font-bold text-xl tracking-tight hidden sm:inline">
                            Xentro
                        </span>
                    </Link>

                    <Link
                        href="/join"
                        className="px-5 py-2.5 bg-white text-[#0B0D10] rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Join
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto flex">
                {/* Feed */}
                <main className="flex-1 min-w-0 border-r border-white/10">
                    <div className="max-w-[680px] mx-auto">
                        {/* Header */}
                        <div className="sticky top-16 z-10 backdrop-blur-xl bg-[#0B0D10]/80 border-b border-white/10 p-4">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 shrink-0" />
                                <button
                                    onClick={openAuthGate}
                                    className="flex-1 text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:bg-white/[0.07] transition-colors text-[15px]"
                                >
                                    What&apos;s happening?
                                </button>
                            </div>
                        </div>

                        {/* Trending Banner */}
                        <div className="p-4 border-b border-white/10">
                            <h2 className="text-lg font-bold text-white mb-1">Trending on Xentro</h2>
                            <p className="text-sm text-gray-500 mb-4">See what the community is talking about</p>
                            <div className="flex gap-2 flex-wrap">
                                {trending.slice(0, 4).map((item) => (
                                    <button
                                        key={item.tag}
                                        onClick={openAuthGate}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-colors"
                                    >
                                        #{item.tag}
                                        <span className="ml-1.5 text-gray-500 text-xs">{item.posts}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Posts Feed */}
                        <div className="p-4">
                            {mockPosts.map((post, index) => (
                                <GuestPostCard
                                    key={post.id}
                                    post={post}
                                    isLast={index === mockPosts.length - 1}
                                    onInteract={openAuthGate}
                                />
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Trending & CTA */}
                <aside className="sticky top-16 h-[calc(100vh-64px)] w-80 shrink-0 hidden xl:block p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {/* Trending */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                            <h2 className="text-lg font-bold text-white mb-4">Trending</h2>
                            <div className="space-y-4">
                                {trending.map((item) => (
                                    <button
                                        key={item.tag}
                                        onClick={openAuthGate}
                                        className="w-full text-left hover:bg-white/5 rounded-xl p-2 transition-colors"
                                    >
                                        <p className="text-gray-500 text-xs mb-1">Trending</p>
                                        <p className="text-white font-semibold text-[15px]">#{item.tag}</p>
                                        <p className="text-gray-500 text-xs mt-1">{item.posts} posts</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Join CTA */}
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-white mb-2">New to Xentro?</h3>
                            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                Join the startup ecosystem. Connect with founders, mentors, and investors.
                            </p>
                            <Link
                                href="/join"
                                className="block w-full py-3 bg-white text-[#0B0D10] rounded-xl text-sm font-semibold text-center hover:bg-gray-100 transition-colors"
                            >
                                Create account
                            </Link>
                            <Link
                                href="/login"
                                className="block w-full py-3 mt-2 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-semibold text-center hover:bg-white/10 transition-colors"
                            >
                                Log in
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Mobile Bottom CTA */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#0B0D10]/95 backdrop-blur-xl border-t border-white/10 z-50 p-3">
                <div className="flex gap-2">
                    <Link
                        href="/join"
                        className="flex-1 py-3 bg-white text-[#0B0D10] rounded-xl text-sm font-semibold text-center hover:bg-gray-100 transition-colors"
                    >
                        Sign up
                    </Link>
                    <Link
                        href="/login"
                        className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-semibold text-center hover:bg-white/10 transition-colors"
                    >
                        Log in
                    </Link>
                </div>
            </div>

            {/* Auth Gate Modal */}
            <AuthGateModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
}

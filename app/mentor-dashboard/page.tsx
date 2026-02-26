'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ProfileCompletionBanner from '@/components/ui/ProfileCompletionBanner';

export default function MentorDashboardPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-40 bg-(--surface) rounded-xl border border-(--border)"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-60 bg-(--surface) rounded-xl border border-(--border)"></div>
                    <div className="h-60 bg-(--surface) rounded-xl border border-(--border)"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Profile Completion Banner */}
            <ProfileCompletionBanner />

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">
                        Welcome back, Mentor 👋
                    </h1>
                    <p className="text-(--secondary)">
                        Here&apos;s your mentoring overview and upcoming sessions.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/mentor-dashboard/profile">
                        <Button variant="primary" size="sm">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Complete Profile
                        </Button>
                    </Link>
                    <Link href="/explore/institute">
                        <Button variant="secondary" size="sm">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Explore Startups
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Mentoring Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-(--secondary)">Active Mentees</p>
                            <p className="text-2xl font-bold text-(--primary)">0</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-(--secondary)">Sessions This Month</p>
                            <p className="text-2xl font-bold text-(--primary)">0</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-(--secondary)">Rating</p>
                            <p className="text-2xl font-bold text-(--primary)">—</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-(--secondary)">Earnings</p>
                            <p className="text-2xl font-bold text-(--primary)">$0</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Sessions */}
                <Card className="lg:col-span-2 p-6 h-fit">
                    <h3 className="text-lg font-semibold text-(--primary) mb-4">Upcoming Sessions</h3>
                    <div className="space-y-0 relative">
                        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-(--border)"></div>
                        <p className="pl-8 text-(--secondary) py-2">No upcoming sessions scheduled. Your mentees will book sessions soon.</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-(--border)">
                        <Link href="/explore/institute">
                            <Button variant="secondary" size="sm">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Browse Startups
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6 h-fit">
                    <h3 className="text-lg font-semibold text-(--primary) mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/mentor-dashboard/profile" className="block">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors text-left">
                                <span className="text-lg">✏️</span>
                                <div>
                                    <p className="text-sm font-medium text-accent">Complete Profile</p>
                                    <p className="text-xs text-(--secondary)">Add achievements, slots & pricing</p>
                                </div>
                            </button>
                        </Link>
                        <Link href="/explore/institute" className="block">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors text-left">
                                <span className="text-lg">🏛️</span>
                                <div>
                                    <p className="text-sm font-medium text-(--primary)">Explore Institutions</p>
                                    <p className="text-xs text-(--secondary)">Find programs to mentor at</p>
                                </div>
                            </button>
                        </Link>
                        <Link href="/feed" className="block">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors text-left">
                                <span className="text-lg">📰</span>
                                <div>
                                    <p className="text-sm font-medium text-(--primary)">Browse Feed</p>
                                    <p className="text-xs text-(--secondary)">Discover ecosystem updates</p>
                                </div>
                            </button>
                        </Link>
                        <Link href="/notifications" className="block">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors text-left">
                                <span className="text-lg">🔔</span>
                                <div>
                                    <p className="text-sm font-medium text-(--primary)">Notifications</p>
                                    <p className="text-xs text-(--secondary)">Check your latest alerts</p>
                                </div>
                            </button>
                        </Link>
                    </div>

                    <div className="mt-6 pt-6 border-t border-(--border)">
                        <h4 className="text-sm font-medium text-(--primary) mb-2">Need Help?</h4>
                        <Link href="/help" className="text-sm text-accent hover:underline">
                            Visit Mentor Support Center &rarr;
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}

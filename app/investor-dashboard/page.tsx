'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function InvestorDashboardPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
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
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">
                        Welcome back, Investor 👋
                    </h1>
                    <p className="text-(--secondary)">
                        Here&apos;s your investment overview and deal pipeline.
                    </p>
                </div>
                <div className="flex gap-3">
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

            {/* Investment Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-(--secondary)">Active Deals</p>
                            <p className="text-2xl font-bold text-(--primary)">0</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-(--secondary)">Portfolio Companies</p>
                            <p className="text-2xl font-bold text-(--primary)">0</p>
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
                            <p className="text-sm text-(--secondary)">Total Invested</p>
                            <p className="text-2xl font-bold text-(--primary)">$0</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-(--secondary)">Pipeline</p>
                            <p className="text-2xl font-bold text-(--primary)">0</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Deal Flow */}
                <Card className="lg:col-span-2 p-6 h-fit">
                    <h3 className="text-lg font-semibold text-(--primary) mb-4">Recent Deal Flow</h3>
                    <div className="space-y-0 relative">
                        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-(--border)"></div>
                        <p className="pl-8 text-(--secondary) py-2">No deal flow activity yet. Start by exploring startups.</p>
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
                        <Link href="/explore/institute" className="block">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors text-left">
                                <span className="text-lg">🏛️</span>
                                <div>
                                    <p className="text-sm font-medium text-(--primary)">Explore Institutions</p>
                                    <p className="text-xs text-(--secondary)">Discover incubators & accelerators</p>
                                </div>
                            </button>
                        </Link>
                        <Link href="/feed" className="block">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors text-left">
                                <span className="text-lg">📰</span>
                                <div>
                                    <p className="text-sm font-medium text-(--primary)">Browse Feed</p>
                                    <p className="text-xs text-(--secondary)">Discover latest updates</p>
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
                </Card>
            </div>
        </div>
    );
}

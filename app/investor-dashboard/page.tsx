'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSessionToken } from '@/lib/auth-utils';

interface PortfolioCompany {
    id: string;
    name: string;
    url: string | null;
}

interface NotableInvestment {
    id: string;
    name: string;
    url: string | null;
    amount: number | null;
}

interface InvestorProfile {
    id: string;
    userName: string;
    userEmail: string;
    type: string;
    firmName: string | null;
    bio: string | null;
    checkSizeMin: number | null;
    checkSizeMax: number | null;
    currency: string;
    sectors: string[];
    investmentStages: string[];
    portfolioCompanies: PortfolioCompany[];
    notableInvestments: NotableInvestment[];
    dealFlowPreferences: string | null;
    linkedinUrl: string | null;
    status: string;
    createdAt: string;
}

export default function InvestorDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<InvestorProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        const token = getSessionToken('investor');
        if (!token) {
            setError('Please log in to view your investor dashboard.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/investors/me/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 404) {
                setProfile(null);
                setLoading(false);
                return;
            }
            if (!res.ok) throw new Error('Failed to load profile');
            const data = await res.json();
            setProfile(data.data || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-40 bg-(--surface) rounded-xl border border-(--border)" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-60 bg-(--surface) rounded-xl border border-(--border)" />
                    <div className="h-60 bg-(--surface) rounded-xl border border-(--border)" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-8 text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <Link href="/login">
                    <Button className="mt-4">Go to Login</Button>
                </Link>
            </Card>
        );
    }

    const displayName = profile?.userName || 'Investor';
    const portfolioCount = profile?.portfolioCompanies?.length ?? 0;
    const investmentCount = profile?.notableInvestments?.length ?? 0;
    const totalInvested = profile?.notableInvestments?.reduce(
        (sum, inv) => sum + (inv.amount ?? 0),
        0
    ) ?? 0;

    const formatCurrency = (amount: number) => {
        if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
        if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
        return `$${amount.toLocaleString()}`;
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">
                        Welcome back, {displayName} 👋
                    </h1>
                    <p className="text-(--secondary)">
                        {profile?.status === 'approved'
                            ? 'Here\'s your investment overview and deal pipeline.'
                            : profile?.status === 'pending'
                                ? 'Your investor profile is pending approval.'
                                : 'Here\'s your investor dashboard.'}
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

            {/* Status Banner */}
            {profile?.status === 'pending' && (
                <div className="rounded-xl px-5 py-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                    Your investor profile is under review. You&apos;ll receive an email once approved.
                </div>
            )}

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
                            <p className="text-sm text-(--secondary)">Sectors</p>
                            <p className="text-2xl font-bold text-(--primary)">{profile?.sectors?.length ?? 0}</p>
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
                            <p className="text-2xl font-bold text-(--primary)">{portfolioCount}</p>
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
                            <p className="text-2xl font-bold text-(--primary)">
                                {totalInvested > 0 ? formatCurrency(totalInvested) : '$0'}
                            </p>
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
                            <p className="text-sm text-(--secondary)">Notable Investments</p>
                            <p className="text-2xl font-bold text-(--primary)">{investmentCount}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Investment Profile */}
                <Card className="lg:col-span-2 p-6 h-fit space-y-5">
                    <h3 className="text-lg font-semibold text-(--primary)">Investment Profile</h3>

                    {profile?.firmName && (
                        <div>
                            <p className="text-xs text-(--secondary) uppercase tracking-wider">Firm</p>
                            <p className="text-sm font-medium text-(--primary)">{profile.firmName}</p>
                        </div>
                    )}

                    {(profile?.checkSizeMin || profile?.checkSizeMax) && (
                        <div>
                            <p className="text-xs text-(--secondary) uppercase tracking-wider">Check Size</p>
                            <p className="text-sm font-medium text-(--primary)">
                                {profile.checkSizeMin ? formatCurrency(Number(profile.checkSizeMin)) : '—'}
                                {' — '}
                                {profile.checkSizeMax ? formatCurrency(Number(profile.checkSizeMax)) : '—'}
                                {' '}{profile?.currency || 'USD'}
                            </p>
                        </div>
                    )}

                    {profile?.investmentStages && profile.investmentStages.length > 0 && (
                        <div>
                            <p className="text-xs text-(--secondary) uppercase tracking-wider mb-1">Stages</p>
                            <div className="flex flex-wrap gap-2">
                                {profile.investmentStages.map((stage) => (
                                    <span key={stage} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                                        {stage}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile?.sectors && profile.sectors.length > 0 && (
                        <div>
                            <p className="text-xs text-(--secondary) uppercase tracking-wider mb-1">Focus Sectors</p>
                            <div className="flex flex-wrap gap-2">
                                {profile.sectors.map((sector) => (
                                    <span key={sector} className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                                        {sector}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile?.dealFlowPreferences && (
                        <div>
                            <p className="text-xs text-(--secondary) uppercase tracking-wider">Deal Flow Preferences</p>
                            <p className="text-sm text-(--primary) mt-0.5">{profile.dealFlowPreferences}</p>
                        </div>
                    )}

                    {portfolioCount > 0 && (
                        <div>
                            <p className="text-xs text-(--secondary) uppercase tracking-wider mb-2">Portfolio Companies</p>
                            <div className="space-y-1">
                                {profile!.portfolioCompanies.map((co) => (
                                    <div key={co.id} className="flex items-center gap-2 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        {co.url ? (
                                            <a href={co.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                                {co.name}
                                            </a>
                                        ) : (
                                            <span className="text-(--primary)">{co.name}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {investmentCount > 0 && (
                        <div>
                            <p className="text-xs text-(--secondary) uppercase tracking-wider mb-2">Notable Investments</p>
                            <div className="space-y-1">
                                {profile!.notableInvestments.map((inv) => (
                                    <div key={inv.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <span className="text-(--primary)">{inv.name}</span>
                                        </div>
                                        {inv.amount && (
                                            <span className="text-(--secondary) text-xs">
                                                {formatCurrency(inv.amount)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!profile && (
                        <div className="text-center py-4">
                            <p className="text-(--secondary)">No investor profile found.</p>
                            <Link href="/investor-onboarding">
                                <Button className="mt-3" size="sm">Complete Onboarding</Button>
                            </Link>
                        </div>
                    )}
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
                        <Link href="/events" className="block">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors text-left">
                                <span className="text-lg">📅</span>
                                <div>
                                    <p className="text-sm font-medium text-(--primary)">Events</p>
                                    <p className="text-xs text-(--secondary)">Browse upcoming events</p>
                                </div>
                            </button>
                        </Link>
                        <Link href="/feed" className="block">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-(--border) hover:bg-(--surface-hover) transition-colors text-left">
                                <span className="text-lg">📰</span>
                                <div>
                                    <p className="text-sm font-medium text-(--primary)">Browse Feed</p>
                                    <p className="text-xs text-(--secondary)">Latest updates and news</p>
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

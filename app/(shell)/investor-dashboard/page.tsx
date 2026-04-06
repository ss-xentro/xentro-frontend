'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { Button } from '@/components/ui/Button';
import { InvestorProfile } from './_lib/constants';
import StatsGrid from './_components/StatsGrid';
import InvestmentProfileCard from './_components/InvestmentProfileCard';
import QuickActionsCard from './_components/QuickActionsCard';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

export default function InvestorDashboardPage() {
    const { data: rawData, isLoading: loading, error: queryError } = useApiQuery<{ data: InvestorProfile | null }>(
        queryKeys.investor.dashboard(),
        '/api/investors/me/',
        {
            requestOptions: { role: 'investor' },
            retry: (count, err) => err.status !== 404 && count < 1,
        },
    );
    const profile = rawData?.data ?? null;
    // 404 = no profile yet (not an error)
    const error = queryError && queryError.status !== 404 ? queryError.message : null;

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
                <FeedbackBanner type="error" message={error} className="mb-4" />
                <Link href="/login">
                    <Button className="mt-4">Go to Login</Button>
                </Link>
            </Card>
        );
    }

    const displayName = profile?.userName || 'Investor';
    const portfolioCount = profile?.portfolioCompanies?.length ?? 0;
    const investmentCount = profile?.notableInvestments?.length ?? 0;
    const totalInvested = profile?.notableInvestments?.reduce((sum, inv) => sum + (inv.amount ?? 0), 0) ?? 0;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">
                        Welcome back, {displayName}
                    </h1>
                    <p className="text-(--secondary)">
                        {profile?.status === 'approved'
                            ? "Here's your investment overview and deal pipeline."
                            : profile?.status === 'pending'
                                ? 'Your investor profile is pending approval.'
                                : "Here's your investor dashboard."}
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
                <div className="rounded-xl px-5 py-3 bg-yellow-50 border border-yellow-500/30 text-yellow-800 text-sm">
                    Your investor profile is under review. You&apos;ll receive an email once approved.
                </div>
            )}

            {/* Investment Stats */}
            <StatsGrid
                sectorCount={profile?.sectors?.length ?? 0}
                portfolioCount={portfolioCount}
                totalInvested={totalInvested}
                investmentCount={investmentCount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <InvestmentProfileCard profile={profile} />
                <QuickActionsCard />
            </div>
        </div>
    );
}

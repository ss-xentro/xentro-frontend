'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getSessionToken } from '@/lib/auth-utils';
import type { DashboardData } from './_components/types';
import { StartupInfoCard } from './_components/StartupInfoCard';
import { DashboardAnalyticsBento } from './_components/DashboardAnalyticsBento';
import { DashboardChecklist } from './_components/DashboardChecklist';

// Roles that have write access (can edit startup, invite members)
const WRITE_ROLES = new Set(['founder', 'co_founder', 'ceo', 'cto', 'coo', 'cfo', 'cpo']);

export default function DashboardOverviewPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getSessionToken('founder');
                if (!token) return; // Layout handles redirect

                const res = await fetch('/api/founder/my-startup', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to load dashboard data');
                }

                const json = await res.json();
                setData(json.data ?? null);
            } catch (err) {
                console.error(err);
                setError('Failed to load startup data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    if (error) {
        return (
            <div className="p-6 bg-error/10 border border-error/20 text-error rounded-xl">
                {error}
            </div>
        );
    }

    if (!data) return null;

    const hasProfile = Boolean(
        data.startup.name?.trim()
        && data.startup.tagline?.trim()
        && data.startup.logo
        && data.startup.stage
    );
    const hasTeamMembers = Boolean((data.startup.teamMembers?.length || 0) > 0);
    const hasEmail = Boolean(data.startup.primaryContactEmail?.trim());
    const hasFundsRaised = Boolean(Number(data.startup.fundsRaised || 0) > 0);
    const checklistComplete = hasProfile && hasTeamMembers && hasEmail && hasFundsRaised;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">
                        Welcome back, {data.startup.name}
                    </h1>
                    <p className="text-(--secondary)">
                        Here&apos;s what&apos;s happening with your startup today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href={`/startups/${data.startup.slug || data.startup.id}`} target="_blank">
                        <Button variant="secondary" size="sm">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Public Profile
                        </Button>
                    </Link>
                    {WRITE_ROLES.has(data.founderRole) && (
                        <Link href="/dashboard/startup">
                            <Button variant="primary" size="sm">
                                Edit Profile
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className={checklistComplete ? 'xl:col-span-12' : 'xl:col-span-8'}>
                    <StartupInfoCard startup={data.startup} founderRole={data.founderRole} />
                </div>
                <DashboardChecklist
                    className="xl:col-span-4"
                    items={{
                        profileComplete: hasProfile,
                        teamMembersAdded: hasTeamMembers,
                        emailVerified: hasEmail,
                        fundingHistoryAdded: hasFundsRaised,
                    }}
                />
            </div>

            <DashboardAnalyticsBento startup={data.startup} logs={data.recentActivity ?? []} />
        </div>
    );
}

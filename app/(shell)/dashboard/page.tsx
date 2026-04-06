'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import type { DashboardData } from './_components/types';
import { StartupInfoCard } from './_components/StartupInfoCard';
import { DashboardAnalyticsBento } from './_components/DashboardAnalyticsBento';
import { StartupProfileCompletionBanner } from './_components/StartupProfileCompletionBanner';

// Roles that have write access (can edit startup, invite members)
const WRITE_ROLES = new Set(['founder', 'co_founder', 'ceo', 'cto', 'coo', 'cfo', 'cpo']);

export default function DashboardOverviewPage() {
    const [windowDays, setWindowDays] = useState<7 | 30 | 90>(30);

    const { data: rawData, isLoading: loading, error: queryError } = useApiQuery<{ data: DashboardData }>(
        queryKeys.dashboard.stats(windowDays),
        '/api/founder/my-startup',
        { requestOptions: { params: { windowDays } } },
    );

    const data = rawData?.data ?? null;
    const error = queryError ? 'Failed to load startup data' : null;

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

    return (
        <div className="space-y-8 animate-fadeIn">
            <StartupProfileCompletionBanner
                startup={data.startup}
                canEdit={WRITE_ROLES.has(data.founderRole)}
            />

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">
                        Welcome back, {data.startup.name}
                    </h1>
                    <p className="text-(--secondary)">
                        Your startup overview.
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
                <div className="xl:col-span-12">
                    <StartupInfoCard startup={data.startup} founderRole={data.founderRole} />
                </div>
            </div>

            <DashboardAnalyticsBento
                startup={data.startup}
                logs={data.recentActivity ?? []}
                analytics={data.analytics}
                windowDays={windowDays}
                onWindowChange={setWindowDays}
            />
        </div>
    );
}

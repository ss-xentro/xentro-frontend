'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppIcon } from '@/components/ui/AppIcon';
import { FollowButton } from '@/components/ui/FollowButton';
import { useAuth } from '@/contexts/AuthContext';
import { startupStageLabels, fundingRoundLabels } from '@/lib/types/labels';
import { formatCurrency } from '@/lib/utils';
import type { StartupStage, FundingRound } from '@/lib/types/startups';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

const stages = [
    { value: 'all', label: 'All Stages' },
    { value: 'ideation', label: 'Ideation' },
    { value: 'pre_seed_prototype', label: 'Pre seed / Prototype' },
    { value: 'seed_mvp', label: 'Seed / MVP' },
    { value: 'early_traction', label: 'Early Traction' },
    { value: 'growth', label: 'Growth' },
    { value: 'scaling', label: 'Scaling' },
];

const fundingRounds = [
    { value: 'all', label: 'All Funding' },
    { value: 'bootstrapped', label: 'Bootstrapped' },
    { value: 'pre_seed', label: 'Pre-Seed' },
    { value: 'seed', label: 'Seed' },
    { value: 'series_a', label: 'Series A' },
    { value: 'series_b_plus', label: 'Series B+' },
];

interface StartupPublic {
    id: string;
    name: string;
    tagline: string;
    logo: string | null;
    stage: string;
    fundingRound: string;
    fundsRaised: string;
    fundingCurrency: string;
    ownerId: string | null;
}

function StartupsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const currentUserId = user?.id ?? '';

    const [stage, setStage] = useState(searchParams.get('stage') || 'all');
    const [funding, setFunding] = useState(searchParams.get('funding') || 'all');
    const hasActiveFilters = stage !== 'all' || funding !== 'all';

    const { data: rawData, isLoading: loading } = useApiQuery<{ startups?: StartupPublic[]; data?: StartupPublic[] }>(
        queryKeys.explore.startups({ stage, funding }),
        '/api/startups',
        {
            requestOptions: {
                params: {
                    ...(stage !== 'all' ? { stage } : {}),
                    ...(funding !== 'all' ? { funding } : {}),
                },
            },
        },
    );
    const startups = rawData?.startups || rawData?.data || [];

    const stageColor: Record<string, string> = {
        ideation: 'bg-purple-500/20 text-purple-300 border-purple-500/20',
        pre_seed_prototype: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
        seed_mvp: 'bg-teal-500/20 text-teal-300 border-teal-500/20',
        early_traction: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
        growth: 'bg-green-500/20 text-green-300 border-green-500/20',
        scaling: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20',
    };

    return (
        <div className="p-6">
            {/* Filters */}
            {(loading || startups.length > 0 || hasActiveFilters) && (
                <div className="flex gap-3 mb-8">
                    <select
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        className="h-10 px-3 bg-(--accent-subtle) border border-(--border) rounded-xl text-sm text-(--primary-light) focus:outline-none focus:border-(--border-hover)"
                    >
                        {stages.map((s) => <option key={s.value} value={s.value} className="bg-(--surface)">{s.label}</option>)}
                    </select>
                    <select
                        value={funding}
                        onChange={(e) => setFunding(e.target.value)}
                        className="h-10 px-3 bg-(--accent-subtle) border border-(--border) rounded-xl text-sm text-(--primary-light) focus:outline-none focus:border-(--border-hover)"
                    >
                        {fundingRounds.map((f) => <option key={f.value} value={f.value} className="bg-(--surface)">{f.label}</option>)}
                    </select>
                </div>
            )}

            {/* Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-2xl bg-(--accent-subtle) border border-(--border) animate-pulse" />
                    ))}
                </div>
            )}

            {/* Grid */}
            {!loading && startups.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {startups.map((startup, index) => (
                        <div
                            key={startup.id}
                            className="group text-left bg-(--accent-subtle) hover:bg-(--accent-light) border border-(--border) hover:border-(--border-hover) rounded-2xl p-5 transition-all duration-300 flex flex-col"
                            style={{ animationDelay: `${index * 40}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-(--accent-light) border border-(--border) overflow-hidden flex items-center justify-center shrink-0">
                                    {startup.logo ? (
                                        <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-base font-bold text-(--secondary)">{startup.name.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                {startup.stage && (
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${stageColor[startup.stage] ?? 'bg-(--accent-light) text-(--primary-light) border-(--border)'}`}>
                                        {startupStageLabels[startup.stage as StartupStage]?.label ?? startup.stage}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 mb-4">
                                <h3 className="text-[15px] font-semibold text-(--primary) group-hover:text-(--primary-light) transition-colors mb-1">
                                    {startup.name}
                                </h3>
                                <p className="text-sm text-(--secondary-light) line-clamp-2">
                                    {startup.tagline || 'Building something innovative.'}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-(--border) flex items-center justify-between text-xs mb-3">
                                {startup.fundingRound && (
                                    <span className="px-2 py-0.5 rounded-full bg-(--accent-subtle) text-(--secondary) border border-(--border)">
                                        {fundingRoundLabels[startup.fundingRound as FundingRound]?.label ?? startup.fundingRound}
                                    </span>
                                )}
                                {Number(startup.fundsRaised) > 0 && (
                                    <span className="font-medium text-green-400">
                                        {formatCurrency(Number(startup.fundsRaised), startup.fundingCurrency || 'USD')}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                {startup.ownerId && (
                                    <FollowButton
                                        targetUserId={startup.ownerId}
                                        currentUserId={currentUserId}
                                        showMessage
                                        className="w-full justify-center"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => router.push(`/startups/${startup.id}`)}
                                    className="text-center text-sm font-medium py-2.5 rounded-xl border border-(--border) text-(--primary-light) hover:text-(--primary) hover:border-(--border-hover) transition-colors"
                                >
                                    View Startup
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && startups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-full bg-(--accent-subtle) flex items-center justify-center mb-4"><AppIcon name="rocket" className="w-8 h-8 text-(--secondary-light)" /></div>
                    <h3 className="text-lg font-semibold text-(--primary) mb-1">No startups found</h3>
                    <p className="text-sm text-(--secondary-light)">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}

export default function ExploreStartupsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-(--border) border-t-accent rounded-full animate-spin" />
            </div>
        }>
            <StartupsContent />
        </Suspense>
    );
}

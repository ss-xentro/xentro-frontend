'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const stages = [
    { value: 'all', label: 'All Stages' },
    { value: 'idea', label: 'Idea' },
    { value: 'mvp', label: 'MVP' },
    { value: 'early_traction', label: 'Early Traction' },
    { value: 'growth', label: 'Growth' },
    { value: 'scale', label: 'Scale' },
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
}

function StartupsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [startups, setStartups] = useState<StartupPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [stage, setStage] = useState(searchParams.get('stage') || 'all');
    const [funding, setFunding] = useState(searchParams.get('funding') || 'all');

    const fetchStartups = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (stage && stage !== 'all') params.append('stage', stage);
            if (funding && funding !== 'all') params.append('funding', funding);
            const res = await fetch(`/api/public/startups?${params.toString()}`);
            const json = await res.json();
            if (res.ok) setStartups(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [stage, funding]);

    useEffect(() => {
        const t = setTimeout(fetchStartups, 300);
        return () => clearTimeout(t);
    }, [fetchStartups]);

    const stageColor: Record<string, string> = {
        idea: 'bg-purple-500/20 text-purple-300 border-purple-500/20',
        mvp: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
        early_traction: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
        growth: 'bg-green-500/20 text-green-300 border-green-500/20',
        scale: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20',
    };

    return (
        <div className="p-6">
            {/* Filters */}
            <div className="flex gap-3 mb-8">
                <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-white/30"
                >
                    {stages.map((s) => <option key={s.value} value={s.value} className="bg-[#0B0D10]">{s.label}</option>)}
                </select>
                <select
                    value={funding}
                    onChange={(e) => setFunding(e.target.value)}
                    className="h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-white/30"
                >
                    {fundingRounds.map((f) => <option key={f.value} value={f.value} className="bg-[#0B0D10]">{f.label}</option>)}
                </select>
            </div>

            {/* Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Grid */}
            {!loading && startups.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {startups.map((startup, index) => (
                        <button
                            key={startup.id}
                            onClick={() => router.push(`/startups/${startup.id}`)}
                            className="group text-left bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-300 flex flex-col"
                            style={{ animationDelay: `${index * 40}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                    {startup.logo ? (
                                        <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-base font-bold text-gray-400">{startup.name.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                {startup.stage && (
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${stageColor[startup.stage] ?? 'bg-white/10 text-gray-300 border-white/10'}`}>
                                        {startup.stage.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 mb-4">
                                <h3 className="text-[15px] font-semibold text-white group-hover:text-gray-100 transition-colors mb-1">
                                    {startup.name}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {startup.tagline || 'Building something innovative.'}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                                {startup.fundingRound && (
                                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                                        {startup.fundingRound.replace(/_/g, ' ')}
                                    </span>
                                )}
                                {Number(startup.fundsRaised) > 0 && (
                                    <span className="font-medium text-green-400">
                                        ${Number(startup.fundsRaised).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && startups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-4">🚀</div>
                    <h3 className="text-lg font-semibold text-white mb-1">No startups found</h3>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}

export default function ExploreStartupsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <StartupsContent />
        </Suspense>
    );
}

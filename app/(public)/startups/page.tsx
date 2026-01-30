'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Reusing options (should be shared)
const stages = [
    { value: 'all', label: 'All Stages' },
    { value: 'idea', label: 'Idea Stage' },
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
    { value: 'unicorn', label: 'Unicorn' },
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

export default function PublicStartupsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        }>
            <StartupsContent />
        </Suspense>
    );
}

function StartupsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [startups, setStartups] = useState<StartupPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    // Filter states
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [stage, setStage] = useState(searchParams.get('stage') || 'all');
    const [funding, setFunding] = useState(searchParams.get('funding') || 'all');

    // Debounced search effect or just fetch on change?
    // For simplicity, we fetch when filters change.
    // We can use a simple effect.

    const fetchStartups = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (stage && stage !== 'all') params.append('stage', stage);
            if (funding && funding !== 'all') params.append('funding', funding);

            // Update URL without refresh
            router.replace(`/startups?${params.toString()}`, { scroll: false });

            const res = await fetch(`/api/public/startups?${params.toString()}`);
            const json = await res.json();
            if (res.ok) setStartups(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search, stage, funding, router]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStartups();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchStartups]);

    // Handle stage/funding change immediately (fetchStartups dependency covers it)

    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <div className="bg-linear-to-b from-surface-hover to-background pt-20 pb-12 border-b border-(--border)">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-accent to-accent-hover mb-4">
                        Discover Innovative Startups
                    </h1>
                    <p className="text-lg md:text-xl text-(--secondary) max-w-2xl mx-auto">
                        Explore the next generation of companies built on XENTRO.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 items-center bg-(--surface) p-4 rounded-xl border border-(--border) shadow-sm">
                    <div className="flex-1 w-full">
                        <Input
                            placeholder="Search startups, taglines..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background"
                        />
                    </div>

                    <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <div className="w-48 shrink-0">
                            <Select
                                value={stage}
                                onChange={setStage}
                                options={stages}
                                placeholder="Filter by Stage"
                            />
                        </div>
                        <div className="w-48 shrink-0">
                            <Select
                                value={funding}
                                onChange={setFunding}
                                options={fundingRounds}
                                placeholder="Filter by Funding"
                            />
                        </div>
                        <div className="flex gap-1 bg-background p-1 rounded-lg border border-(--border)">
                            <button
                                onClick={() => setView('grid')}
                                className={`p-2 rounded ${view === 'grid' ? 'bg-(--surface-hover) text-(--primary)' : 'text-(--secondary)'}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`p-2 rounded ${view === 'list' ? 'bg-(--surface-hover) text-(--primary)' : 'text-(--secondary)'}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-(--surface) rounded-xl border border-(--border)"></div>
                        ))}
                    </div>
                ) : startups.length === 0 ? (
                    <div className="text-center py-20 bg-(--surface) rounded-xl border border-(--border) border-dashed">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-medium text-(--primary)">No startups found</h3>
                        <p className="text-(--secondary)">Try adjusting your search terms or filters.</p>
                        <Button
                            variant="ghost"
                            className="mt-4"
                            onClick={() => { setSearch(''); setStage('all'); setFunding('all'); }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {startups.map((startup) => (
                            <Card 
                                key={startup.id} 
                                className="p-6 hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer hover:border-accent/50"
                                onClick={() => router.push(`/startups/${startup.id}`)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 rounded-lg bg-(--surface-hover) border border-(--border) flex items-center justify-center overflow-hidden">
                                        {startup.logo ? (
                                            <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-(--secondary)">
                                                {startup.name.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    {startup.stage && <Badge variant="info">{startup.stage.replace('_', ' ')}</Badge>}
                                </div>

                                <div className="mb-4 flex-1">
                                    <h3 className="text-xl font-bold text-(--primary) group-hover:text-accent transition-colors">
                                        {startup.name}
                                    </h3>
                                    <p className="text-(--secondary) mt-1 line-clamp-2 text-sm leading-relaxed">
                                        {startup.tagline || "Building something amazing."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-(--border) mt-auto">
                                    <div className="flex items-center gap-2">
                                        {startup.fundingRound && (
                                            <Badge variant="outline" size="sm" className="bg-(--surface)">
                                                {startup.fundingRound.replace(/_/g, ' ')}
                                            </Badge>
                                        )}
                                    </div>
                                    {Number(startup.fundsRaised) > 0 && (
                                        <span className="text-sm font-medium text-success">
                                            ${Number(startup.fundsRaised).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 animate-fadeIn">
                        {startups.map((startup) => (
                            <Card 
                                key={startup.id} 
                                className="p-4 hover:shadow-md transition-all flex items-center gap-6 cursor-pointer hover:border-accent/50"
                                onClick={() => router.push(`/startups/${startup.id}`)}
                            >
                                <div className="w-16 h-16 rounded-lg bg-(--surface-hover) border border-(--border) shrink-0 flex items-center justify-center overflow-hidden">
                                    {startup.logo ? (
                                        <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-(--secondary)">
                                            {startup.name.substring(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-(--primary)">{startup.name}</h3>
                                    <p className="text-(--secondary) truncate text-sm">{startup.tagline || 'Building something amazing'}</p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    {startup.stage && <Badge variant="info">{startup.stage.replace('_', ' ')}</Badge>}
                                    {startup.fundingRound && <Badge variant="outline">{startup.fundingRound.replace(/_/g, ' ')}</Badge>}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

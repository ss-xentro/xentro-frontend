'use client';


import { useEffect, useState } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { Startup, startupStageLabels, startupStatusLabels, fundingRoundLabels } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default function StartupsAdminPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadStartups() {
            try {
                setLoading(true);
                // Fetch all startups (admin endpoint or public endpoint with all data)
                const response = await fetch('/api/public/startups?limit=1000', { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('Failed to load startups');
                }

                const { data } = await response.json();
                setStartups(data ?? []);
                setError(null);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    setError((err as Error).message);
                }
            } finally {
                setLoading(false);
            }
        }

        loadStartups();
        return () => controller.abort();
    }, []);

    const filteredStartups = startups.filter((startup) => {
        const matchesSearch = startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (startup.tagline ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (startup.city ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStage = stageFilter === 'all' || startup.stage === stageFilter;
        const matchesStatus = statusFilter === 'all' || startup.status === statusFilter;
        return matchesSearch && matchesStage && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-(--primary)">Startups</h2>
                    <p className="text-(--secondary) mt-1">View and manage all startups on the platform</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-(--secondary)">
                        <span className="font-semibold text-(--primary)">{filteredStartups.length}</span> of{' '}
                        <span className="font-semibold text-(--primary)">{startups.length}</span> startups
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card padding="md">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-50">
                        <Input
                            placeholder="Search startups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                        />
                    </div>
                    <select
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                        className="h-12 px-4 bg-(--surface) border border-(--border) rounded-lg text-(--primary) focus:outline-none focus:border-accent"
                    >
                        <option value="all">All Stages</option>
                        <option value="idea">Idea</option>
                        <option value="mvp">MVP</option>
                        <option value="early_traction">Early Traction</option>
                        <option value="growth">Growth</option>
                        <option value="scale">Scale</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-12 px-4 bg-(--surface) border border-(--border) rounded-lg text-(--primary) focus:outline-none focus:border-accent"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="stealth">Stealth Mode</option>
                        <option value="paused">Paused</option>
                        <option value="acquired">Acquired</option>
                        <option value="shut_down">Shut Down</option>
                    </select>
                    <div className="flex items-center gap-1 p-1 bg-(--surface-hover) rounded-md">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white shadow-sm' : 'text-(--secondary)'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-(--secondary)'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Card padding="lg" className="text-center">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-(--primary) font-medium">{error}</p>
                </Card>
            )}

            {/* Empty State */}
            {!loading && !error && filteredStartups.length === 0 && (
                <Card padding="lg" className="text-center">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-semibold text-(--primary) mb-2">No startups found</h3>
                    <p className="text-(--secondary)">
                        {searchQuery || stageFilter !== 'all' || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'No startups have been created yet'}
                    </p>
                </Card>
            )}

            {/* Cards View */}
            {!loading && !error && viewMode === 'cards' && filteredStartups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStartups.map((startup) => {
                        const stageInfo = startup.stage ? startupStageLabels[startup.stage] : null;
                        const statusInfo = startup.status && startupStatusLabels[startup.status] 
                            ? startupStatusLabels[startup.status] 
                            : { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
                        const fundingInfo = startup.fundingRound ? fundingRoundLabels[startup.fundingRound] : null;

                        return (
                            <Link key={startup.id} href={`/startups/${startup.id}`} target="_blank">
                                <Card className="h-full hover:shadow-lg transition-all group cursor-pointer">
                                    <div className="p-6">
                                        {/* Logo & Status */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-14 h-14 rounded-lg bg-(--surface-hover) border border-(--border) flex items-center justify-center overflow-hidden shrink-0">
                                                {startup.logo ? (
                                                    <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl font-bold text-(--secondary)">
                                                        {startup.name.substring(0, 2).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        {/* Name & Tagline */}
                                        <h3 className="text-lg font-bold text-(--primary) mb-1 group-hover:text-accent transition-colors">
                                            {startup.name}
                                        </h3>
                                        <p className="text-sm text-(--secondary) mb-4 line-clamp-2">
                                            {startup.tagline || 'Building something amazing.'}
                                        </p>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {stageInfo && (
                                                <Badge variant="outline" size="sm" className={stageInfo.color}>
                                                    {stageInfo.label}
                                                </Badge>
                                            )}
                                            {fundingInfo && (
                                                <Badge variant="info" size="sm">
                                                    {fundingInfo.label}
                                                </Badge>
                                            )}
                                            {startup.city && (
                                                <Badge variant="outline" size="sm">
                                                    📍 {startup.city}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Metrics */}
                                        <div className="pt-4 border-t border-(--border) grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-(--secondary) mb-1">Raised</p>
                                                <p className="text-sm font-semibold text-(--primary)">
                                                    {startup.fundsRaised 
                                                        ? formatCurrency(Number(startup.fundsRaised), startup.fundingCurrency || 'USD')
                                                        : 'N/A'
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-(--secondary) mb-1">Team Size</p>
                                                <p className="text-sm font-semibold text-(--primary)">
                                                    {startup.teamSize ? formatNumber(startup.teamSize) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Table View */}
            {!loading && !error && viewMode === 'table' && filteredStartups.length > 0 && (
                <Card padding="none">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-(--surface-hover) border-b border-(--border)">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--secondary) uppercase tracking-wider">
                                        Startup
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--secondary) uppercase tracking-wider">
                                        Stage
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--secondary) uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--secondary) uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--secondary) uppercase tracking-wider">
                                        Funding
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--secondary) uppercase tracking-wider">
                                        Team
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-(--secondary) uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border)">
                                {filteredStartups.map((startup) => {
                                    const stageInfo = startup.stage ? startupStageLabels[startup.stage] : null;
                                    const statusInfo = startup.status && startupStatusLabels[startup.status] 
                                        ? startupStatusLabels[startup.status] 
                                        : { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };

                                    return (
                                        <tr key={startup.id} className="hover:bg-(--surface-hover) transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-(--surface-hover) border border-(--border) flex items-center justify-center overflow-hidden shrink-0">
                                                        {startup.logo ? (
                                                            <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-(--secondary)">
                                                                {startup.name.substring(0, 2).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-(--primary)">{startup.name}</p>
                                                        <p className="text-sm text-(--secondary) truncate max-w-xs">
                                                            {startup.tagline || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {stageInfo ? (
                                                    <Badge variant="outline" size="sm" className={stageInfo.color}>
                                                        {stageInfo.label}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-sm text-(--secondary)">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-(--primary)">
                                                    {startup.city ? `${startup.city}${startup.country ? `, ${startup.country}` : ''}` : '—'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-(--primary)">
                                                    {startup.fundsRaised 
                                                        ? formatCurrency(Number(startup.fundsRaised), startup.fundingCurrency || 'USD')
                                                        : '—'
                                                    }
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-(--primary)">
                                                    {startup.teamSize ? `${startup.teamSize} members` : '—'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/startups/${startup.id}`} target="_blank">
                                                    <Button variant="ghost" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}

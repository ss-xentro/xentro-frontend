'use client';

import { useState } from 'react';
import { Card, Button, Input, Badge, Spinner, EmptyState, ViewModeToggle } from '@/components/ui';
import { toast } from 'sonner';
import { Startup, startupStageLabels, startupStatusLabels, fundingRoundLabels } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

export default function StartupsAdminPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    const { data: startupsRaw, isLoading: loading } = useApiQuery<{ startups?: Startup[]; data?: Startup[] }>(
        queryKeys.admin.startups(),
        '/api/startups?limit=1000',
        { requestOptions: { public: true } },
    );
    const startups = startupsRaw?.startups || startupsRaw?.data || [];

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
                    <h1 className="text-2xl font-bold text-(--primary)">Startups</h1>
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
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                    <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </div>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredStartups.length === 0 && (
                <EmptyState
                    icon={<AppIcon name="rocket" className="w-10 h-10 text-(--secondary)" />}
                    title="No startups found"
                    description={
                        searchQuery || stageFilter !== 'all' || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'No startups have been created yet'
                    }
                />
            )}

            {/* Cards View */}
            {!loading && viewMode === 'cards' && filteredStartups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStartups.map((startup) => {
                        const stageInfo = startup.stage ? startupStageLabels[startup.stage] : null;
                        const statusInfo = startup.status && startupStatusLabels[startup.status]
                            ? startupStatusLabels[startup.status]
                            : { label: 'Unknown', color: 'bg-(--accent-light) text-(--primary)' };
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
                                                    <AppIcon name="map-pin" className="w-3 h-3 inline mr-0.5" /> {startup.city}
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
            {!loading && viewMode === 'table' && filteredStartups.length > 0 && (
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
                                        : { label: 'Unknown', color: 'bg-(--accent-light) text-(--primary)' };

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

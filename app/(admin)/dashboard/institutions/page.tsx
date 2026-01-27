'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input, Badge, VerifiedBadge, StatusBadge } from '@/components/ui';
import { institutionTypeLabels, Institution } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InstitutionsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadInstitutions() {
            try {
                setLoading(true);
                const response = await fetch('/api/institutions?scope=all', { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('Failed to load institutions');
                }

                const { data } = await response.json();
                setInstitutions(data ?? []);
                setError(null);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    setError((err as Error).message);
                }
            } finally {
                setLoading(false);
            }
        }

        loadInstitutions();
        return () => controller.abort();
    }, []);

    const filteredInstitutions = institutions.filter((institution) => {
        const matchesSearch = institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (institution.city ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || institution.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || institution.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-(--primary)">Institutions</h2>
                    <p className="text-(--secondary) mt-1">Manage and monitor all onboarded institutions</p>
                </div>
                <Link href="/dashboard/add-institution">
                    <Button>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Institution
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card padding="md">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-50">
                        <Input
                            placeholder="Search institutions..."
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
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="h-12 px-4 bg-(--surface) border border-(--border) rounded-lg text-(--primary) focus:outline-none focus:border-accent"
                    >
                        <option value="all">All Types</option>
                        <option value="incubator">Incubator</option>
                        <option value="accelerator">Accelerator</option>
                        <option value="university">University</option>
                        <option value="vc">VC Fund</option>
                        <option value="csr">CSR Program</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-12 px-4 bg-(--surface) border border-(--border) rounded-lg text-(--primary) focus:outline-none focus:border-accent"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
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

            {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {loading && (
                <p className="text-sm text-(--secondary)">Loading institutions…</p>
            )}

            {/* Results count */}
            {!loading && (
                <p className="text-sm text-(--secondary)">
                    Showing {filteredInstitutions.length} of {institutions.length} institutions
                </p>
            )}

            {/* Cards View */}
            {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInstitutions.map((institution, index) => (
                        <InstitutionCard key={institution.id} institution={institution} index={index} />
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
                <Card padding="none" className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-(--surface-hover) border-b border-(--border)">
                                    <th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Institution</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Type</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Location</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-(--secondary)">Startups</th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-(--secondary)">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInstitutions.map((institution) => (
                                    <tr key={institution.id} className="border-b border-(--border) hover:bg-(--surface-hover) transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md bg-(--surface) border border-(--border) flex items-center justify-center overflow-hidden">
                                                    {institution.logo ? (
                                                        <img src={institution.logo} alt={institution.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-lg">{(institutionTypeLabels[institution.type]?.emoji) ?? '🏢'}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-(--primary)">{institution.name}</span>
                                                        {institution.verified && <VerifiedBadge />}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline">{institutionTypeLabels[institution.type]?.label ?? institution.type}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-(--secondary)">
                                            {institution.city ?? 'Unknown'}, {institution.country ?? ''}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={institution.status} />
                                        </td>
                                        <td className="px-6 py-4 text-(--primary) font-medium">
                                            {formatNumber(institution.startupsSupported ?? 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/institutions/${institution.id}`} className="p-2 text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-md transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link href={`/dashboard/institutions/${institution.id}/edit`} className="p-2 text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) rounded-md transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}

function InstitutionCard({ institution, index }: { institution: Institution; index: number }) {
    const router = useRouter();
    const typeInfo = institutionTypeLabels[institution.type] ?? { label: institution.type, emoji: '🏢', description: '' };

    return (
        <Card
            hoverable
            className={`animate-fadeInUp`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-(--surface) border border-(--border) flex items-center justify-center overflow-hidden">
                    {institution.logo ? (
                        <img src={institution.logo} alt={institution.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-2xl">{typeInfo.emoji}</span>
                    )}
                </div>
                <StatusBadge status={institution.status} />
            </div>

            <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-(--primary)">{institution.name}</h3>
                {institution.verified && <VerifiedBadge />}
            </div>

            <p className="text-sm text-(--secondary) mb-4 line-clamp-2">{institution.tagline ?? 'No tagline yet.'}</p>

            <div className="flex items-center gap-4 text-sm text-(--secondary) mb-4">
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {institution.city ?? 'Unknown'}
                </span>
                <Badge variant="outline" size="sm">{typeInfo.label}</Badge>
            </div>

            <div className="flex items-center gap-4 py-4 border-t border-(--border)">
                <div className="text-center flex-1">
                    <p className="text-lg font-semibold text-(--primary)">{formatNumber(institution.startupsSupported ?? 0)}</p>
                    <p className="text-xs text-(--secondary)">Startups</p>
                </div>
                <div className="w-px h-8 bg-(--border)" />
                <div className="text-center flex-1">
                    <p className="text-lg font-semibold text-(--primary)">{formatNumber(institution.studentsMentored ?? 0)}</p>
                    <p className="text-xs text-(--secondary)">Mentored</p>
                </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-(--border)">
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/institutions/${institution.id}`)}
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/institutions/${institution.id}/edit`)}
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                </Button>
            </div>
        </Card>
    );
}

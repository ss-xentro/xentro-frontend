'use client';

import { useEffect, useState } from 'react';
import { Card, Input, Badge, VerifiedBadge, SDGBadge } from '@/components/ui';
import { institutionTypeLabels, sectorLabels, sdgLabels, Institution } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default function InstitutionListingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedSector, setSelectedSector] = useState<string>('all');
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadInstitutions() {
            try {
                setLoading(true);
                const response = await fetch('/api/institutions', { signal: controller.signal });
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
        const matchesType = selectedType === 'all' || institution.type === selectedType;
        const matchesSector = selectedSector === 'all' || (institution.sectorFocus ?? []).includes(selectedSector as any);
        return matchesSearch && matchesType && matchesSector && institution.status === 'published';
    });

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn">
            {/* Hero Section */}
            <div className="text-center mb-12 max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-[var(--primary)] mb-4">
                    Discover Top <span className="text-[var(--accent)]">Innovation Ecosystems</span>
                </h1>
                <p className="text-lg text-[var(--secondary)]">
                    Find and connect with world-class incubators, accelerators, and funds to scale your impact.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="sticky top-20 z-40 bg-[var(--background)]/80 backdrop-blur-md pb-6">
                <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by name, city, or keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 shadow-sm"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                        />
                    </div>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="h-12 px-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] text-[var(--primary)] focus:outline-none focus:border-[var(--accent)] shadow-sm"
                    >
                        <option value="all">All Institution Types</option>
                        {Object.entries(institutionTypeLabels).map(([key, { label, emoji }]) => (
                            <option key={key} value={key}>{emoji} {label}</option>
                        ))}
                    </select>
                    <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="h-12 px-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] text-[var(--primary)] focus:outline-none focus:border-[var(--accent)] shadow-sm"
                    >
                        <option value="all">All Sectors</option>
                        {Object.entries(sectorLabels).map(([key, { label, emoji }]) => (
                            <option key={key} value={key}>{emoji} {label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="text-center text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-[var(--radius-lg)] mb-6">
                    {error}
                </div>
            )}

            {loading && (
                <div className="text-center py-12 text-[var(--secondary)]">Loading institutions…</div>
            )}

            {/* Results Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInstitutions.map((institution, index) => {
                        const typeLabel = institutionTypeLabels[institution.type]?.label ?? institution.type;
                        return (
                            <Link key={institution.id} href={`/institutions/${institution.id}`}>
                                <Card
                                    hoverable
                                    className="h-full flex flex-col animate-fadeInUp group"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--surface-hover)] border border-[var(--border-light)] p-2 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                                            {institution.logo ? (
                                                <img src={institution.logo} alt={institution.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-sm text-[var(--secondary)]">No logo</span>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="bg-[var(--surface)]">
                                            {typeLabel}
                                        </Badge>
                                    </div>

                                    <div className="mb-4 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors">
                                                {institution.name}
                                            </h3>
                                            {institution.verified && <VerifiedBadge />}
                                        </div>
                                        <p className="text-sm text-[var(--secondary)] line-clamp-2">
                                            {institution.tagline ?? 'No tagline yet.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(institution.sdgFocus ?? []).slice(0, 2).map((sdg) => (
                                            <SDGBadge key={sdg} sdg={sdgLabels[sdg].label} color={sdgLabels[sdg].color} />
                                        ))}
                                        {(institution.sectorFocus ?? []).slice(0, 2).map((sector) => (
                                            <Badge key={sector} variant="secondary" size="sm" className="bg-[var(--surface-hover)]">
                                                {sectorLabels[sector].emoji} {sectorLabels[sector].label}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1 text-[var(--secondary)]">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {institution.city ?? 'Unknown location'}
                                        </span>
                                        <span className="font-medium text-[var(--primary)]">
                                            {formatNumber(institution.startupsSupported ?? 0)} startups
                                        </span>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}

            {!loading && filteredInstitutions.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-[var(--surface-hover)] flex items-center justify-center mx-auto mb-4 text-3xl">
                        🔍
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--primary)]">No institutions found</h3>
                    <p className="text-[var(--secondary)] mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}

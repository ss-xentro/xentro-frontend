'use client';

import { useState } from 'react';
import Link from 'next/link';
import { institutionTypeLabels, sectorLabels, sdgLabels, Institution, SectorFocus } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

export default function ExploreInstitutionsPage() {
    const [selectedType, setSelectedType] = useState<string>('all');
    const { data: rawData, isLoading: loading } = useApiQuery<{ data: Institution[] }>(
        queryKeys.explore.institutes(),
        '/api/institutions',
    );
    const institutions = rawData?.data ?? [];

    const filtered = institutions.filter((inst) => {
        return selectedType === 'all' || inst.type === selectedType;
    });
    const hasActiveFilter = selectedType !== 'all';

    return (
        <div className="p-6">
            {/* Filter bar */}
            {(loading || institutions.length > 0 || hasActiveFilter) && (
                <div className="flex gap-3 mb-8">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="h-10 px-3 bg-(--accent-subtle) border border-(--border) rounded-xl text-sm text-(--primary-light) focus:outline-none focus:border-(--border-hover) transition-colors"
                    >
                        <option value="all" className="bg-(--surface)">All Types</option>
                        {Object.entries(institutionTypeLabels).map(([key, { label }]) => (
                            <option key={key} value={key} className="bg-(--surface)">{label}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-52 rounded-2xl bg-(--accent-subtle) border border-(--border) animate-pulse" />
                    ))}
                </div>
            )}

            {/* Grid */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((inst, index) => {
                        const typeInfo = institutionTypeLabels[inst.type];
                        return (
                            <Link
                                key={inst.id}
                                href={`/institutions/${inst.id}`}
                                className="group relative bg-(--accent-subtle) hover:bg-(--accent-light) border border-(--border) hover:border-(--border-hover) rounded-2xl p-5 transition-all duration-300 flex flex-col"
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-(--accent-light) border border-(--border) overflow-hidden flex items-center justify-center shrink-0">
                                        {inst.logo ? (
                                            <img src={inst.logo} alt={inst.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-lg font-bold text-(--secondary)">{inst.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    {typeInfo && (
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-(--accent-light) text-(--primary-light) border border-(--border)">
                                            {typeInfo.label}
                                        </span>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="flex-1 mb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-[15px] font-semibold text-(--primary) group-hover:text-(--primary-light) transition-colors line-clamp-1">
                                            {inst.name}
                                        </h3>
                                        {inst.verified && (
                                            <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-sm text-(--secondary-light) line-clamp-2">
                                        {inst.tagline ?? 'No tagline yet.'}
                                    </p>
                                </div>

                                {/* Tags */}
                                {(inst.sectorFocus ?? []).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {(inst.sectorFocus as SectorFocus[]).slice(0, 3).map((s) => (
                                            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-(--accent-subtle) text-(--secondary) border border-(--border)">
                                                {sectorLabels[s]?.label}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="pt-3 border-t border-(--border) flex items-center justify-between text-xs text-(--secondary-light)">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {inst.city ?? 'Unknown'}
                                    </span>
                                    <span className="font-medium text-(--secondary)">
                                        {formatNumber(inst.startupsSupported ?? 0)} startups
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-full bg-(--accent-subtle) flex items-center justify-center mb-4"><AppIcon name="search" className="w-8 h-8 text-(--secondary-light)" /></div>
                    <h3 className="text-lg font-semibold text-(--primary) mb-1">No institutions found</h3>
                    <p className="text-sm text-(--secondary-light)">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}

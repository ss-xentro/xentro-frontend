'use client';

import { sectorCategoryLabels, SectorCategory, SectorFocus } from '@/lib/types';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SectorFocusSlideProps {
    value: SectorFocus[];
    onChange: (value: SectorFocus[]) => void;
    className?: string;
}

export default function SectorFocusSlide({ value, onChange, className }: SectorFocusSlideProps) {
    const [expandedCategory, setExpandedCategory] = useState<SectorCategory | null>(null);
    const categories = Object.entries(sectorCategoryLabels) as [SectorCategory, typeof sectorCategoryLabels[SectorCategory]][];

    const toggleSubSector = (slug: SectorFocus) => {
        if (value.includes(slug)) {
            onChange(value.filter((item) => item !== slug));
        } else {
            onChange([...value, slug]);
        }
    };

    const toggleCategory = (catSlug: SectorCategory) => {
        setExpandedCategory(expandedCategory === catSlug ? null : catSlug);
    };

    // Count selected sub-sectors for a category
    const getSelectedCount = (catSlug: SectorCategory) => {
        const cat = sectorCategoryLabels[catSlug];
        return cat.subSectors.filter(s => value.includes(s.slug)).length;
    };

    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-(--primary) mb-2">
                    Sector Focus
                </h2>
                <p className="text-(--secondary)">
                    Select your specialized industries.
                </p>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {categories.map(([catSlug, { label, icon, subSectors }]) => {
                    const isExpanded = expandedCategory === catSlug;
                    const selectedCount = getSelectedCount(catSlug);

                    return (
                        <div key={catSlug} className="rounded-lg border border-(--border) overflow-hidden">
                            {/* Category Header */}
                            <button
                                type="button"
                                onClick={() => toggleCategory(catSlug)}
                                className={cn(
                                    'w-full flex items-center gap-3 p-3 text-left transition-colors',
                                    isExpanded ? 'bg-(--accent-subtle)' : 'bg-(--surface) hover:bg-(--surface-hover)',
                                )}
                            >
                                <AppIcon name={icon} className={cn('w-5 h-5 shrink-0', isExpanded ? 'text-accent' : 'text-(--secondary)')} />
                                <span className="font-medium text-sm flex-1 text-(--primary)">{label}</span>
                                {selectedCount > 0 && (
                                    <span className="text-xs font-semibold bg-accent text-(--background) rounded-full px-2 py-0.5">
                                        {selectedCount}
                                    </span>
                                )}
                                <svg
                                    className={cn('w-4 h-4 text-(--secondary) transition-transform', isExpanded && 'rotate-180')}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Sub-sectors */}
                            {isExpanded && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-3 bg-(--surface-secondary) border-t border-(--border)">
                                    {subSectors.map(({ slug, label: subLabel }) => {
                                        const isSelected = value.includes(slug);
                                        return (
                                            <button
                                                key={slug}
                                                type="button"
                                                onClick={() => toggleSubSector(slug)}
                                                className={cn(
                                                    'flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-all',
                                                    isSelected
                                                        ? 'border-accent bg-(--accent-subtle) text-accent font-medium'
                                                        : 'border-(--border) bg-(--surface) text-(--primary) hover:border-(--secondary-light)',
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                                                    isSelected ? 'border-accent bg-accent' : 'border-(--secondary-light)',
                                                )}>
                                                    {isSelected && (
                                                        <svg className="w-2.5 h-2.5 text-(--primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="flex-1 text-left">{subLabel}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

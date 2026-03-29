'use client';

import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { SectorCategory, sectorCategoryLabels } from '@/lib/types';

interface SectorPickerProps {
	selectedSectors: string[];
	onSelect: (sectors: string[]) => void;
	expandedCategory: SectorCategory | null;
	onToggleCategory: (category: SectorCategory | null) => void;
}

export function SectorPicker({ selectedSectors, onSelect, expandedCategory, onToggleCategory }: SectorPickerProps) {
	const categories = Object.entries(sectorCategoryLabels) as [SectorCategory, typeof sectorCategoryLabels[SectorCategory]][];

	return (
		<div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1 mt-4">
			{categories.map(([catSlug, { label, icon, subSectors }]) => {
				const isExpanded = expandedCategory === catSlug;
				const selectedCount = subSectors.filter(s => selectedSectors.includes(s.slug)).length;

				return (
					<div key={catSlug} className="rounded-lg border border-(--border) overflow-hidden flex-shrink-0 bg-(--surface)">
						<button
							type="button"
							onClick={() => onToggleCategory(expandedCategory === catSlug ? null : catSlug)}
							className={cn(
								'w-full flex items-center gap-3 p-3 text-left transition-colors',
								isExpanded ? 'bg-slate-100' : 'bg-(--surface) hover:bg-(--surface-hover)',
							)}
						>
							<AppIcon name={icon} className={cn('w-5 h-5 shrink-0', isExpanded ? 'text-(--primary)' : 'text-(--secondary)')} />
							<span className="font-medium text-sm flex-1 text-(--primary)">{label}</span>
							{selectedCount > 0 && (
								<span className="w-2 h-2 rounded-full bg-slate-700"></span>
							)}
							<svg
								className={cn('w-4 h-4 text-(--secondary) transition-transform', isExpanded && 'rotate-180')}
								fill="none" viewBox="0 0 24 24" stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{isExpanded && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-3 bg-(--surface-secondary) border-t border-(--border)">
								{subSectors.map(({ slug, label: subLabel }) => {
									const isSelected = selectedSectors.includes(slug);
									return (
										<button
											key={slug}
											type="button"
											onClick={() => onSelect([slug])}
											className={cn(
												'flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-all text-left',
												isSelected
													? 'border-slate-900 bg-slate-100 text-white font-medium'
													: 'border-(--border) bg-(--surface) text-(--primary) hover:border-(--secondary-light)',
											)}
										>
											<div className={cn(
												'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
												isSelected ? 'border-slate-900 bg-slate-900' : 'border-(--secondary-light)',
											)}>
												{isSelected && (
													<div className="w-1.5 h-1.5 rounded-full bg-(--surface)"></div>
												)}
											</div>
											<span className="flex-1 text-left line-clamp-2">{subLabel}</span>
										</button>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

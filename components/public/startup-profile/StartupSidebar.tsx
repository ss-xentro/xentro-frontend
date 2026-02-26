'use client';

import { Badge } from '@/components/ui';
import { sdgLabels, sectorLabels, SDGFocus, SectorFocus } from '@/lib/types';
import type { StartupWithDetails } from './types';

interface StartupSidebarProps {
	startup: StartupWithDetails;
}

export function StartupSidebar({ startup }: StartupSidebarProps) {
	const hasSectors = startup.sectors && startup.sectors.length > 0;
	const hasSDG = startup.sdgFocus && startup.sdgFocus.length > 0;
	const hasInvestors = startup.investors && startup.investors.length > 0;
	const hasHighlights = startup.highlights && startup.highlights.length > 0;

	// Show nothing if there's no metadata to display
	if (!hasSectors && !hasSDG && !hasInvestors && !hasHighlights) return null;

	return (
		<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{/* Investors */}
			{hasInvestors && (
				<div>
					<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-3">Backed By</h3>
					<div className="flex flex-wrap gap-2">
						{startup.investors!.map((investor, index) => (
							<Badge key={index} variant="outline" className="text-xs">{investor}</Badge>
						))}
					</div>
				</div>
			)}

			{/* Sectors */}
			{hasSectors && (
				<div>
					<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-3">Sectors</h3>
					<div className="flex flex-wrap gap-2">
						{startup.sectors!.map((sector) => {
							const info = sectorLabels[sector as SectorFocus];
							return (
								<Badge key={sector} variant="outline" className="text-xs">
									{info ? `${info.emoji} ${info.label}` : sector}
								</Badge>
							);
						})}
					</div>
				</div>
			)}

			{/* SDG */}
			{hasSDG && (
				<div>
					<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-3">UN SDG Alignment</h3>
					<div className="flex flex-wrap gap-1.5">
						{startup.sdgFocus!.map((sdg) => {
							const info = sdgLabels[sdg as SDGFocus];
							return info ? (
								<span key={sdg} className="w-7 h-7 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: info.color }} title={info.fullName}>
									{info.label}
								</span>
							) : null;
						})}
					</div>
				</div>
			)}

			{/* Highlights */}
			{hasHighlights && (
				<div className="sm:col-span-2 lg:col-span-3">
					<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-3">Highlights</h3>
					<div className="flex flex-wrap gap-2">
						{startup.highlights!.map((h, i) => (
							<span key={i} className="text-xs px-2.5 py-1 rounded-full bg-(--surface-hover) text-(--primary)">{h}</span>
						))}
					</div>
				</div>
			)}
		</section>
	);
}

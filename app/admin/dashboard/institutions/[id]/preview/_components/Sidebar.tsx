'use client';

import { sdgLabels, sectorLabels, SDGFocus, SectorFocus } from '@/lib/types';
import { Card, Badge, SDGBadge } from '@/components/ui';

interface SidebarProps {
	institution: Record<string, any>;
}

export function Sidebar({ institution }: SidebarProps) {
	return (
		<div className="space-y-6">
			<Card>
				<h3 className="font-semibold text-(--primary) mb-4">Focus Areas</h3>

				<div className="mb-6">
					<p className="text-sm text-(--secondary) mb-2 uppercase tracking-wider font-semibold">SDGs</p>
					<div className="flex flex-wrap gap-2">
						{(institution.sdgFocus ?? []).map((sdg: SDGFocus) => {
							const sdgInfo = sdgLabels[sdg as keyof typeof sdgLabels];
							return sdgInfo ? <SDGBadge key={sdg} sdg={sdgInfo.label} color={sdgInfo.color} /> : null;
						})}
						{(!institution.sdgFocus || institution.sdgFocus.length === 0) && (
							<span className="text-sm text-(--secondary) italic">No SDGs specified</span>
						)}
					</div>
				</div>

				<div>
					<p className="text-sm text-(--secondary) mb-2 uppercase tracking-wider font-semibold">Sectors</p>
					<div className="flex flex-wrap gap-2">
						{(institution.sectorFocus ?? []).map((sector: SectorFocus) => {
							const sectorInfo = sectorLabels[sector as keyof typeof sectorLabels];
							return sectorInfo ? (
								<Badge key={sector} variant="secondary" className="bg-(--surface-hover)">
									{sectorInfo.label}
								</Badge>
							) : null;
						})}
						{(!institution.sectorFocus || institution.sectorFocus.length === 0) && (
							<span className="text-sm text-(--secondary) italic">No sectors specified</span>
						)}
					</div>
				</div>
			</Card>

			<Card>
				<h3 className="font-semibold text-(--primary) mb-4">Contact</h3>
				<div className="space-y-4">
					{institution.email ? (
						<div className="flex items-center gap-3 text-(--secondary)">
							<span className="w-8 h-8 rounded-full bg-(--surface-hover) flex items-center justify-center">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							</span>
							<div>
								<p className="text-xs text-(--secondary) uppercase">Email</p>
								<p className="text-sm font-medium">{institution.email}</p>
							</div>
						</div>
					) : (
						<p className="text-sm text-(--secondary) italic">No email provided</p>
					)}
					{institution.phone && (
						<div className="flex items-center gap-3 text-(--secondary)">
							<span className="w-8 h-8 rounded-full bg-(--surface-hover) flex items-center justify-center">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
								</svg>
							</span>
							<div>
								<p className="text-xs text-(--secondary) uppercase">Phone</p>
								<p className="text-sm font-medium">{institution.phone}</p>
							</div>
						</div>
					)}
				</div>
			</Card>
		</div>
	);
}

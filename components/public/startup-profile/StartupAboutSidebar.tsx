'use client';

import { Badge } from '@/components/ui';
import { sdgLabels, SDGFocus } from '@/lib/types';
import type { StartupWithDetails } from './types';

export interface AboutSidebarSection {
	id: string;
	label: string;
}

interface StartupAboutSidebarProps {
	startup: StartupWithDetails;
	sections: AboutSidebarSection[];
}

export function StartupAboutSidebar({ startup, sections }: StartupAboutSidebarProps) {
	const hasSDG = startup.sdgFocus && startup.sdgFocus.length > 0;
	const hasInvestors = startup.investors && startup.investors.length > 0;
	const hasHighlights = startup.highlights && startup.highlights.length > 0;
	const hasPrograms = startup.programs && startup.programs.length > 0;
	const hasMetadata = hasPrograms || hasInvestors || hasSDG || hasHighlights;

	if (sections.length === 0 && !hasMetadata) return null;

	return (
		<aside className="lg:sticky lg:top-24 self-start">
			<div className="rounded-xl border border-(--border) bg-(--surface) p-4 sm:p-5 space-y-5">
				{sections.length > 0 && (
					<nav aria-label="About sections" className="space-y-2">
						<p className="text-sm font-semibold uppercase tracking-wide text-(--secondary)">On This Page</p>
						<ul className="space-y-1.5">
							{sections.map((section) => (
								<li key={section.id}>
									<a
										href={`#${section.id}`}
										className="block rounded-md px-2 py-1.5 text-sm text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover) transition-colors"
									>
										{section.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
				)}

				{hasMetadata && (
					<div className="space-y-4 border-t border-(--border) pt-4">
						{hasPrograms && (
							<div>
								<p className="text-sm font-semibold uppercase tracking-wide text-(--secondary) mb-2">Programs</p>
								<div className="flex flex-wrap gap-2">
									{startup.programs!.map((program) => (
										<Badge key={program.id} variant="outline" className="text-xs">
											{program.name}
										</Badge>
									))}
								</div>
							</div>
						)}

						{hasInvestors && (
							<div>
								<p className="text-sm font-semibold uppercase tracking-wide text-(--secondary) mb-2">Backed By</p>
								<div className="flex flex-wrap gap-2">
									{startup.investors!.map((investor, index) => (
										<Badge key={`${investor}-${index}`} variant="outline" className="text-xs">
											{investor}
										</Badge>
									))}
								</div>
							</div>
						)}

						{hasSDG && (
							<div>
								<p className="text-sm font-semibold uppercase tracking-wide text-(--secondary) mb-2">UN SDG</p>
								<div className="flex flex-wrap gap-1.5">
									{startup.sdgFocus!.map((sdg) => {
										const info = sdgLabels[sdg as SDGFocus];
										return info ? (
											<span
												key={sdg}
												className="w-7 h-7 rounded flex items-center justify-center text-(--primary) text-[10px] font-bold"
												style={{ backgroundColor: info.color }}
												title={info.fullName}
											>
												{info.label}
											</span>
										) : null;
									})}
								</div>
							</div>
						)}

						{hasHighlights && (
							<div>
								<p className="text-sm font-semibold uppercase tracking-wide text-(--secondary) mb-2">Highlights</p>
								<div className="flex flex-wrap gap-2">
									{startup.highlights!.map((highlight, index) => (
										<span key={`${highlight}-${index}`} className="text-xs px-2.5 py-1 rounded-full bg-(--surface-hover) text-(--primary)">
											{highlight}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</aside>
	);
}

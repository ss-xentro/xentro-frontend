'use client';

import { institutionTypeLabels, operatingModeLabels } from '@/lib/types';
import { Badge, VerifiedBadge } from '@/components/ui';
import { AppIcon } from '@/components/ui/AppIcon';

interface HeaderBannerProps {
	institution: Record<string, any>;
}

export function HeaderBanner({ institution }: HeaderBannerProps) {
	const typeInfo = institutionTypeLabels[institution.type] ?? { label: institution.type, icon: 'building', description: '' };
	const modeInfo = institution.operatingMode ? operatingModeLabels[institution.operatingMode as keyof typeof operatingModeLabels] : undefined;

	return (
		<div className="bg-(--surface) border-b border-(--border)">
			<div className="container mx-auto px-4 py-8 md:py-12">
				<div className="flex flex-col md:flex-row gap-8 items-start">
					<div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white border border-(--border) p-4 shadow-sm flex items-center justify-center shrink-0">
						{institution.logo ? (
							<img src={institution.logo} alt={institution.name} className="w-full h-full object-contain" />
						) : (
							<AppIcon name={typeInfo.icon} className="w-10 h-10 text-(--secondary)" />
						)}
					</div>

					<div className="flex-1">
						<div className="flex flex-wrap items-center gap-3 mb-2">
							<h1 className="text-3xl font-bold text-(--primary)">{institution.name}</h1>
							{institution.verified && <VerifiedBadge />}
							<Badge variant="outline" className="ml-2">{typeInfo.label}</Badge>
						</div>

						<p className="text-xl text-(--secondary) mb-6 max-w-2xl">
							{institution.tagline ?? 'No tagline provided yet.'}
						</p>

						<div className="flex flex-wrap gap-4 md:gap-8">
							<div className="flex items-center gap-2 text-(--secondary)">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								<span>{institution.city ?? 'Unknown'}, {institution.country ?? ''}</span>
							</div>

							{modeInfo && (
								<div className="flex items-center gap-2 text-(--secondary)">
									<AppIcon name={modeInfo.icon} className="w-5 h-5" />
									<span>{modeInfo.label}</span>
								</div>
							)}

							<div className="flex items-center gap-2 text-(--secondary)">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
								</svg>
								{institution.website ? (
									<a href={institution.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">
										Website
									</a>
								) : (
									<span className="text-(--secondary)">No website yet</span>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

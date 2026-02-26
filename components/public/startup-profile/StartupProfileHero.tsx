'use client';

import { Button, Badge } from '@/components/ui';
import { startupStageLabels, startupStatusLabels, fundingRoundLabels } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { StartupWithDetails } from './types';

interface StartupProfileHeroProps {
	startup: StartupWithDetails;
}

export function StartupProfileHero({ startup }: StartupProfileHeroProps) {
	const stageInfo = startup.stage ? startupStageLabels[startup.stage] : null;
	const statusInfo = startupStatusLabels[startup.status];
	const fundingInfo = startup.fundingRound ? fundingRoundLabels[startup.fundingRound] : null;

	return (
		<div className="relative">
			{/* Cover Image */}
			<div className="h-48 md:h-72 lg:h-80 bg-linear-to-br from-purple-600 via-violet-600 to-indigo-700 relative overflow-hidden">
				{startup.coverImage ? (
					<img src={startup.coverImage} alt={startup.name} className="w-full h-full object-cover" />
				) : (
					<div className="absolute inset-0 opacity-20">
						<div className="absolute inset-0" style={{
							backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)'
						}}></div>
					</div>
				)}
				<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
			</div>

			{/* Profile Info */}
			<div className="container mx-auto px-4">
				<div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row gap-6 items-start">
					{/* Logo */}
					<div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
						{startup.logo ? (
							<img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full bg-linear-to-br from-purple-100 to-violet-100 flex items-center justify-center">
								<span className="text-4xl font-bold text-purple-600">{startup.name.charAt(0)}</span>
							</div>
						)}
					</div>

					{/* Name & Badges */}
					<div className="flex-1 pt-4 md:pt-8">
						<div className="flex flex-wrap items-center gap-3 mb-2">
							<h1 className="text-2xl md:text-4xl font-bold text-white">{startup.name}</h1>
							<span className={cn('px-3 py-1 rounded-full text-sm font-medium', statusInfo.color)}>
								{statusInfo.label}
							</span>
						</div>

						{startup.tagline && (
							<p className="text-lg md:text-xl text-(--secondary) mb-4 max-w-2xl">{startup.tagline}</p>
						)}

						<div className="flex flex-wrap gap-3 items-center">
							{stageInfo && <Badge variant="outline" className={stageInfo.color}>{stageInfo.label}</Badge>}
							{fundingInfo && <Badge variant="info">{fundingInfo.label}</Badge>}
							{startup.industry && <Badge variant="outline">{startup.industry}</Badge>}
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3 shrink-0 mt-4 md:mt-8">
						{startup.website && (
							<a href={startup.website} target="_blank" rel="noopener noreferrer">
								<Button variant="primary" className="gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
									</svg>
									Visit Website
								</Button>
							</a>
						)}
						<Button variant="ghost" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
							</svg>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

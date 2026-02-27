'use client';

import { Button } from '@/components/ui';
import { startupStageLabels, startupStatusLabels, fundingRoundLabels } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import type { StartupWithDetails } from './types';

interface StartupProfileHeroProps {
	startup: StartupWithDetails;
}

export function StartupProfileHero({ startup }: StartupProfileHeroProps) {
	const stageInfo = startup.stage ? startupStageLabels[startup.stage] : null;
	const statusInfo = startupStatusLabels[startup.status];
	const fundingInfo = startup.fundingRound ? fundingRoundLabels[startup.fundingRound] : null;
	const fundsRaised = startup.fundsRaised ? Number(startup.fundsRaised) : 0;
	const fundingGoal = startup.fundingGoal ? Number(startup.fundingGoal) : 0;
	const fundingProgress = fundingGoal > 0 ? Math.min((fundsRaised / fundingGoal) * 100, 100) : 0;

	const location = startup.city && startup.country
		? `${startup.city}, ${startup.country}`
		: startup.location || null;

	return (
		<section className="border-b border-(--border)">
			{/* Cover Photo */}
			{startup.coverImage && (
				<div className="w-full h-48 sm:h-64 md:h-80 bg-(--surface-hover) relative">
					<img src={startup.coverImage} alt="Cover" className="w-full h-full object-cover" />
					{/* Optional gradient overlay for better contrast if elements overlap it */}
					<div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
				</div>
			)}
			<div className={cn("max-w-5xl mx-auto px-4 sm:px-6 pb-8", startup.coverImage ? "" : "pt-10")}>
				{/* Top row: Logo + Info + Actions */}
				<div className="flex flex-col gap-4 relative">
					{/* Logo Row (Overlaps Banner) */}
					<div className="flex justify-between items-end">
						<div className={cn(
							"w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-(--surface) bg-(--surface) shadow-(--shadow-sm) flex items-center justify-center overflow-hidden shrink-0",
							startup.coverImage ? "-mt-12 sm:-mt-16 z-10" : ""
						)}>
							{startup.logo ? (
								<img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
							) : (
								<span className="text-4xl font-semibold text-(--secondary-light)">{startup.name.charAt(0)}</span>
							)}
						</div>

						{/* Desktop Actions (aligned right of logo) */}
						<div className="hidden sm:flex items-center gap-2 mb-2">
							{startup.website && (
								<a href={startup.website} target="_blank" rel="noopener noreferrer">
									<Button variant="primary" size="sm" className="gap-2">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
										Website
									</Button>
								</a>
							)}
							<Button
								variant="secondary"
								size="sm"
								onClick={() => { navigator.clipboard.writeText(window.location.href); }}
								className="gap-2"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
								Share
							</Button>
						</div>
					</div>

					{/* Info Below Logo */}
					<div className="flex flex-col min-w-0 pt-1">
						<div className="flex flex-wrap items-center gap-2.5 mb-2">
							<h1 className="text-2xl sm:text-3xl font-bold text-(--primary) tracking-tight">{startup.name}</h1>
							<span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', statusInfo.color)}>
								{statusInfo.label}
							</span>
						</div>

						{startup.tagline && (
							<p className="text-base text-(--secondary) mb-4 max-w-xl leading-relaxed">{startup.tagline}</p>
						)}

						{/* Meta row */}
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-(--secondary)">
							{stageInfo && (
								<span className="flex items-center gap-1.5">
									<span className="w-1.5 h-1.5 rounded-full bg-green-500" />
									{stageInfo.label}
								</span>
							)}
							{fundingInfo && (
								<span className="flex items-center gap-1.5">
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									{fundingInfo.label}
								</span>
							)}
							{startup.industry && (
								<span className="flex items-center gap-1.5">
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
									{startup.industry}
								</span>
							)}
							{location && (
								<span className="flex items-center gap-1.5">
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
									{location}
								</span>
							)}
							{startup.foundedDate && (
								<span className="flex items-center gap-1.5">
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
									Founded {new Date(startup.foundedDate).getFullYear()}
								</span>
							)}
							{startup.teamSize && (
								<span className="flex items-center gap-1.5">
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
									{startup.teamSize} people
								</span>
							)}
						</div>
					</div>

					{/* Mobile Actions */}
					<div className="flex sm:hidden items-center gap-2 mt-2">
						{startup.website && (
							<a href={startup.website} target="_blank" rel="noopener noreferrer" className="flex-1">
								<Button variant="primary" size="sm" className="w-full gap-2 justify-center">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
									Website
								</Button>
							</a>
						)}
						<Button
							variant="secondary"
							size="sm"
							onClick={() => { navigator.clipboard.writeText(window.location.href); }}
							className="flex-1 gap-2 justify-center"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
							Share
						</Button>
					</div>
				</div>

				{/* Funding bar — inline */}
				{fundingGoal > 0 && (
					<div className="mt-6 p-4 rounded-xl border border-(--border) bg-(--surface-hover)/30">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-baseline gap-2">
								<span className="text-lg font-bold text-(--primary)">{formatCurrency(fundsRaised, startup.fundingCurrency || 'USD')}</span>
								<span className="text-sm text-(--secondary)">raised of {formatCurrency(fundingGoal, startup.fundingCurrency || 'USD')}</span>
							</div>
							<span className="text-sm font-medium text-(--primary)">{Math.round(fundingProgress)}%</span>
						</div>
						<div className="w-full h-1.5 bg-(--border) rounded-full overflow-hidden">
							<div className="h-full bg-(--primary) rounded-full transition-all duration-700" style={{ width: `${fundingProgress}%` }} />
						</div>
					</div>
				)}

				{/* Social links row */}
				{(startup.linkedin || startup.twitter || startup.instagram || startup.pitchDeckUrl) && (
					<div className="mt-5 flex flex-wrap items-center gap-3">
						{startup.linkedin && (
							<a href={startup.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-(--secondary) hover:text-(--primary) transition-colors">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
								LinkedIn
							</a>
						)}
						{startup.twitter && (
							<a href={startup.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-(--secondary) hover:text-(--primary) transition-colors">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
								X / Twitter
							</a>
						)}
						{startup.instagram && (
							<a href={startup.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-(--secondary) hover:text-(--primary) transition-colors">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
								Instagram
							</a>
						)}
						{startup.pitchDeckUrl && (
							<a href={startup.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-(--secondary) hover:text-(--primary) transition-colors">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
								Pitch Deck
							</a>
						)}
					</div>
				)}
			</div>
		</section>
	);
}

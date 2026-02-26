'use client';

import { Card, Badge } from '@/components/ui';
import { sdgLabels, sectorLabels, SDGFocus, SectorFocus } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import type { StartupWithDetails } from './types';

interface StartupSidebarProps {
	startup: StartupWithDetails;
}

export function StartupSidebar({ startup }: StartupSidebarProps) {
	const fundsRaised = startup.fundsRaised ? Number(startup.fundsRaised) : 0;
	const fundingGoal = startup.fundingGoal ? Number(startup.fundingGoal) : 0;
	const fundingProgress = fundingGoal > 0 ? Math.min((fundsRaised / fundingGoal) * 100, 100) : 0;

	return (
		<div className="space-y-6">
			{/* Funding Progress */}
			{fundingGoal > 0 && (
				<Card className="p-6">
					<div className="mb-4">
						<p className="text-3xl font-bold text-(--primary)">
							{formatCurrency(fundsRaised, startup.fundingCurrency || 'USD')}
						</p>
						<p className="text-(--secondary) text-sm">
							raised of {formatCurrency(fundingGoal, startup.fundingCurrency || 'USD')} goal
						</p>
					</div>
					<div className="w-full h-2 bg-(--surface-hover) rounded-full overflow-hidden mb-4">
						<div
							className="h-full bg-linear-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
							style={{ width: `${fundingProgress}%` }}
						></div>
					</div>
					<p className="text-sm text-(--secondary)">
						<span className="font-semibold text-(--primary)">{Math.round(fundingProgress)}%</span> funded
					</p>
				</Card>
			)}

			{/* Quick Stats */}
			<Card className="p-6">
				<h3 className="font-semibold text-(--primary) mb-4">Quick Facts</h3>
				<div className="space-y-4">
					{startup.foundedDate && (
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-(--surface-hover) flex items-center justify-center">
								<svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<div>
								<p className="text-sm text-(--secondary)">Founded</p>
								<p className="font-medium text-(--primary)">{new Date(startup.foundedDate).getFullYear()}</p>
							</div>
						</div>
					)}

					{(startup.city || startup.country || startup.location) && (
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-(--surface-hover) flex items-center justify-center">
								<svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</div>
							<div>
								<p className="text-sm text-(--secondary)">Location</p>
								<p className="font-medium text-(--primary)">
									{startup.city && startup.country ? `${startup.city}, ${startup.country}` : startup.location || 'Remote'}
								</p>
							</div>
						</div>
					)}
				</div>
			</Card>

			{/* Investors */}
			{startup.investors && startup.investors.length > 0 && (
				<Card className="p-6">
					<h3 className="font-semibold text-(--primary) mb-4">Backed By</h3>
					<div className="flex flex-wrap gap-2">
						{startup.investors.map((investor, index) => (
							<Badge key={index} variant="outline" className="text-sm">{investor}</Badge>
						))}
					</div>
				</Card>
			)}

			{/* Focus Areas */}
			<Card className="p-6">
				<h3 className="font-semibold text-(--primary) mb-4">Focus Areas</h3>
				{startup.sectors && startup.sectors.length > 0 && (
					<div className="mb-4">
						<p className="text-sm text-(--secondary) mb-2">Sectors</p>
						<div className="flex flex-wrap gap-2">
							{startup.sectors.map((sector) => {
								const info = sectorLabels[sector as SectorFocus];
								return <Badge key={sector} variant="outline">{info ? `${info.emoji} ${info.label}` : sector}</Badge>;
							})}
						</div>
					</div>
				)}
				{startup.sdgFocus && startup.sdgFocus.length > 0 && (
					<div>
						<p className="text-sm text-(--secondary) mb-2">UN SDG Alignment</p>
						<div className="flex flex-wrap gap-2">
							{startup.sdgFocus.map((sdg) => {
								const info = sdgLabels[sdg as SDGFocus];
								return info ? (
									<span key={sdg} className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: info.color }} title={info.fullName}>
										{info.label}
									</span>
								) : null;
							})}
						</div>
					</div>
				)}
				{(!startup.sectors || startup.sectors.length === 0) && (!startup.sdgFocus || startup.sdgFocus.length === 0) && (
					<p className="text-(--secondary) text-sm italic">No focus areas specified yet.</p>
				)}
			</Card>

			{/* Social Links */}
			<Card className="p-6">
				<h3 className="font-semibold text-(--primary) mb-4">Connect</h3>
				<div className="space-y-3">
					{startup.website && (
						<a href={startup.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-(--secondary) hover:text-accent transition-colors">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
							</svg>
							<span className="truncate">{startup.website.replace(/^https?:\/\//, '')}</span>
						</a>
					)}
					{startup.linkedin && (
						<a href={startup.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-(--secondary) hover:text-[#0077B5] transition-colors">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
							<span>LinkedIn</span>
						</a>
					)}
					{startup.twitter && (
						<a href={startup.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-(--secondary) hover:text-[#1DA1F2] transition-colors">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
							<span>Twitter / X</span>
						</a>
					)}
					{startup.instagram && (
						<a href={startup.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-(--secondary) hover:text-[#E4405F] transition-colors">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
							<span>Instagram</span>
						</a>
					)}
					{startup.pitchDeckUrl && (
						<a href={startup.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-(--secondary) hover:text-accent transition-colors">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<span>Pitch Deck</span>
						</a>
					)}
				</div>
			</Card>

			{/* Contact */}
			{startup.primaryContactEmail && (
				<Card className="p-6">
					<h3 className="font-semibold text-(--primary) mb-4">Get in Touch</h3>
					<a href={`mailto:${startup.primaryContactEmail}`} className="inline-flex items-center gap-2 text-accent hover:underline">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						Contact Startup
					</a>
				</Card>
			)}
		</div>
	);
}

"use client";

import { Card } from '@/components/ui';
import { OnboardingFormData } from '@/lib/types';

interface OnboardingPreviewSidebarProps {
	formData: OnboardingFormData;
}

export default function OnboardingPreviewSidebar({ formData }: OnboardingPreviewSidebarProps) {
	const completionFields = [
		formData.type,
		formData.name.trim(),
		formData.tagline.trim(),
		formData.city.trim(),
		formData.country.trim(),
		formData.description.trim(),
	];
	const completionPct = Math.round(completionFields.filter(Boolean).length / completionFields.length * 100);

	return (
		<Card className="p-6 sticky top-6">
			<h3 className="text-sm font-semibold text-(--secondary) uppercase tracking-wide mb-4">Live Preview</h3>

			<div className="space-y-4">
				{/* Institution Logo & Name */}
				<div className="flex items-start gap-3 pb-4 border-b border-(--border)">
					<div className="w-16 h-16 rounded-lg bg-(--surface) border border-(--border) flex items-center justify-center overflow-hidden shrink-0">
						{formData.logo ? (
							<img src={formData.logo} alt="Logo preview" className="w-full h-full object-contain" />
						) : (
							<span className="text-2xl" aria-hidden="true">🏛️</span>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<h4 className="font-semibold text-(--primary) truncate">
							{formData.name || 'Institution Name'}
						</h4>
						{formData.type && (
							<p className="text-xs text-(--secondary) mt-1">
								{formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
							</p>
						)}
					</div>
				</div>

				{/* Tagline */}
				{formData.tagline && (
					<div>
						<p className="text-xs font-medium text-(--secondary) mb-1">Tagline</p>
						<p className="text-sm text-(--primary) italic">&ldquo;{formData.tagline}&rdquo;</p>
					</div>
				)}

				{/* Location */}
				{(formData.city || formData.country) && (
					<div>
						<p className="text-xs font-medium text-(--secondary) mb-1">Location</p>
						<div className="flex items-center gap-1 text-sm text-(--primary)">
							<svg className="w-4 h-4 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							<span>{[formData.city, formData.country].filter(Boolean).join(', ') || 'Not specified'}</span>
						</div>
					</div>
				)}

				{/* Website */}
				{formData.website && (
					<div>
						<p className="text-xs font-medium text-(--secondary) mb-1">Website</p>
						<a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline break-all">
							{formData.website}
						</a>
					</div>
				)}

				{/* Description */}
				{formData.description && (
					<div>
						<p className="text-xs font-medium text-(--secondary) mb-1">Description</p>
						<p className="text-sm text-(--primary) line-clamp-4">{formData.description}</p>
					</div>
				)}

				{/* SDG Focus */}
				{formData.sdgFocus.length > 0 && (
					<div>
						<p className="text-xs font-medium text-(--secondary) mb-2">SDG Focus</p>
						<div className="flex flex-wrap gap-1">
							{formData.sdgFocus.map((sdg) => (
								<span key={sdg} className="text-xs px-2 py-1 rounded-full bg-(--surface-hover) text-(--primary)">
									{sdg}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Sector Focus */}
				{formData.sectorFocus.length > 0 && (
					<div>
						<p className="text-xs font-medium text-(--secondary) mb-2">Sectors</p>
						<div className="flex flex-wrap gap-1">
							{formData.sectorFocus.map((sector) => (
								<span key={sector} className="text-xs px-2 py-1 rounded-full bg-(--accent-light) text-accent">
									{sector}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Completion Status */}
				<div className="pt-4 border-t border-(--border)">
					<div className="flex items-center justify-between text-xs mb-2">
						<span className="text-(--secondary)">Profile Completion</span>
						<span className="font-semibold text-(--primary)">{completionPct}%</span>
					</div>
					<div className="h-2 bg-(--surface-hover) rounded-full overflow-hidden">
						<div className="h-full bg-accent transition-all duration-300" style={{ width: `${completionPct}%` }} />
					</div>
				</div>
			</div>
		</Card>
	);
}

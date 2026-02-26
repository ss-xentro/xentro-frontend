'use client';

import { Badge } from '@/components/ui';
import type { StartupWithDetails } from './types';

interface TeamTabContentProps {
	startup: StartupWithDetails;
}

export function TeamTabContent({ startup }: TeamTabContentProps) {
	const hasFounders = startup.founders && startup.founders.length > 0;
	const hasTeam = startup.teamMembers && startup.teamMembers.length > 0;
	const hasOwner = !!startup.owner;
	const isEmpty = !hasFounders && !hasOwner && !hasTeam;

	return (
		<div className="space-y-8">
			{/* Founders */}
			{hasFounders && (
				<div>
					<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Founders</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						{startup.founders!.map((founder) => (
							<div key={founder.id || founder.email} className="flex items-center gap-4 p-4 rounded-xl border border-(--border) bg-(--surface)">
								<div className="w-12 h-12 rounded-full bg-(--surface-hover) flex items-center justify-center shrink-0">
									<span className="text-base font-semibold text-(--secondary)">{founder.name?.charAt(0) || 'F'}</span>
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="text-sm font-medium text-(--primary) truncate">{founder.name}</h4>
									<p className="text-xs text-(--secondary) capitalize">{founder.role?.replace(/_/g, ' ') || 'Founder'}</p>
								</div>
								{founder.isPrimary && <Badge variant="info" className="shrink-0 text-xs">Primary</Badge>}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Fallback: Owner as Founder */}
			{!hasFounders && hasOwner && (
				<div>
					<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Founder</h3>
					<div className="flex items-center gap-4 p-4 rounded-xl border border-(--border) bg-(--surface)">
						<div className="w-12 h-12 rounded-full bg-(--surface-hover) flex items-center justify-center shrink-0">
							<span className="text-base font-semibold text-(--secondary)">{startup.owner!.name?.charAt(0) || 'F'}</span>
						</div>
						<div className="flex-1 min-w-0">
							<h4 className="text-sm font-medium text-(--primary)">{startup.owner!.name}</h4>
							<p className="text-xs text-(--secondary)">Founder</p>
						</div>
						<Badge variant="info" className="shrink-0 text-xs">Primary</Badge>
					</div>
				</div>
			)}

			{/* Team Members */}
			{hasTeam && (
				<div>
					<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Team</h3>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{startup.teamMembers!.map((member) => (
							<div key={member.id} className="flex items-center gap-3 p-4 rounded-xl border border-(--border) bg-(--surface)">
								<div className="w-10 h-10 rounded-full bg-(--surface-hover) flex items-center justify-center shrink-0">
									<span className="text-sm font-semibold text-(--secondary)">{member.user?.name?.charAt(0) || 'T'}</span>
								</div>
								<div className="min-w-0">
									<h4 className="text-sm font-medium text-(--primary) truncate">{member.user?.name || 'Team Member'}</h4>
									<p className="text-xs text-(--secondary) capitalize truncate">{member.title || member.role?.replace(/_/g, ' ') || 'Member'}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Empty state */}
			{isEmpty && (
				<div className="text-center py-16">
					<div className="w-12 h-12 rounded-full bg-(--surface-hover) mx-auto mb-3 flex items-center justify-center">
						<svg className="w-6 h-6 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<p className="text-sm font-medium text-(--primary) mb-1">Team info coming soon</p>
					<p className="text-xs text-(--secondary)">The team hasn&apos;t added members yet.</p>
				</div>
			)}

			{/* Team size info */}
			{startup.teamSize && (
				<p className="text-xs text-(--secondary) flex items-center gap-1.5">
					<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					{startup.teamSize} team members{startup.employeeCount ? ` (${startup.employeeCount} employees)` : ''}
				</p>
			)}
		</div>
	);
}

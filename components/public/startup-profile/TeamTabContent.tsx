'use client';

import { Card, Badge } from '@/components/ui';
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
		<div className="space-y-6">
			<h2 className="text-xl font-bold text-(--primary)">Meet the Team</h2>

			{/* Founders */}
			{hasFounders && (
				<div className="space-y-3">
					<h3 className="text-sm font-semibold uppercase tracking-wider text-(--secondary)">Founders</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						{startup.founders!.map((founder) => (
							<Card key={founder.id || founder.email} className="p-5">
								<div className="flex items-center gap-4">
									<div className="w-14 h-14 rounded-full bg-linear-to-br from-purple-100 to-violet-100 flex items-center justify-center">
										<span className="text-lg font-bold text-purple-600">{founder.name?.charAt(0) || 'F'}</span>
									</div>
									<div className="flex-1 min-w-0">
										<h4 className="font-semibold text-(--primary) truncate">{founder.name}</h4>
										<p className="text-sm text-(--secondary) capitalize">{founder.role?.replace(/_/g, ' ') || 'Founder'}</p>
									</div>
									{founder.isPrimary && <Badge variant="info" className="shrink-0">Primary</Badge>}
								</div>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Fallback: Owner as Founder */}
			{!hasFounders && hasOwner && (
				<Card className="p-6">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-100 to-violet-100 flex items-center justify-center">
							<span className="text-xl font-bold text-purple-600">{startup.owner!.name?.charAt(0) || 'F'}</span>
						</div>
						<div>
							<h3 className="font-bold text-(--primary) text-lg">{startup.owner!.name}</h3>
							<p className="text-(--secondary)">Founder</p>
						</div>
						<Badge variant="info" className="ml-auto">Primary</Badge>
					</div>
				</Card>
			)}

			{/* Team Members */}
			{hasTeam && (
				<div className="space-y-3">
					<h3 className="text-sm font-semibold uppercase tracking-wider text-(--secondary)">Team Members</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						{startup.teamMembers!.map((member) => (
							<Card key={member.id} className="p-4">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
										<span className="text-sm font-bold text-gray-600">{member.user?.name?.charAt(0) || 'T'}</span>
									</div>
									<div>
										<h4 className="font-medium text-(--primary)">{member.user?.name || 'Team Member'}</h4>
										<p className="text-sm text-(--secondary) capitalize">{member.title || member.role?.replace(/_/g, ' ') || 'Member'}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Empty state */}
			{isEmpty && (
				<div className="text-center py-12">
					<div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
						<svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-(--primary) mb-2">Team info coming soon</h3>
					<p className="text-(--secondary)">The team hasn&apos;t added members to their profile yet.</p>
				</div>
			)}

			{/* Team size info */}
			{startup.teamSize && (
				<div className="flex items-center gap-2 text-(--secondary) mt-4">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span>{startup.teamSize} team members</span>
					{startup.employeeCount && <span className="text-(--secondary)">({startup.employeeCount} employees)</span>}
				</div>
			)}
		</div>
	);
}

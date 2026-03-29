"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { MediaPreview } from '@/components/ui/MediaPreview';
import { RichTextDisplay } from '@/components/ui/RichTextDisplay';
import type { StartupWithDetails, Founder, TeamMemberData } from './types';

interface TeamTabContentProps {
	startup: StartupWithDetails;
}

export function TeamTabContent({ startup }: TeamTabContentProps) {
	const [selectedMember, setSelectedMember] = useState<CombinedTeamMember | null>(null);

	const hasFounders = startup.founders && startup.founders.length > 0;
	const hasTeam = startup.teamMembers && startup.teamMembers.length > 0;
	const hasOwner = !!startup.owner;

	interface CombinedTeamMember {
		id: string;
		name: string;
		email?: string;
		role: string;
		title: string;
		bio?: string | null;
		isPrimary: boolean;
		initial: string;
		avatar?: string | null;
	}

	const combinedTeam: CombinedTeamMember[] = [];

	const formatTitle = (str: string) => {
		if (!str) return 'Member';
		// Uppercase short acronyms like CTO, CEO, CPO
		if (str.length <= 4 && !str.includes(' ')) {
			return str.toUpperCase();
		}
		// Regular title case
		return str.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
	};

	if (hasFounders) {
		startup.founders!.forEach((f, index) => {
			combinedTeam.push({
				id: f.id || f.email || `founder-${index}`,
				name: f.name,
				email: f.email,
				role: f.role || '',
				title: formatTitle(f.title || f.role || 'Founder'),
				bio: f.bio,
				isPrimary: f.isPrimary,
				initial: f.name?.charAt(0) || 'F',
				avatar: f.avatar,
			});
		});
	} else if (hasOwner) {
		combinedTeam.push({
			id: startup.owner!.id,
			name: startup.owner!.name,
			email: undefined,
			role: 'founder',
			title: 'Founder',
			bio: null,
			isPrimary: true,
			initial: startup.owner!.name?.charAt(0) || 'F',
			avatar: null,
		});
	}

	if (hasTeam) {
		startup.teamMembers!.forEach((m) => {
			// Avoid duplicating founders
			if (!combinedTeam.find(t => t.id === m.id || t.id === m.user?.id)) {
				combinedTeam.push({
					id: m.id,
					name: m.name || m.user?.name || 'Team Member',
					email: m.email,
					role: m.role || '',
					title: formatTitle(m.title || m.role || 'Member'),
					bio: m.bio,
					isPrimary: false,
					initial: (m.name || m.user?.name)?.charAt(0) || 'T',
					avatar: m.avatar,
				});
			}
		});
	}

	// Sort logic: Primary -> Founder -> C-Level/Board -> Seniors/Heads -> Default
	const getRoleWeight = (m: CombinedTeamMember) => {
		if (m.isPrimary) return 1;
		const roleStr = (m.role + ' ' + m.title).toLowerCase();
		if (roleStr.includes('founder')) return 2;
		if (
			roleStr.match(/\bc[a-z]o\b/) || // CEO, CTO, CPO, etc.
			roleStr.includes('chief') ||
			roleStr.includes('president') ||
			roleStr.includes('board')
		) return 3;
		if (
			roleStr.includes('senior') ||
			roleStr.includes('head') ||
			roleStr.includes('director') ||
			roleStr.includes('vp') ||
			roleStr.includes('vice') ||
			roleStr.includes('lead')
		) return 4;
		return 5;
	};

	combinedTeam.sort((a, b) => getRoleWeight(a) - getRoleWeight(b));

	const isEmpty = combinedTeam.length === 0;

	// Determine if there are partners (using placeholder logic based on institutionId or investors string)
	// You mentioned "Partners(mentors, institutions, investors)". Note: backend doesn't currently return full mentor objects.
	const hasInstitution = !!startup.institutionId;
	const hasInvestors = !!(startup as any).investors?.length;
	const hasPartners = hasInstitution || hasInvestors;

	return (
		<div className="space-y-8">
			{/* Combined Team Section */}
			{!isEmpty && (
				<div>
					<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Team</h3>
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{combinedTeam.map((member) => (
							<div key={member.id} className="rounded-2xl border border-(--border) bg-linear-to-b from-(--surface) to-white p-5 text-center shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
								<div className="flex justify-center mb-4">
									<div className="h-28 w-28 rounded-full border-2 border-(--border) overflow-hidden bg-(--surface-hover)">
										{member.avatar ? (
											<button type="button" onClick={() => setSelectedMember(member)} className="h-full w-full" aria-label={`Open ${member.name} profile`}>
												<MediaPreview
													src={member.avatar}
													alt={member.name}
													className="h-full w-full rounded-none border-0"
													mediaClassName="object-cover"
													showControls={false}
												/>
											</button>
										) : (
											<div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-(--secondary)">
												{member.initial}
											</div>
										)}
									</div>
								</div>

								<h4 className="text-base font-semibold text-(--primary) truncate">{member.name}</h4>
								<p className="text-sm text-(--secondary) mt-1 truncate">{member.title}</p>

								<div className="mt-4 pt-4 border-t border-(--border) flex items-center justify-center gap-2">
									<Badge variant="outline" className="text-[10px] uppercase tracking-wider">
										{member.role.replace('_', ' ')}
									</Badge>
									{member.isPrimary && <Badge variant="info" className="text-xs">Primary</Badge>}
								</div>

								<button
									type="button"
									onClick={() => setSelectedMember(member)}
									className="mt-4 inline-flex items-center justify-center rounded-full border border-(--border) px-3 py-1 text-xs font-medium text-(--secondary) hover:text-(--primary) hover:border-(--secondary-light)"
								>
									View Profile
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Partners Section (Only visible when data exists) */}
			{hasPartners && (
				<div className="pt-6 border-t border-(--border)">
					<h3 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Partners</h3>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{hasInstitution && (
							<div className="flex items-center gap-3 p-4 rounded-xl border border-(--border) bg-(--surface)">
								<div className="w-10 h-10 rounded-full bg-(--surface-hover) flex items-center justify-center shrink-0">
									<svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
									</svg>
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="text-sm font-medium text-(--primary) truncate">{(startup as any).institutionName || 'Institutional Partner'}</h4>
									<p className="text-xs text-(--secondary) capitalize truncate">Associated Institution</p>
								</div>
							</div>
						)}

						{hasInvestors && ((startup as any).investors || []).map((investorName: string, i: number) => (
							<div key={`inv-${i}`} className="flex items-center gap-3 p-4 rounded-xl border border-(--border) bg-(--surface)">
								<div className="w-10 h-10 rounded-full bg-(--surface-hover) flex items-center justify-center shrink-0">
									<svg className="w-5 h-5 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="text-sm font-medium text-(--primary) truncate">{investorName}</h4>
									<p className="text-xs text-(--secondary) capitalize truncate">Investor</p>
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

			{selectedMember && (
				<Modal
					isOpen={!!selectedMember}
					onClose={() => setSelectedMember(null)}
					className="max-w-2xl overflow-hidden p-0"
				>
					<div className="relative h-[45vh] min-h-[260px] bg-black">
						{selectedMember.avatar ? (
							<MediaPreview
								src={selectedMember.avatar}
								alt={selectedMember.name}
								className="h-full w-full rounded-none border-0 bg-black"
								mediaClassName="object-contain"
								showControls={false}
							/>
						) : (
							<div className="h-full w-full flex items-center justify-center text-5xl font-semibold text-(--secondary)">{selectedMember.initial}</div>
						)}
						<button
							type="button"
							onClick={() => setSelectedMember(null)}
							className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/60 text-white hover:bg-black/80"
							aria-label="Close profile image preview"
						>
							X
						</button>
					</div>
					<div className="p-5">
						<h4 className="text-lg font-semibold text-(--primary)">{selectedMember.name}</h4>
						<p className="text-sm text-(--secondary)">{selectedMember.title}</p>
						{selectedMember.email && <p className="mt-1 text-xs text-(--secondary)">{selectedMember.email}</p>}
						{selectedMember.bio ? (
							<RichTextDisplay html={selectedMember.bio} className="mt-4" compact />
						) : (
							<p className="mt-4 text-sm text-(--secondary)">No additional profile details shared yet.</p>
						)}
					</div>
				</Modal>
			)}
		</div>
	);
}

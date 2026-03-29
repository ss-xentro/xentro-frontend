"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Textarea, Modal } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { InstitutionApplication, Institution } from '@/lib/types';
import { AppIcon } from '@/components/ui/AppIcon';

interface DashboardStats {
	programsCount: number;
	teamCount: number;
	startupsCount: number;
	profileViews: number;
}

interface ApprovedDashboardProps {
	application: InstitutionApplication;
	institution: Institution | null;
	stats: DashboardStats;
	onEditProfile: () => void;
	onNudgeVerification: (message: string) => Promise<void>;
}

function StatCard({ icon, bg, label, value }: { icon: string; bg: string; label: string; value: number | string }) {
	return (
		<Card className="p-6">
			<div className="flex items-center gap-4">
				<div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
					<AppIcon name={icon} className="w-6 h-6" />
				</div>
				<div>
					<p className="text-sm text-(--secondary)">{label}</p>
					<p className="text-2xl font-bold text-(--primary)">{typeof value === 'number' ? value.toLocaleString() : value}</p>
				</div>
			</div>
		</Card>
	);
}

const QUICK_ACTIONS = [
	{ href: '/institution-dashboard/startups', icon: 'rocket', title: 'Add Startup', desc: "Register startups you're supporting" },
	{ href: '/institution-dashboard/projects', icon: 'folder', title: 'Add Project', desc: 'Showcase your initiatives' },
	{ href: '/institution-dashboard/team', icon: 'users', title: 'Add Team Member', desc: 'Build your team directory' },
	{ href: '/institution-dashboard/analytics', icon: 'trending-up', title: 'View Analytics', desc: 'Track your impact' },
];

export default function ApprovedDashboard({ application, institution, stats, onEditProfile, onNudgeVerification }: ApprovedDashboardProps) {
	const [requestModalOpen, setRequestModalOpen] = useState(false);
	const [requestMessage, setRequestMessage] = useState('');
	const [submittingRequest, setSubmittingRequest] = useState(false);
	const institutionPublicId = application.institutionId || institution?.id || '';

	const handleSubmitVerificationRequest = async () => {
		try {
			setSubmittingRequest(true);
			await onNudgeVerification(requestMessage);
			setRequestModalOpen(false);
			setRequestMessage('');
		} finally {
			setSubmittingRequest(false);
		}
	};

	return (
		<DashboardSidebar>
			<div className="p-8 space-y-6 animate-fadeIn">
				{institution && !institution.verified && (
					<Card className="p-4 border border-amber-200 bg-amber-50">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-amber-900">Verified badge review</p>
								<p className="text-sm text-amber-800 mt-1">
									{application.status === 'rejected'
										? 'Your verified badge request was denied. Update your profile and nudge admin again when ready.'
										: 'Your institution is live. Verified badge review is pending with admin.'}
								</p>
								{application.remark && (
									<p className="text-sm text-amber-900 mt-2">
										Admin message: {application.remark}
									</p>
								)}
							</div>
							<Button variant="secondary" onClick={() => setRequestModalOpen(true)}>
								Request Verification
							</Button>
						</div>
					</Card>
				)}

				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-(--primary) mb-2">Welcome back!</h1>
					<p className="text-(--secondary)">Manage your institution profile, programs, and team members</p>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<StatCard icon="rocket" bg="bg-purple-100 dark:bg-purple-500/20" label="Active Programs" value={stats.programsCount} />
					<StatCard icon="users" bg="bg-blue-100 dark:bg-blue-500/20" label="Team Members" value={stats.teamCount} />
					<StatCard icon="briefcase" bg="bg-amber-100 dark:bg-amber-500/20" label="Portfolio Startups" value={stats.startupsCount} />
					<StatCard icon="bar-chart" bg="bg-green-100 dark:bg-green-500/20" label="Profile Views" value={stats.profileViews} />
				</div>

				{/* Institution Profile Card */}
				<Card className="p-6">
					<div className="flex items-start justify-between mb-6">
						<div>
							<h2 className="text-xl font-bold text-(--primary) mb-1">Institution Profile</h2>
							<p className="text-sm text-(--secondary)">Your institution is live on the platform</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-200 text-sm font-medium flex items-center gap-1"><AppIcon name="check" className="w-3.5 h-3.5" /> Published</span>
							{institution?.verified && (
								<span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-200 text-sm font-medium flex items-center gap-1">
									<AppIcon name="check" className="w-3.5 h-3.5" /> Verified Badge
								</span>
							)}
						</div>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						<div className="flex gap-4">
							{application.logo && (
								<div className="w-20 h-20 rounded-lg border border-(--border) bg-(--surface) flex items-center justify-center overflow-hidden shrink-0">
									<img src={application.logo} alt={application.name} className="w-full h-full object-contain" />
								</div>
							)}
							<div>
								<h3 className="font-semibold text-(--primary) text-lg">{application.name}</h3>
								{application.tagline && <p className="text-sm text-(--secondary) mb-2">{application.tagline}</p>}
								{application.city && application.country && (
									<p className="text-sm text-(--secondary) flex items-center gap-1"><AppIcon name="map-pin" className="w-3.5 h-3.5" /> {application.city}, {application.country}</p>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-(--secondary)">Email</span>
								<span className="text-sm text-(--primary)">{application.email}</span>
							</div>
							{application.phone && (
								<div className="flex items-center justify-between">
									<span className="text-sm text-(--secondary)">Phone</span>
									<span className="text-sm text-(--primary)">{application.phone}</span>
								</div>
							)}
							{application.website && (
								<div className="flex items-center justify-between">
									<span className="text-sm text-(--secondary)">Website</span>
									<a href={application.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">Visit →</a>
								</div>
							)}
						</div>
					</div>

					<div className="flex gap-3 mt-6 pt-6 border-t border-(--border)">
						<Link href="/institution-edit">
							<Button>Edit Profile</Button>
						</Link>
						{(institution?.slug || institutionPublicId) && (
							<>
								<Link href={`/institution-preview/${institutionPublicId}`}>
									<Button>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
										Preview & Edit
									</Button>
								</Link>
								<a href={`/institutions/${institution?.slug || institutionPublicId}`} target="_blank" rel="noopener noreferrer">
									<Button variant="ghost">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
										</svg>
										View Public Profile
									</Button>
								</a>
							</>
						)}
					</div>
				</Card>

				{/* Quick Actions */}
				<Card className="p-6">
					<h2 className="text-lg font-bold text-(--primary) mb-4">Quick Actions</h2>
					<div className="grid md:grid-cols-2 gap-4">
						{QUICK_ACTIONS.map((action) => (
							<Link key={action.href} href={action.href} className="p-4 rounded-lg border border-(--border) hover:border-accent hover:bg-(--surface-hover) transition-all group">
								<div className="flex items-center gap-3">
									<AppIcon name={action.icon} className="w-6 h-6 text-(--secondary)" />
									<div>
										<p className="font-semibold text-(--primary) group-hover:text-accent">{action.title}</p>
										<p className="text-sm text-(--secondary)">{action.desc}</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</Card>

				{requestModalOpen && (
					<Modal
						isOpen={requestModalOpen}
						onClose={() => !submittingRequest && setRequestModalOpen(false)}
						title="Request Verified Badge"
					>
						<p className="text-sm text-(--secondary) -mt-2 mb-4">
							Send an optional note to admin. They can approve or deny your blue tick request.
						</p>

						<Textarea
							label="Message to admin (optional)"
							placeholder="Add context about your institution, traction, or why this should be verified."
							value={requestMessage}
							onChange={(e) => setRequestMessage(e.target.value)}
							rows={5}
						/>

						<div className="flex items-center justify-end gap-3 pt-2">
							<Button
								variant="ghost"
								onClick={() => setRequestModalOpen(false)}
								disabled={submittingRequest}
							>
								Cancel
							</Button>
							<Button onClick={handleSubmitVerificationRequest} disabled={submittingRequest}>
								{submittingRequest ? 'Submitting...' : 'Send Request'}
							</Button>
						</div>
					</Modal>
				)}
			</div>
		</DashboardSidebar>
	);
}

"use client";

import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { InstitutionApplication, Institution } from '@/lib/types';

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
}

function StatCard({ emoji, bg, label, value }: { emoji: string; bg: string; label: string; value: number | string }) {
	return (
		<Card className="p-6">
			<div className="flex items-center gap-4">
				<div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
					<span className="text-2xl">{emoji}</span>
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
	{ href: '/institution-dashboard/startups', emoji: '🚀', title: 'Add Startup', desc: "Register startups you're supporting" },
	{ href: '/institution-dashboard/projects', emoji: '📁', title: 'Add Project', desc: 'Showcase your initiatives' },
	{ href: '/institution-dashboard/team', emoji: '👥', title: 'Add Team Member', desc: 'Build your team directory' },
	{ href: '/institution-dashboard/analytics', emoji: '📈', title: 'View Analytics', desc: 'Track your impact' },
];

export default function ApprovedDashboard({ application, institution, stats, onEditProfile }: ApprovedDashboardProps) {
	return (
		<DashboardSidebar>
			<div className="p-8 space-y-6 animate-fadeIn">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-(--primary) mb-2">Welcome back! 👋</h1>
					<p className="text-(--secondary)">Manage your institution profile, programs, and team members</p>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<StatCard emoji="🚀" bg="bg-purple-100" label="Active Programs" value={stats.programsCount} />
					<StatCard emoji="👥" bg="bg-blue-100" label="Team Members" value={stats.teamCount} />
					<StatCard emoji="💼" bg="bg-amber-100" label="Portfolio Startups" value={stats.startupsCount} />
					<StatCard emoji="📊" bg="bg-green-100" label="Profile Views" value={stats.profileViews} />
				</div>

				{/* Institution Profile Card */}
				<Card className="p-6">
					<div className="flex items-start justify-between mb-6">
						<div>
							<h2 className="text-xl font-bold text-(--primary) mb-1">Institution Profile</h2>
							<p className="text-sm text-(--secondary)">Your institution is live on the platform</p>
						</div>
						<span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">✓ Published</span>
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
									<p className="text-sm text-(--secondary)">📍 {application.city}, {application.country}</p>
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
						{(institution?.slug || application.institutionId) && (
							<>
								<Link href={`/institution-preview/${application.institutionId}`}>
									<Button>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
										Preview & Edit
									</Button>
								</Link>
								<a href={`/institutions/${institution?.slug || application.institutionId}`} target="_blank" rel="noopener noreferrer">
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
									<span className="text-2xl">{action.emoji}</span>
									<div>
										<p className="font-semibold text-(--primary) group-hover:text-accent">{action.title}</p>
										<p className="text-sm text-(--secondary)">{action.desc}</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</Card>
			</div>
		</DashboardSidebar>
	);
}

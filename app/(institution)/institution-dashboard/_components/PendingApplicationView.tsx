"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { InstitutionApplication } from '@/lib/types';

interface PendingApplicationViewProps {
	application: InstitutionApplication | null;
	loading: boolean;
	error: string | null;
	onStartOnboarding: () => void;
}

export default function PendingApplicationView({
	application,
	loading,
	error,
	onStartOnboarding,
}: PendingApplicationViewProps) {
	const router = useRouter();

	return (
		<main className="min-h-screen bg-background py-16 px-4" role="main">
			<div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
				<div>
					<p className="text-accent font-semibold text-sm uppercase tracking-wide">Phase 1 Complete ✓</p>
					<h1 className="text-3xl font-bold text-(--primary)">Institution Dashboard</h1>
					<p className="text-(--secondary)">Your email is verified. Complete Phase 2 by filling in all institution details and submitting for admin approval.</p>
				</div>

				{loading && <p className="text-(--secondary)">Loading your application…</p>}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900" role="alert">
						{error}
					</div>
				)}

				{application && (
					<Card className="p-6 space-y-4">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm text-(--secondary)">Institution Name</p>
								<h2 className="text-xl font-semibold text-(--primary)">{application.name}</h2>
								<p className="text-xs text-(--secondary) mt-1">Email: {application.email}</p>
							</div>
							<span className={`text-sm px-3 py-1.5 rounded-full font-medium ${application.status === 'approved'
									? 'bg-green-100 text-green-800'
									: application.status === 'rejected'
										? 'bg-red-100 text-red-800'
										: 'bg-yellow-100 text-yellow-800'
								}`}>
								{application.status === 'approved' ? '✓ Approved' : application.status === 'rejected' ? '✗ Rejected' : '⏳ Pending Review'}
							</span>
						</div>

						{application.remark && (
							<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded" role="status">
								<p className="text-sm font-semibold text-blue-900">Admin Feedback:</p>
								<p className="text-sm text-blue-800 mt-1">{application.remark}</p>
							</div>
						)}

						<p className="text-(--secondary) text-sm">
							{application.status === 'pending' && !application.description && (
								<span className="flex items-center gap-2">
									<svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
										<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
									</svg>
									Complete Phase 2 onboarding to submit your application for admin review.
								</span>
							)}
							{application.status === 'pending' && application.description && "Your application has been submitted and is being reviewed by our team. You'll be notified once a decision is made."}
							{application.status === 'approved' && 'Congratulations! Your institution has been approved and is now published on the platform.'}
							{application.status === 'rejected' && 'Your application needs updates. Please review the admin feedback above and resubmit.'}
						</p>

						{application.logo && (
							<div className="w-28 h-28 rounded-lg border border-(--border) bg-(--surface) flex items-center justify-center overflow-hidden">
								<img src={application.logo} alt={application.name} className="w-full h-full object-contain" />
							</div>
						)}

						<div className="pt-4 border-t border-(--border) flex gap-3">
							{application.status !== 'approved' && (
								<Button onClick={onStartOnboarding} className="min-h-11">
									{application.status === 'rejected' ? 'Update & Resubmit' : application.description ? 'Edit Details' : '→ Start Phase 2'}
								</Button>
							)}
							{application.status === 'approved' && application.institutionId && (
								<>
									<a href={`/institutions/${application.institutionId}`} target="_blank" rel="noopener noreferrer">
										<Button className="min-h-11">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
											</svg>
											View Public Profile
										</Button>
									</a>
									<Button onClick={() => router.push(`/institution-preview/${application.institutionId}`)} variant="secondary" className="min-h-11">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
										Preview & Edit
									</Button>
								</>
							)}
						</div>
					</Card>
				)}

				{!application && !loading && (
					<Card className="p-12 text-center">
						<div className="max-w-md mx-auto">
							<div className="w-16 h-16 rounded-full bg-(--surface-hover) flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-(--primary) mb-2">No verified application found</h3>
							<p className="text-(--secondary)">Please complete Phase 1 by verifying your email. If you just verified, try refreshing the page.</p>
						</div>
					</Card>
				)}

				<div className="flex gap-3">
					<Link href="/">
						<Button variant="ghost">Back home</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}

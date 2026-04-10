'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

interface TeamMemberDetail {
	id: string;
	role: string;
	userName?: string;
	userEmail?: string;
	isActive: boolean;
	adminApproved: boolean;
	managerApproved: boolean;
	createdAt: string;
}

const roleColors: Record<string, string> = {
	admin: 'bg-purple-500/20 text-purple-200',
	manager: 'bg-blue-500/20 text-blue-200',
	ambassador: 'bg-green-500/20 text-green-200',
	viewer: 'bg-(--accent-light) text-(--primary)',
};

export default function TeamMemberDetailPage() {
	const router = useRouter();
	const params = useParams();
	const memberId = params.id as string;

	// Reuses the team list cache and derives the member
	const { data: teamRaw, isLoading: loading, error: queryError } = useApiQuery<{ data: TeamMemberDetail[] }>(queryKeys.institution.team(), '/api/institution-team/', { requestOptions: { role: 'institution' } });
	const member = useMemo(() => (teamRaw?.data || []).find((m) => m.id === memberId) ?? null, [teamRaw, memberId]);
	const error = !loading && !member && !queryError ? 'Team member not found' : queryError?.message ?? null;

	const deleteMutation = useApiMutation<unknown, void>({
		method: 'delete',
		path: `/api/institution-team/${memberId}/`,
		invalidateKeys: [queryKeys.institution.team()],
		requestOptions: { role: 'institution' },
		mutationOptions: { onSuccess: () => router.push('/institution-dashboard/team') },
	});
	const deleting = deleteMutation.isPending;

	const handleRemove = () => {
		if (!confirm('Are you sure you want to remove this team member? They will be moved to the recycle bin.')) return;
		deleteMutation.mutate(undefined as never);
	};

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-(--accent-light) rounded w-1/4" /><div className="h-64 bg-(--accent-light) rounded" /></div></div>
			</DashboardSidebar>
		);
	}

	if (error || !member) {
		return (
			<DashboardSidebar>
				<div className="p-8"><Card className="p-8 text-center"><p className="text-(--error) mb-4">{error || 'Member not found'}</p><Button onClick={() => router.push('/institution-dashboard/team')}>Back to Team</Button></Card></div>
			</DashboardSidebar>
		);
	}

	return (
		<DashboardSidebar>
			<div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<button onClick={() => router.push('/institution-dashboard/team')} className="text-sm text-(--secondary) hover:text-(--primary) flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						Back to Team
					</button>
					{member.role !== 'admin' && (
						<Button variant="ghost" className="text-(--error) hover:opacity-80 hover:bg-(--error-light)" onClick={handleRemove} disabled={deleting}>
							{deleting ? 'Removing...' : 'Remove Member'}
						</Button>
					)}
				</div>

				<Card className="p-8 bg-(--accent-subtle) border border-(--border)">
					<div className="flex items-start gap-6 mb-6">
						<div className="w-20 h-20 rounded-full bg-(--accent-light) flex items-center justify-center text-3xl font-bold text-(--primary-light) shrink-0">
							{member.userName?.[0]?.toUpperCase() || '?'}
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-(--primary)">{member.userName || 'Unknown'}</h1>
							{member.userEmail && <p className="text-sm text-(--secondary) mt-1">{member.userEmail}</p>}
							<div className="flex items-center gap-3 mt-3">
								<span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[member.role] || 'bg-(--accent-light) text-(--primary)'}`}>
									{member.role}
								</span>
								<span className={`px-3 py-1 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
									{member.isActive ? 'Active' : 'Inactive'}
								</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-(--border) pt-6">
						<div>
							<p className="text-xs font-medium text-(--secondary) mb-1">Joined</p>
							<p className="text-sm text-(--primary)">{new Date(member.createdAt).toLocaleDateString()}</p>
						</div>
						<div>
							<p className="text-xs font-medium text-(--secondary) mb-1">Admin Approved</p>
							<p className="text-sm text-(--primary)">{member.adminApproved ? 'Yes' : 'No'}</p>
						</div>
						<div>
							<p className="text-xs font-medium text-(--secondary) mb-1">Manager Approved</p>
							<p className="text-sm text-(--primary)">{member.managerApproved ? 'Yes' : 'No'}</p>
						</div>
					</div>
				</Card>
			</div>
		</DashboardSidebar>
	);
}

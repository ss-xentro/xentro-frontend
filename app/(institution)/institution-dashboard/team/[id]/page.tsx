'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

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
	admin: 'bg-purple-100 text-purple-800',
	manager: 'bg-blue-100 text-blue-800',
	ambassador: 'bg-green-100 text-green-800',
	viewer: 'bg-gray-100 text-gray-800',
};

export default function TeamMemberDetailPage() {
	const router = useRouter();
	const params = useParams();
	const memberId = params.id as string;

	const [member, setMember] = useState<TeamMemberDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => { loadMember(); }, []);

	const loadMember = async () => {
		try {
			const token = getSessionToken('institution');
			if (!token) { router.push('/institution-login'); return; }
			// Fetch all team members and find the one we need
			const res = await fetch('/api/institution-team/', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to load team');
			const data = await res.json();
			const found = (data.data || []).find((m: TeamMemberDetail) => m.id === memberId);
			if (!found) throw new Error('Team member not found');
			setMember(found);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleRemove = async () => {
		if (!confirm('Are you sure you want to remove this team member? They will be moved to the recycle bin.')) return;
		setDeleting(true);
		try {
			const token = getSessionToken('institution');
			if (!token) throw new Error('Authentication required');
			const res = await fetch(`/api/institution-team/${memberId}/`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || data.message || 'Failed to remove member');
			}
			router.push('/institution-dashboard/team');
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setDeleting(false);
		}
	};

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>
			</DashboardSidebar>
		);
	}

	if (error || !member) {
		return (
			<DashboardSidebar>
				<div className="p-8"><Card className="p-8 text-center"><p className="text-red-600 mb-4">{error || 'Member not found'}</p><Button onClick={() => router.push('/institution-dashboard/team')}>Back to Team</Button></Card></div>
			</DashboardSidebar>
		);
	}

	return (
		<DashboardSidebar>
			<div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<button onClick={() => router.push('/institution-dashboard/team')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						Back to Team
					</button>
					{member.role !== 'admin' && (
						<Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleRemove} disabled={deleting}>
							{deleting ? 'Removing...' : 'Remove Member'}
						</Button>
					)}
				</div>

				<Card className="p-8">
					<div className="flex items-start gap-6 mb-6">
						<div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 shrink-0">
							{member.userName?.[0]?.toUpperCase() || '?'}
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-gray-900">{member.userName || 'Unknown'}</h1>
							{member.userEmail && <p className="text-sm text-gray-400 mt-1">{member.userEmail}</p>}
							<div className="flex items-center gap-3 mt-3">
								<span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[member.role] || 'bg-gray-100 text-gray-800'}`}>
									{member.role}
								</span>
								<span className={`px-3 py-1 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
									{member.isActive ? 'Active' : 'Inactive'}
								</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
						<div>
							<p className="text-xs font-medium text-gray-500 mb-1">Joined</p>
							<p className="text-sm text-gray-900">{new Date(member.createdAt).toLocaleDateString()}</p>
						</div>
						<div>
							<p className="text-xs font-medium text-gray-500 mb-1">Admin Approved</p>
							<p className="text-sm text-gray-900">{member.adminApproved ? 'Yes' : 'No'}</p>
						</div>
						<div>
							<p className="text-xs font-medium text-gray-500 mb-1">Manager Approved</p>
							<p className="text-sm text-gray-900">{member.managerApproved ? 'Yes' : 'No'}</p>
						</div>
					</div>
				</Card>
			</div>
		</DashboardSidebar>
	);
}

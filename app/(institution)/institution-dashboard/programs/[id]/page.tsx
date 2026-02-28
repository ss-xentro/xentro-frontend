'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface ProgramDetail {
	id: string;
	name: string;
	type: string;
	description: string | null;
	duration: string | null;
	isActive: boolean;
	startDate: string | null;
	endDate: string | null;
	createdAt: string;
	updatedAt: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
	accelerator: { label: 'Accelerator', color: 'bg-purple-100 text-purple-800' },
	incubator: { label: 'Incubator', color: 'bg-blue-100 text-blue-800' },
	incubation: { label: 'Incubation', color: 'bg-blue-100 text-blue-800' },
	acceleration: { label: 'Acceleration', color: 'bg-purple-100 text-purple-800' },
	bootcamp: { label: 'Bootcamp', color: 'bg-orange-100 text-orange-800' },
	fellowship: { label: 'Fellowship', color: 'bg-green-100 text-green-800' },
	workshop: { label: 'Workshop', color: 'bg-yellow-100 text-yellow-800' },
	mentorship: { label: 'Mentorship', color: 'bg-pink-100 text-pink-800' },
	competition: { label: 'Competition', color: 'bg-indigo-100 text-indigo-800' },
	other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

export default function ProgramDetailPage() {
	const router = useRouter();
	const params = useParams();
	const programId = params.id as string;

	const [program, setProgram] = useState<ProgramDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => { loadProgram(); }, []);

	const loadProgram = async () => {
		try {
			const token = getSessionToken('institution');
			if (!token) { router.push('/institution-login'); return; }
			const res = await fetch(`/api/programs/${programId}/`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to load program');
			const data = await res.json();
			setProgram(data);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this program? It will be moved to the recycle bin.')) return;
		setDeleting(true);
		try {
			const token = getSessionToken('institution');
			if (!token) throw new Error('Authentication required');
			const res = await fetch(`/api/programs/${programId}/`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'Failed to delete program');
			}
			router.push('/institution-dashboard/programs');
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

	if (error || !program) {
		return (
			<DashboardSidebar>
				<div className="p-8"><Card className="p-8 text-center"><p className="text-red-600 mb-4">{error || 'Program not found'}</p><Button onClick={() => router.push('/institution-dashboard/programs')}>Back to Programs</Button></Card></div>
			</DashboardSidebar>
		);
	}

	const typeInfo = typeLabels[program.type] || typeLabels.other;

	return (
		<DashboardSidebar>
			<div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<button onClick={() => router.push('/institution-dashboard/programs')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						Back to Programs
					</button>
					<div className="flex items-center gap-2">
						<Button onClick={() => router.push(`/institution-dashboard/programs/${programId}/edit`)}>Edit Program</Button>
						<Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
							{deleting ? 'Deleting...' : 'Delete'}
						</Button>
					</div>
				</div>

				<Card className="p-8">
					<div className="flex items-center gap-3 mb-4">
						<h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
						<span className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
						{!program.isActive && <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">Inactive</span>}
					</div>

					{program.description && (
						<p className="text-gray-600 mb-6 whitespace-pre-wrap">{program.description}</p>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
						{program.duration && (
							<div>
								<p className="text-xs font-medium text-gray-500 mb-1">Duration</p>
								<p className="text-sm text-gray-900">{program.duration}</p>
							</div>
						)}
						{program.startDate && (
							<div>
								<p className="text-xs font-medium text-gray-500 mb-1">Start Date</p>
								<p className="text-sm text-gray-900">{new Date(program.startDate).toLocaleDateString()}</p>
							</div>
						)}
						{program.endDate && (
							<div>
								<p className="text-xs font-medium text-gray-500 mb-1">End Date</p>
								<p className="text-sm text-gray-900">{new Date(program.endDate).toLocaleDateString()}</p>
							</div>
						)}
						<div>
							<p className="text-xs font-medium text-gray-500 mb-1">Status</p>
							<p className="text-sm text-gray-900">{program.isActive ? 'Active' : 'Inactive'}</p>
						</div>
						{program.createdAt && (
							<div>
								<p className="text-xs font-medium text-gray-500 mb-1">Created</p>
								<p className="text-sm text-gray-900">{new Date(program.createdAt).toLocaleDateString()}</p>
							</div>
						)}
					</div>
				</Card>
			</div>
		</DashboardSidebar>
	);
}

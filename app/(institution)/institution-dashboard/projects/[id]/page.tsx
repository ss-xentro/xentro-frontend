'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface ProjectDetail {
	id: string;
	name: string;
	status: string;
	description: string | null;
	startDate: string | null;
	endDate: string | null;
	createdAt: string;
	updatedAt: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
	planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
	active: { label: 'Active', color: 'bg-green-100 text-green-800' },
	completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
	'on-hold': { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
};

export default function ProjectDetailPage() {
	const router = useRouter();
	const params = useParams();
	const projectId = params.id as string;

	const [project, setProject] = useState<ProjectDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => { loadProject(); }, []);

	const loadProject = async () => {
		try {
			const token = getSessionToken('institution');
			if (!token) { router.push('/institution-login'); return; }
			const res = await fetch(`/api/projects/${projectId}/`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to load project');
			const data = await res.json();
			setProject(data);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this project? It will be moved to the recycle bin.')) return;
		setDeleting(true);
		try {
			const token = getSessionToken('institution');
			if (!token) throw new Error('Authentication required');
			const res = await fetch(`/api/projects/${projectId}/`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'Failed to delete project');
			}
			router.push('/institution-dashboard/projects');
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

	if (error || !project) {
		return (
			<DashboardSidebar>
				<div className="p-8"><Card className="p-8 text-center"><p className="text-red-600 mb-4">{error || 'Project not found'}</p><Button onClick={() => router.push('/institution-dashboard/projects')}>Back to Projects</Button></Card></div>
			</DashboardSidebar>
		);
	}

	const statusInfo = statusLabels[project.status] || statusLabels.planning;

	return (
		<DashboardSidebar>
			<div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<button onClick={() => router.push('/institution-dashboard/projects')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						Back to Projects
					</button>
					<div className="flex items-center gap-2">
						<Button onClick={() => router.push(`/institution-dashboard/projects/${projectId}/edit`)}>Edit Project</Button>
						<Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
							{deleting ? 'Deleting...' : 'Delete'}
						</Button>
					</div>
				</div>

				<Card className="p-8">
					<div className="flex items-center gap-3 mb-4">
						<h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
						<span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
					</div>

					{project.description && (
						<p className="text-gray-600 mb-6 whitespace-pre-wrap">{project.description}</p>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
						{project.startDate && (
							<div>
								<p className="text-xs font-medium text-gray-500 mb-1">Start Date</p>
								<p className="text-sm text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
							</div>
						)}
						{project.endDate && (
							<div>
								<p className="text-xs font-medium text-gray-500 mb-1">End Date</p>
								<p className="text-sm text-gray-900">{new Date(project.endDate).toLocaleDateString()}</p>
							</div>
						)}
						{project.createdAt && (
							<div>
								<p className="text-xs font-medium text-gray-500 mb-1">Created</p>
								<p className="text-sm text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</p>
							</div>
						)}
					</div>
				</Card>
			</div>
		</DashboardSidebar>
	);
}

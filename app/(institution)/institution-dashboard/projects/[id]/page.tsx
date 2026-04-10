'use client';

import { useRouter, useParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

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
	planning: { label: 'Planning', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-200' },
	active: { label: 'Active', color: 'bg-green-500/20 text-green-600 dark:text-green-200' },
	completed: { label: 'Completed', color: 'bg-(--accent-light) text-(--primary)' },
	'on-hold': { label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-200' },
};

export default function ProjectDetailPage() {
	const router = useRouter();
	const params = useParams();
	const projectId = params.id as string;

	const { data: project, isLoading: loading, error: queryError } = useApiQuery<ProjectDetail>(queryKeys.institution.projectDetail(projectId), `/api/projects/${projectId}/`, { requestOptions: { role: 'institution' } });
	const error = queryError?.message ?? null;

	const deleteMutation = useApiMutation<unknown, void>({
		method: 'delete',
		path: `/api/projects/${projectId}/`,
		invalidateKeys: [queryKeys.institution.projects()],
		requestOptions: { role: 'institution' },
		mutationOptions: { onSuccess: () => router.push('/institution-dashboard/projects') },
	});
	const deleting = deleteMutation.isPending;

	const handleDelete = () => {
		if (!confirm('Are you sure you want to delete this project? It will be moved to the recycle bin.')) return;
		deleteMutation.mutate(undefined as never);
	};

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-(--accent-light) rounded w-1/4" /><div className="h-64 bg-(--accent-light) rounded" /></div></div>
			</DashboardSidebar>
		);
	}

	if (error || !project) {
		return (
			<DashboardSidebar>
				<div className="p-8"><Card className="p-8 text-center"><p className="text-red-400 mb-4">{error || 'Project not found'}</p><Button onClick={() => router.push('/institution-dashboard/projects')}>Back to Projects</Button></Card></div>
			</DashboardSidebar>
		);
	}

	const statusInfo = statusLabels[project.status] || statusLabels.planning;

	return (
		<DashboardSidebar>
			<div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<button onClick={() => router.push('/institution-dashboard/projects')} className="text-sm text-(--secondary) hover:text-(--primary) flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						Back to Projects
					</button>
					<div className="flex items-center gap-2">
						<Button onClick={() => router.push(`/institution-dashboard/projects/${projectId}/edit`)}>Edit Project</Button>
						<Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleDelete} disabled={deleting}>
							{deleting ? 'Deleting...' : 'Delete'}
						</Button>
					</div>
				</div>

				<Card className="p-8 bg-(--accent-subtle) border border-(--border)">
					<div className="flex items-center gap-3 mb-4">
						<h1 className="text-2xl font-bold text-(--primary)">{project.name}</h1>
						<span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
					</div>

					{project.description && (
						<p className="text-(--primary-light) mb-6 whitespace-pre-wrap">{project.description}</p>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-(--border) pt-6">
						{project.startDate && (
							<div>
								<p className="text-xs font-medium text-(--secondary) mb-1">Start Date</p>
								<p className="text-sm text-(--primary)">{new Date(project.startDate).toLocaleDateString()}</p>
							</div>
						)}
						{project.endDate && (
							<div>
								<p className="text-xs font-medium text-(--secondary) mb-1">End Date</p>
								<p className="text-sm text-(--primary)">{new Date(project.endDate).toLocaleDateString()}</p>
							</div>
						)}
						{project.createdAt && (
							<div>
								<p className="text-xs font-medium text-(--secondary) mb-1">Created</p>
								<p className="text-sm text-(--primary)">{new Date(project.createdAt).toLocaleDateString()}</p>
							</div>
						)}
					</div>
				</Card>
			</div>
		</DashboardSidebar>
	);
}

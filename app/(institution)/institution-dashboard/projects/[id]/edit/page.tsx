'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { toast } from 'sonner';

const statusOptions = [
	{ value: 'planning', label: 'Planning' },
	{ value: 'active', label: 'Active' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'on-hold', label: 'On Hold' },
];

export default function EditProjectPage() {
	const router = useRouter();
	const params = useParams();
	const projectId = params.id as string;

	// --- TanStack Query: load project ---
	const { data: projectRaw, isLoading: loading } = useApiQuery<Record<string, unknown>>(
		queryKeys.institution.projectDetail(projectId),
		`/api/projects/${projectId}/`,
		{ requestOptions: { role: 'institution' } },
	);

	const [formData, setFormData] = useState({
		name: '',
		status: 'planning',
		description: '',
		start_date: '',
		end_date: '',
	});
	const [formSeeded, setFormSeeded] = useState(false);

	useEffect(() => {
		if (!projectRaw || formSeeded) return;
		const data = projectRaw;
		setFormData({
			name: (data.name as string) || '',
			status: (data.status as string) || 'planning',
			description: (data.description as string) || '',
			start_date: data.startDate ? (data.startDate as string).split('T')[0] : '',
			end_date: data.endDate ? (data.endDate as string).split('T')[0] : '',
		});
		setFormSeeded(true);
	}, [projectRaw, formSeeded]);

	// --- TanStack Mutation: save project ---
	const saveMutation = useApiMutation<unknown, typeof formData>({
		method: 'put',
		path: `/api/projects/${projectId}/`,
		invalidateKeys: [queryKeys.institution.projects(), queryKeys.institution.projectDetail(projectId)],
		requestOptions: { role: 'institution' },
		mutationOptions: {
			onSuccess: () => router.push(`/institution-dashboard/projects/${projectId}`),
			onError: (err) => toast.error(err.message),
		},
	});
	const saving = saveMutation.isPending;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		saveMutation.mutate(formData);
	};

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="max-w-2xl mx-auto px-6 py-12">
					<div className="animate-pulse space-y-4"><div className="h-8 bg-(--accent-light) rounded w-1/4" /><div className="h-64 bg-(--accent-light) rounded" /></div>
				</div>
			</DashboardSidebar>
		);
	}

	return (
		<DashboardSidebar>
			<div className="max-w-2xl mx-auto px-6 py-12">
				<div className="mb-12">
					<h1 className="text-2xl font-semibold text-(--primary) mb-2">Edit Project</h1>
					<p className="text-sm text-(--primary-light)">Update project details</p>
				</div>

				<Card className="p-10 bg-(--accent-subtle) border border-(--border) shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-12">
						<div className="space-y-6">
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Project Name *</label>
								<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors" placeholder="e.g., AI Research Hub" required />
							</div>
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Status</label>
								<Select value={formData.status} onChange={(value) => setFormData({ ...formData, status: value })} options={statusOptions} placeholder="Select status" />
							</div>
						</div>

						<div className="space-y-3">
							<label className="block text-xs font-medium text-(--secondary)">Description</label>
							<textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full px-4 py-4 text-sm bg-(--accent-subtle) border border-(--border-hover) rounded-lg focus:border-(--border-focus) focus:bg-(--accent-light) focus:outline-none transition-all resize-none" placeholder="Describe the project" />
						</div>

						<div className="space-y-6 pt-6">
							<h3 className="text-base font-semibold text-(--primary) mb-6">Timeline</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-medium text-(--secondary) mb-2">Start Date</label>
									<input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors" />
								</div>
								<div>
									<label className="block text-xs font-medium text-(--secondary) mb-2">End Date</label>
									<input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors" />
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between pt-8">
							<button type="button" onClick={() => router.back()} disabled={saving} className="px-4 py-2 text-sm text-(--primary-light) hover:text-(--primary) transition-colors disabled:opacity-50">Cancel</button>
							<button type="submit" disabled={saving || !formData.name} className="px-6 py-3 text-sm font-medium bg-(--primary) text-(--background) rounded-lg hover:bg-(--primary-light) disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
								{saving ? 'Saving...' : <>Save Changes <span className="text-base">→</span></>}
							</button>
						</div>
					</form>
				</Card>
			</div>
		</DashboardSidebar>
	);
}

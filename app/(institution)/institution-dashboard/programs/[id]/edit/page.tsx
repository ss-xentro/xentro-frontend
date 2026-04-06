'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { toast } from 'sonner';

const programTypeOptions = [
	{ value: 'incubation', label: 'Incubation Program' },
	{ value: 'acceleration', label: 'Acceleration Program' },
	{ value: 'mentorship', label: 'Mentorship Program' },
	{ value: 'workshop', label: 'Workshop Series' },
	{ value: 'bootcamp', label: 'Bootcamp' },
	{ value: 'competition', label: 'Competition' },
	{ value: 'other', label: 'Other' },
];

export default function EditProgramPage() {
	const router = useRouter();
	const params = useParams();
	const programId = params.id as string;

	// --- TanStack Query: load program ---
	const { data: programRaw, isLoading: loading } = useApiQuery<Record<string, unknown>>(
		queryKeys.institution.programDetail(programId),
		`/api/programs/${programId}/`,
		{ requestOptions: { role: 'institution' } },
	);

	const [formData, setFormData] = useState({
		name: '',
		type: 'incubation',
		description: '',
		duration: '',
		start_date: '',
		end_date: '',
		is_active: true,
	});
	const [formSeeded, setFormSeeded] = useState(false);

	useEffect(() => {
		if (!programRaw || formSeeded) return;
		const data = programRaw;
		setFormData({
			name: (data.name as string) || '',
			type: (data.type as string) || 'incubation',
			description: (data.description as string) || '',
			duration: (data.duration as string) || '',
			start_date: data.startDate ? (data.startDate as string).split('T')[0] : '',
			end_date: data.endDate ? (data.endDate as string).split('T')[0] : '',
			is_active: (data.isActive as boolean) ?? true,
		});
		setFormSeeded(true);
	}, [programRaw, formSeeded]);

	// --- TanStack Mutation: save program ---
	const saveMutation = useApiMutation<unknown, typeof formData>({
		method: 'put',
		path: `/api/programs/${programId}/`,
		invalidateKeys: [queryKeys.institution.programs(), queryKeys.institution.programDetail(programId)],
		requestOptions: { role: 'institution' },
		mutationOptions: {
			onSuccess: () => router.push(`/institution-dashboard/programs/${programId}`),
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
					<h1 className="text-2xl font-semibold text-(--primary) mb-2">Edit Program</h1>
					<p className="text-sm text-(--primary-light)">Update program details</p>
				</div>

				<Card className="p-10 bg-(--accent-subtle) border border-(--border) shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-12">
						<div className="space-y-6">
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Program Name *</label>
								<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors" placeholder="e.g., Summer Incubation 2026" required />
							</div>
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Type</label>
								<Select value={formData.type} onChange={(value) => setFormData({ ...formData, type: value })} options={programTypeOptions} placeholder="Select type" />
							</div>
						</div>

						<div className="space-y-3">
							<label className="block text-xs font-medium text-(--secondary)">Description</label>
							<textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full px-4 py-4 text-sm bg-(--accent-subtle) border border-(--border-hover) rounded-lg focus:border-(--border-focus) focus:bg-(--accent-light) focus:outline-none transition-all resize-none" placeholder="Describe the program" />
						</div>

						<div className="space-y-6 pt-6">
							<h3 className="text-base font-semibold text-(--primary) mb-6">Timeline</h3>
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Duration</label>
								<input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-3 text-sm bg-(--accent-subtle) border border-(--border-hover) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none transition-colors" placeholder="e.g., 3 months" />
							</div>
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

						<div className="flex items-start gap-3 pt-6">
							<input type="checkbox" id="isActive" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="mt-1 w-4 h-4 text-(--primary) bg-(--accent-subtle) border-(--border-hover) rounded focus:ring-white/40 focus:ring-2" />
							<label htmlFor="isActive" className="text-sm text-(--primary)">Make this program active and visible</label>
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

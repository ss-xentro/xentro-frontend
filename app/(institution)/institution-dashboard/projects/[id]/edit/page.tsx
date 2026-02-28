'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';

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

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		status: 'planning',
		description: '',
		start_date: '',
		end_date: '',
	});

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
			setFormData({
				name: data.name || '',
				status: data.status || 'planning',
				description: data.description || '',
				start_date: data.startDate ? data.startDate.split('T')[0] : '',
				end_date: data.endDate ? data.endDate.split('T')[0] : '',
			});
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		try {
			const token = getSessionToken('institution');
			if (!token) throw new Error('Authentication required');
			const res = await fetch(`/api/projects/${projectId}/`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify(formData),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || data.message || 'Failed to update project');
			}
			router.push(`/institution-dashboard/projects/${projectId}`);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="max-w-2xl mx-auto px-6 py-12">
					<div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div>
				</div>
			</DashboardSidebar>
		);
	}

	return (
		<DashboardSidebar>
			<div className="max-w-2xl mx-auto px-6 py-12">
				<div className="mb-12">
					<h1 className="text-2xl font-semibold text-gray-900 mb-2">Edit Project</h1>
					<p className="text-sm text-gray-600">Update project details</p>
				</div>

				<Card className="p-10 bg-white border border-gray-200 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-12">
						<div className="space-y-6">
							<div>
								<label className="block text-xs font-medium text-gray-500 mb-2">Project Name *</label>
								<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors" placeholder="e.g., AI Research Hub" required />
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
								<Select value={formData.status} onChange={(value) => setFormData({ ...formData, status: value })} options={statusOptions} placeholder="Select status" />
							</div>
						</div>

						<div className="space-y-3">
							<label className="block text-xs font-medium text-gray-500">Description</label>
							<textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full px-4 py-4 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-900 focus:bg-white focus:outline-none transition-all resize-none" placeholder="Describe the project" />
						</div>

						<div className="space-y-6 pt-6">
							<h3 className="text-base font-semibold text-gray-900 mb-6">Timeline</h3>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-medium text-gray-500 mb-2">Start Date</label>
									<input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors" />
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-500 mb-2">End Date</label>
									<input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors" />
								</div>
							</div>
						</div>

						{error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">{error}</div>}

						<div className="flex items-center justify-between pt-8">
							<button type="button" onClick={() => router.back()} disabled={saving} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50">Cancel</button>
							<button type="submit" disabled={saving || !formData.name} className="px-6 py-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
								{saving ? 'Saving...' : <>Save Changes <span className="text-base">→</span></>}
							</button>
						</div>
					</form>
				</Card>
			</div>
		</DashboardSidebar>
	);
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button, Select } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';
import { readApiErrorMessage } from '@/lib/error-utils';

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

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		type: 'incubation',
		description: '',
		duration: '',
		start_date: '',
		end_date: '',
		is_active: true,
	});

	useEffect(() => { loadProgram(); }, []);

	const loadProgram = async () => {
		try {
			const token = getSessionToken('institution');
			if (!token) { router.push('/institution-login'); return; }
			const res = await fetch(`/api/programs/${programId}/`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(await readApiErrorMessage(res, 'Failed to load program'));
			const data = await res.json();
			setFormData({
				name: data.name || '',
				type: data.type || 'incubation',
				description: data.description || '',
				duration: data.duration || '',
				start_date: data.startDate ? data.startDate.split('T')[0] : '',
				end_date: data.endDate ? data.endDate.split('T')[0] : '',
				is_active: data.isActive ?? true,
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
			const res = await fetch(`/api/programs/${programId}/`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify(formData),
			});
			if (!res.ok) {
				throw new Error(await readApiErrorMessage(res, 'Failed to update program'));
			}
			router.push(`/institution-dashboard/programs/${programId}`);
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
					<div className="animate-pulse space-y-4"><div className="h-8 bg-white/10 rounded w-1/4" /><div className="h-64 bg-white/10 rounded" /></div>
				</div>
			</DashboardSidebar>
		);
	}

	return (
		<DashboardSidebar>
			<div className="max-w-2xl mx-auto px-6 py-12">
				<div className="mb-12">
					<h1 className="text-2xl font-semibold text-white mb-2">Edit Program</h1>
					<p className="text-sm text-gray-300">Update program details</p>
				</div>

				<Card className="p-10 bg-white/5 border border-white/10 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-12">
						<div className="space-y-6">
							<div>
								<label className="block text-xs font-medium text-gray-400 mb-2">Program Name *</label>
								<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 text-sm bg-white/5 border border-white/20 text-white rounded-lg focus:border-white/40 focus:outline-none transition-colors" placeholder="e.g., Summer Incubation 2026" required />
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-400 mb-2">Type</label>
								<Select value={formData.type} onChange={(value) => setFormData({ ...formData, type: value })} options={programTypeOptions} placeholder="Select type" />
							</div>
						</div>

						<div className="space-y-3">
							<label className="block text-xs font-medium text-gray-400">Description</label>
							<textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full px-4 py-4 text-sm bg-white/5 border border-white/20 rounded-lg focus:border-white/40 focus:bg-white/10 focus:outline-none transition-all resize-none" placeholder="Describe the program" />
						</div>

						<div className="space-y-6 pt-6">
							<h3 className="text-base font-semibold text-white mb-6">Timeline</h3>
							<div>
								<label className="block text-xs font-medium text-gray-400 mb-2">Duration</label>
								<input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-3 text-sm bg-white/5 border border-white/20 text-white rounded-lg focus:border-white/40 focus:outline-none transition-colors" placeholder="e.g., 3 months" />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-medium text-gray-400 mb-2">Start Date</label>
									<input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-3 text-sm bg-white/5 border border-white/20 text-white rounded-lg focus:border-white/40 focus:outline-none transition-colors" />
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-400 mb-2">End Date</label>
									<input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-3 text-sm bg-white/5 border border-white/20 text-white rounded-lg focus:border-white/40 focus:outline-none transition-colors" />
								</div>
							</div>
						</div>

						<div className="flex items-start gap-3 pt-6">
							<input type="checkbox" id="isActive" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="mt-1 w-4 h-4 text-white bg-white/5 border-white/20 rounded focus:ring-white/40 focus:ring-2" />
							<label htmlFor="isActive" className="text-sm text-white">Make this program active and visible</label>
						</div>

						{error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300">{error}</div>}

						<div className="flex items-center justify-between pt-8">
							<button type="button" onClick={() => router.back()} disabled={saving} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
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

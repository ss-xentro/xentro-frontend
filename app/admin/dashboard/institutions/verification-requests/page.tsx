"use client";

import { useMemo, useState } from 'react';
import { Button, Card, Textarea, Modal } from '@/components/ui';
import { InstitutionApplication } from '@/lib/types';
import { toast } from 'sonner';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

interface InstitutionLookup {
	id: string;
	email?: string | null;
}

export default function InstitutionVerificationRequestsPage() {
	const queryClient = useQueryClient();
	const [selected, setSelected] = useState<InstitutionApplication | null>(null);
	const [remark, setRemark] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const { data: appRaw, isLoading: loading } = useApiQuery<{ data: InstitutionApplication[] }>(
		queryKeys.admin.verificationRequests(),
		'/api/institution-applications',
		{ requestOptions: { role: 'admin' } },
	);
	const applications = appRaw?.data ?? [];

	const { data: instRaw } = useApiQuery<{ data: InstitutionLookup[] }>(
		queryKeys.admin.institutions(),
		'/api/institutions?scope=all',
		{ requestOptions: { public: true } },
	);
	const institutionIdByEmail = useMemo(() => {
		const institutions = instRaw?.data ?? [];
		return institutions.reduce<Record<string, string>>((acc, inst) => {
			const key = (inst.email ?? '').trim().toLowerCase();
			if (key) acc[key] = inst.id;
			return acc;
		}, {});
	}, [instRaw]);

	const pendingRequests = useMemo(() => {
		return applications
			.filter((app) => app.status === 'pending' && !!app.description)
			.sort((a, b) => {
				const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
				const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
				return bTime - aTime;
			});
	}, [applications]);

	const handleDecision = async (action: 'approved' | 'rejected') => {
		if (!selected) return;

		try {
			setSubmitting(true);
			await api.patch(`/api/institution-applications/${selected.id}/`, {
				role: 'admin',
				json: { action, remark: remark.trim() },
			});

			setSelected(null);
			setRemark('');
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.verificationRequests() });
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	};

	const getPublicInstitutionId = (app: InstitutionApplication): string | null => {
		if (app.institutionId) return app.institutionId;
		const key = (app.email ?? '').trim().toLowerCase();
		return key ? (institutionIdByEmail[key] ?? null) : null;
	};

	return (
		<div className="space-y-6 animate-fadeIn">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-(--primary)">Institution Verification Requests</h1>
					<p className="text-(--secondary)">Approve requests to grant the blue tick. Message is optional.</p>
				</div>
				<Button variant="ghost" onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.admin.verificationRequests() })} disabled={loading}>
					{loading ? 'Refreshing...' : 'Refresh'}
				</Button>
			</div>

			{loading && <p className="text-(--secondary)">Loading requests...</p>}

			{!loading && pendingRequests.length === 0 && (
				<Card className="p-8 text-center">
					<h3 className="text-lg font-semibold text-(--primary)">No pending requests</h3>
					<p className="text-(--secondary) mt-2">All institution verification requests are processed.</p>
				</Card>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{pendingRequests.map((app) => (
					(() => {
						const publicInstitutionId = getPublicInstitutionId(app);
						return (
							<Card key={app.id} className="p-5 space-y-4">
								<div className="flex items-start justify-between gap-3">
									<div>
										<h3 className="text-lg font-semibold text-(--primary)">{app.name}</h3>
										<p className="text-sm text-(--secondary)">{app.email}</p>
										{app.city && (
											<p className="text-sm text-(--secondary) mt-1">
												{app.city}{app.country ? `, ${app.country}` : ''}
											</p>
										)}
									</div>
									<span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200">
										Pending
									</span>
								</div>

								{app.description && (
									<p className="text-sm text-(--secondary) line-clamp-4">{app.description}</p>
								)}

								{app.remark && (
									<div className="rounded-lg border border-(--border) bg-(--surface-hover) p-3">
										<p className="text-xs font-semibold text-(--secondary) uppercase tracking-wide">Request Message</p>
										<p className="text-sm text-(--primary) mt-1">{app.remark}</p>
									</div>
								)}

								<div className="flex gap-2 pt-2">
									<Button onClick={() => {
										setSelected(app);
										setRemark('');
									}} className="flex-1">
										Approve
									</Button>
									{publicInstitutionId ? (
										<a
											href={`/institutions/${publicInstitutionId}`}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Button variant="ghost">Review</Button>
										</a>
									) : (
										<Button variant="ghost" disabled title="Public profile will be available once institution link is created">
											Review
										</Button>
									)}
								</div>
							</Card>
						);
					})()
				))}
			</div>

			{selected && (
				<Modal
					isOpen={!!selected}
					onClose={() => !submitting && setSelected(null)}
					title={`Review Request: ${selected.name}`}
				>
					<p className="text-sm text-(--secondary) -mt-2 mb-4">
						Approve to grant the verified blue tick. Message is optional.
					</p>

					<Textarea
						label="Message to institution (optional)"
						placeholder="Optional note about your decision"
						value={remark}
						onChange={(e) => setRemark(e.target.value)}
						rows={5}
					/>

					<div className="flex items-center justify-end gap-3 pt-1">
						<Button variant="ghost" onClick={() => setSelected(null)} disabled={submitting}>
							Cancel
						</Button>
						<Button
							variant="ghost"
							onClick={() => handleDecision('rejected')}
							disabled={submitting}
						>
							{submitting ? 'Saving...' : 'Reject'}
						</Button>
						<Button onClick={() => handleDecision('approved')} disabled={submitting}>
							{submitting ? 'Saving...' : 'Approve'}
						</Button>
					</div>
				</Modal>
			)}
		</div>
	);
}

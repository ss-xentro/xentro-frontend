"use client";

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Textarea } from '@/components/ui';
import { InstitutionApplication } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-utils';

interface InstitutionLookup {
	id: string;
	email?: string | null;
}

function getAuthToken(token: string | null): string | null {
	if (token && token !== 'httponly') return token;
	return getSessionToken('admin');
}

export default function InstitutionVerificationRequestsPage() {
	const { token } = useAuth();
	const [applications, setApplications] = useState<InstitutionApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<InstitutionApplication | null>(null);
	const [remark, setRemark] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [institutionIdByEmail, setInstitutionIdByEmail] = useState<Record<string, string>>({});

	const authToken = getAuthToken(token);

	const loadRequests = async () => {
		try {
			setLoading(true);
			const [res, institutionsRes] = await Promise.all([
				fetch('/api/institution-applications', {
					headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
				}),
				fetch('/api/institutions?scope=all', {
					headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
				}),
			]);

			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(payload.message || 'Failed to load verification requests');
			}

			if (institutionsRes.ok) {
				const institutionsPayload = await institutionsRes.json().catch(() => ({ data: [] }));
				const institutions = (institutionsPayload.data ?? []) as InstitutionLookup[];
				const lookup = institutions.reduce<Record<string, string>>((acc, inst) => {
					const key = (inst.email ?? '').trim().toLowerCase();
					if (key) acc[key] = inst.id;
					return acc;
				}, {});
				setInstitutionIdByEmail(lookup);
			}

			setApplications(payload.data ?? []);
			setError(null);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadRequests();
	}, []);

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
			const res = await fetch(`/api/institution-applications/${selected.id}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
				},
				body: JSON.stringify({ action, remark: remark.trim() }),
			});

			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(payload.message || `Failed to ${action === 'approved' ? 'approve' : 'reject'} request`);
			}

			setSelected(null);
			setRemark('');
			await loadRequests();
		} catch (err) {
			setError((err as Error).message);
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
				<Button variant="ghost" onClick={loadRequests} disabled={loading}>
					{loading ? 'Refreshing...' : 'Refresh'}
				</Button>
			</div>

			{error && (
				<Card className="p-4 border border-red-200 bg-red-50 text-red-800">
					{error}
				</Card>
			)}

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
									<span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
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
				<div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
					<div
						className="absolute inset-0 bg-black/45 backdrop-blur-sm"
						onClick={() => !submitting && setSelected(null)}
					/>
					<Card className="relative w-full max-w-lg p-6 space-y-4">
						<div>
							<h2 className="text-xl font-bold text-(--primary)">Review Request: {selected.name}</h2>
							<p className="text-sm text-(--secondary) mt-1">
								Approve to grant the verified blue tick. Message is optional.
							</p>
						</div>

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
					</Card>
				</div>
			)}
		</div>
	);
}

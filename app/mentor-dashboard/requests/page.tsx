'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { getSessionToken } from '@/lib/auth-utils';

interface ConnectionRequest {
	id: string;
	mentor: string;
	requester: string;
	requester_name: string;
	requester_email: string;
	requester_avatar: string | null;
	requester_account_type: string;
	message: string;
	status: string;
	created_at: string;
	responded_at: string | null;
}

export default function MentorRequestsPage() {
	const [requests, setRequests] = useState<ConnectionRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

	useEffect(() => {
		loadRequests();
	}, []);

	async function loadRequests() {
		const token = getSessionToken('mentor');
		if (!token) return;

		try {
			setLoading(true);
			const res = await fetch('/api/mentor-connections/', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) return;
			const json = await res.json();
			setRequests(json.data ?? []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function handleRespond(requestId: string, status: 'accepted' | 'rejected') {
		const token = getSessionToken('mentor');
		if (!token) return;

		setActionLoading(requestId);
		try {
			const res = await fetch(`/api/mentor-connections/${requestId}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ status }),
			});

			if (res.ok) {
				setRequests((prev) =>
					prev.map((r) =>
						r.id === requestId ? { ...r, status, responded_at: new Date().toISOString() } : r
					)
				);
			} else {
				const data = await res.json();
				alert(data.error || 'Failed to respond');
			}
		} catch (err) {
			console.error(err);
			alert('Failed to respond to request');
		} finally {
			setActionLoading(null);
		}
	}

	const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);
	const pendingCount = requests.filter((r) => r.status === 'pending').length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-(--primary)">Connection Requests</h1>
					<p className="text-sm text-(--secondary) mt-1">
						{pendingCount > 0
							? `You have ${pendingCount} pending request${pendingCount > 1 ? 's' : ''}`
							: 'Manage connection requests from startups & mentees'}
					</p>
				</div>

				{/* Filter */}
				<div className="flex gap-2">
					{(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === f
									? 'bg-accent/10 text-accent border border-accent/30'
									: 'bg-(--surface) text-(--secondary) border border-(--border) hover:bg-(--surface-hover)'
								}`}
						>
							{f.charAt(0).toUpperCase() + f.slice(1)}
							{f === 'pending' && pendingCount > 0 && (
								<span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-accent text-white rounded-full">
									{pendingCount}
								</span>
							)}
						</button>
					))}
				</div>
			</div>

			{/* Loading */}
			{loading ? (
				<div className="flex items-center justify-center h-40">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
				</div>
			) : filtered.length === 0 ? (
				<Card className="p-8 text-center bg-(--surface)">
					<div className="text-4xl mb-3">🤝</div>
					<h3 className="text-lg font-semibold text-(--primary)">
						{filter === 'all' ? 'No connection requests yet' : `No ${filter} requests`}
					</h3>
					<p className="text-sm text-(--secondary) mt-1">
						{filter === 'all'
							? 'When startups want to connect, their requests will appear here.'
							: `You don't have any ${filter} connection requests.`}
					</p>
				</Card>
			) : (
				<div className="space-y-3">
					{filtered.map((req) => (
						<Card key={req.id} className="p-5 bg-(--surface)">
							<div className="flex flex-col sm:flex-row items-start gap-4">
								{/* Avatar */}
								<div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold shrink-0 overflow-hidden">
									{req.requester_avatar ? (
										<img
											src={req.requester_avatar}
											alt={req.requester_name}
											className="w-full h-full object-cover"
										/>
									) : (
										req.requester_name?.charAt(0).toUpperCase() || '?'
									)}
								</div>

								{/* Content */}
								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-3">
										<div>
											<h3 className="text-sm font-semibold text-(--primary)">
												{req.requester_name || 'Unknown'}
											</h3>
											<p className="text-xs text-(--secondary)">
												{req.requester_email}
												{req.requester_account_type && (
													<span className="ml-2 px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-medium">
														{req.requester_account_type}
													</span>
												)}
											</p>
										</div>
										<span className="text-xs text-(--secondary) whitespace-nowrap">
											{new Date(req.created_at).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})}
										</span>
									</div>

									{/* Message */}
									{req.message && (
										<div className="mt-3 p-3 bg-(--background) rounded-lg border border-(--border)">
											<p className="text-sm text-(--primary) leading-relaxed whitespace-pre-wrap">
												{req.message}
											</p>
										</div>
									)}

									{/* Status / Actions */}
									<div className="mt-4 flex items-center gap-3">
										{req.status === 'pending' ? (
											<>
												<button
													onClick={() => handleRespond(req.id, 'accepted')}
													disabled={actionLoading === req.id}
													className="px-4 py-2 text-xs font-medium rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
												>
													{actionLoading === req.id ? 'Processing...' : 'Accept'}
												</button>
												<button
													onClick={() => handleRespond(req.id, 'rejected')}
													disabled={actionLoading === req.id}
													className="px-4 py-2 text-xs font-medium rounded-lg border border-(--border) text-(--secondary) hover:bg-(--surface-hover) hover:text-error transition-colors disabled:opacity-50"
												>
													Decline
												</button>
											</>
										) : (
											<span
												className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${req.status === 'accepted'
														? 'bg-green-500/10 text-green-400 border border-green-500/20'
														: 'bg-red-500/10 text-red-400 border border-red-500/20'
													}`}
											>
												{req.status === 'accepted' ? (
													<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
													</svg>
												) : (
													<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
													</svg>
												)}
												{req.status === 'accepted' ? 'Accepted' : 'Declined'}
												{req.responded_at && (
													<span className="text-(--secondary) ml-1">
														· {new Date(req.responded_at).toLocaleDateString()}
													</span>
												)}
											</span>
										)}
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

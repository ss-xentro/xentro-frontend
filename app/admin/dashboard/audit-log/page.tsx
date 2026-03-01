'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface AuditEntry {
	id: string;
	userId: string | null;
	userName: string | null;
	userEmail: string | null;
	context: string | null;
	action: string;
	entityType: string | null;
	entityId: string | null;
	details: Record<string, unknown> | null;
	ipAddress: string | null;
	createdAt: string | null;
}

const ACTION_COLORS: Record<string, string> = {
	create: 'bg-green-100 text-green-700',
	update: 'bg-blue-100 text-blue-700',
	delete: 'bg-red-100 text-red-700',
	approve: 'bg-emerald-100 text-emerald-700',
	reject: 'bg-orange-100 text-orange-700',
	login: 'bg-purple-100 text-purple-700',
};

function getActionColor(action: string): string {
	const key = Object.keys(ACTION_COLORS).find((k) => action.toLowerCase().includes(k));
	return key ? ACTION_COLORS[key] : 'bg-gray-100 text-gray-700';
}

export default function AdminAuditLogPage() {
	const [entries, setEntries] = useState<AuditEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [entityType, setEntityType] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);

	const fetchLogs = useCallback(async () => {
		setLoading(true);
		const token = getSessionToken('admin');
		const params = new URLSearchParams({ page: String(page), per_page: '50' });
		if (search) params.set('search', search);
		if (entityType) params.set('entity_type', entityType);

		try {
			const res = await fetch(`/api/admin/audit-log/?${params}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to load audit log');
			const json = await res.json();
			setEntries(json.data || []);
			setTotal(json.total || 0);
			setTotalPages(json.totalPages || 1);
		} catch {
			setEntries([]);
		} finally {
			setLoading(false);
		}
	}, [page, search, entityType]);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	const formatTime = (iso: string | null) => {
		if (!iso) return '—';
		const d = new Date(iso);
		return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-gray-900">Audit Log</h2>
				<p className="text-sm text-gray-500 mt-1">{total} log entries</p>
			</div>

			{/* Filters */}
			<Card className="p-4">
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="flex-1">
						<input
							type="text"
							placeholder="Search by action, user name, or email..."
							value={search}
							onChange={(e) => { setSearch(e.target.value); setPage(1); }}
							className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
						/>
					</div>
					<select
						value={entityType}
						onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
						className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white"
					>
						<option value="">All Entity Types</option>
						<option value="startup">Startup</option>
						<option value="institution">Institution</option>
						<option value="mentor">Mentor</option>
						<option value="investor">Investor</option>
						<option value="form">Form</option>
						<option value="user">User</option>
						<option value="event">Event</option>
					</select>
				</div>
			</Card>

			{/* Log Timeline */}
			<Card className="divide-y divide-gray-100">
				{loading && (
					<div className="p-6 space-y-4">
						{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
							<div key={i} className="h-12 bg-gray-50 rounded animate-pulse" />
						))}
					</div>
				)}

				{!loading && entries.length === 0 && (
					<div className="p-8 text-center text-gray-500">
						No audit log entries found.
					</div>
				)}

				{!loading && entries.map((entry) => (
					<div key={entry.id} className="px-4 py-3 hover:bg-gray-50/50 flex items-start gap-4">
						{/* Timestamp */}
						<div className="flex-shrink-0 w-32 text-xs text-gray-400 pt-0.5">
							{formatTime(entry.createdAt)}
						</div>

						{/* Action Badge */}
						<div className="flex-shrink-0">
							<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
								{entry.action}
							</span>
						</div>

						{/* Details */}
						<div className="flex-1 min-w-0">
							<p className="text-sm text-gray-900">
								{entry.userName && (
									<span className="font-medium">{entry.userName}</span>
								)}
								{entry.userName && ' '}
								{entry.entityType && (
									<span className="text-gray-500">
										on <span className="font-medium">{entry.entityType}</span>
										{entry.entityId && (
											<span className="text-gray-400 ml-1 font-mono text-xs">
												{entry.entityId.slice(0, 8)}...
											</span>
										)}
									</span>
								)}
							</p>
							{entry.context && (
								<p className="text-xs text-gray-400 mt-0.5">
									Context: {entry.context}
									{entry.ipAddress && ` · IP: ${entry.ipAddress}`}
								</p>
							)}
							{entry.details && Object.keys(entry.details).length > 0 && (
								<details className="mt-1">
									<summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
										Details
									</summary>
									<pre className="mt-1 text-xs bg-gray-50 rounded p-2 overflow-x-auto text-gray-600 max-h-32">
										{JSON.stringify(entry.details, null, 2)}
									</pre>
								</details>
							)}
						</div>
					</div>
				))}

				{/* Pagination */}
				{!loading && totalPages > 1 && (
					<div className="flex items-center justify-between px-4 py-3">
						<p className="text-xs text-gray-500">
							Page {page} of {totalPages} ({total} entries)
						</p>
						<div className="flex gap-2">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page <= 1}
								className="px-3 py-1 rounded border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
							>
								Previous
							</button>
							<button
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page >= totalPages}
								className="px-3 py-1 rounded border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
							>
								Next
							</button>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}

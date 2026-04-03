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
	create: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-200',
	update: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200',
	delete: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-200',
	approve: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200',
	reject: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-200',
	login: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200',
};

function getActionColor(action: string): string {
	const key = Object.keys(ACTION_COLORS).find((k) => action.toLowerCase().includes(k));
	return key ? ACTION_COLORS[key] : 'bg-(--accent-light) text-(--primary-light)';
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
				<h1 className="text-xl font-semibold text-(--primary)">Audit Log</h1>
				<p className="text-sm text-(--secondary-light) mt-1">{total} log entries</p>
			</div>

			{/* Filters */}
			<Card className="p-4">
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="flex-1">
						<input
							type="text"
							placeholder="Search by action, user name, or email..."
							aria-label="Search by action, user name, or email"
							value={search}
							onChange={(e) => { setSearch(e.target.value); setPage(1); }}
							className="w-full px-3 py-2 rounded-lg border border-(--border) text-sm focus:outline-none focus:ring-2 focus:ring-(--border-focus)"
						/>
					</div>
					<select
						value={entityType}
						onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
						className="px-3 py-2 rounded-lg border border-(--border) text-sm focus:outline-none bg-(--surface)"
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
			<Card className="divide-y divide-(--border-light)">
				{loading && (
					<div className="p-6 space-y-4">
						{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
							<div key={i} className="h-12 bg-(--accent-subtle) rounded animate-pulse" />
						))}
					</div>
				)}

				{!loading && entries.length === 0 && (
					<div className="p-8 text-center text-(--secondary-light)">
						No audit log entries found.
					</div>
				)}

				{!loading && entries.map((entry) => (
					<div key={entry.id} className="px-4 py-3 hover:bg-(--accent-subtle)/50 flex items-start gap-4">
						{/* Timestamp */}
						<div className="flex-shrink-0 w-32 text-xs text-(--secondary) pt-0.5">
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
							<p className="text-sm text-(--primary)">
								{entry.userName && (
									<span className="font-medium">{entry.userName}</span>
								)}
								{entry.userName && ' '}
								{entry.entityType && (
									<span className="text-(--secondary-light)">
										on <span className="font-medium">{entry.entityType}</span>
										{entry.entityId && (
											<span className="text-(--secondary) ml-1 font-mono text-xs">
												{entry.entityId.slice(0, 8)}...
											</span>
										)}
									</span>
								)}
							</p>
							{entry.context && (
								<p className="text-xs text-(--secondary) mt-0.5">
									Context: {entry.context}
									{entry.ipAddress && ` · IP: ${entry.ipAddress}`}
								</p>
							)}
							{entry.details && Object.keys(entry.details).length > 0 && (
								<details className="mt-1">
									<summary className="text-xs text-(--secondary) cursor-pointer hover:text-(--secondary-light)">
										Details
									</summary>
									<pre className="mt-1 text-xs bg-(--accent-subtle) rounded p-2 overflow-x-auto text-(--secondary-light) max-h-32">
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
						<p className="text-xs text-(--secondary-light)">
							Page {page} of {totalPages} ({total} entries)
						</p>
						<div className="flex gap-2">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page <= 1}
								className="px-3 py-1 rounded border border-(--border) text-xs font-medium text-(--secondary-light) hover:bg-(--accent-subtle) disabled:opacity-40"
							>
								Previous
							</button>
							<button
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page >= totalPages}
								className="px-3 py-1 rounded border border-(--border) text-xs font-medium text-(--secondary-light) hover:bg-(--accent-subtle) disabled:opacity-40"
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

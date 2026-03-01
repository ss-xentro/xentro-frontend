'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Badge, Input } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface UserRecord {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	avatar: string | null;
	accountType: string;
	activeContext: string | null;
	unlockedContexts: string[];
	emailVerified: boolean;
	isActive: boolean;
	lastLoginAt: string | null;
	createdAt: string | null;
}

const ACCOUNT_TYPES = ['explorer', 'startup', 'mentor', 'investor', 'institution', 'admin'];

const TYPE_COLORS: Record<string, string> = {
	explorer: 'bg-gray-100 text-gray-700',
	startup: 'bg-blue-100 text-blue-700',
	mentor: 'bg-green-100 text-green-700',
	investor: 'bg-amber-100 text-amber-700',
	institution: 'bg-purple-100 text-purple-700',
	admin: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
	const [users, setUsers] = useState<UserRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [filterType, setFilterType] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [toggling, setToggling] = useState<string | null>(null);

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		const token = getSessionToken('admin');
		const params = new URLSearchParams({ page: String(page), per_page: '25' });
		if (search) params.set('search', search);
		if (filterType) params.set('account_type', filterType);

		try {
			const res = await fetch(`/api/admin/users/?${params}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to load users');
			const json = await res.json();
			setUsers(json.data || []);
			setTotal(json.total || 0);
			setTotalPages(json.totalPages || 1);
		} catch {
			setUsers([]);
		} finally {
			setLoading(false);
		}
	}, [page, search, filterType]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const toggleActive = async (userId: string, current: boolean) => {
		setToggling(userId);
		const token = getSessionToken('admin');
		try {
			await fetch(`/api/admin/users/${userId}/`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ isActive: !current }),
			});
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, isActive: !current } : u))
			);
		} finally {
			setToggling(null);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-gray-900">User Management</h2>
					<p className="text-sm text-gray-500 mt-1">{total} total users</p>
				</div>
			</div>

			{/* Filters */}
			<Card className="p-4">
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="flex-1">
						<input
							type="text"
							placeholder="Search by name or email..."
							value={search}
							onChange={(e) => { setSearch(e.target.value); setPage(1); }}
							className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
						/>
					</div>
					<select
						value={filterType}
						onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
						className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white"
					>
						<option value="">All Types</option>
						{ACCOUNT_TYPES.map((t) => (
							<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
						))}
					</select>
				</div>
			</Card>

			{/* Table */}
			<Card className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-200 bg-gray-50">
								<th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
								<th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
								<th className="text-left px-4 py-3 font-medium text-gray-600">Context</th>
								<th className="text-left px-4 py-3 font-medium text-gray-600">Verified</th>
								<th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
								<th className="text-left px-4 py-3 font-medium text-gray-600">Last Login</th>
								<th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
								<th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading && (
								<>
									{[1, 2, 3, 4, 5].map((i) => (
										<tr key={i} className="border-b border-gray-100">
											<td colSpan={8} className="px-4 py-4">
												<div className="h-5 bg-gray-100 rounded animate-pulse" />
											</td>
										</tr>
									))}
								</>
							)}
							{!loading && users.length === 0 && (
								<tr>
									<td colSpan={8} className="px-4 py-8 text-center text-gray-500">
										No users found.
									</td>
								</tr>
							)}
							{!loading && users.map((user) => (
								<tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50">
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
												{user.avatar ? (
													<img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
												) : (
													user.name?.charAt(0)?.toUpperCase() || '?'
												)}
											</div>
											<div>
												<p className="font-medium text-gray-900">{user.name}</p>
												<p className="text-xs text-gray-500">{user.email}</p>
											</div>
										</div>
									</td>
									<td className="px-4 py-3">
										<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[user.accountType] || 'bg-gray-100 text-gray-600'}`}>
											{user.accountType}
										</span>
									</td>
									<td className="px-4 py-3 text-gray-600">{user.activeContext || '—'}</td>
									<td className="px-4 py-3">
										{user.emailVerified ? (
											<span className="text-green-600">✓</span>
										) : (
											<span className="text-gray-400">✗</span>
										)}
									</td>
									<td className="px-4 py-3">
										<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
											{user.isActive ? 'Active' : 'Disabled'}
										</span>
									</td>
									<td className="px-4 py-3 text-xs text-gray-500">
										{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '—'}
									</td>
									<td className="px-4 py-3 text-xs text-gray-500">
										{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
									</td>
									<td className="px-4 py-3 text-right">
										<button
											onClick={() => toggleActive(user.id, user.isActive)}
											disabled={toggling === user.id}
											className={`px-3 py-1 rounded text-xs font-medium transition-colors ${user.isActive
													? 'bg-red-50 text-red-600 hover:bg-red-100'
													: 'bg-green-50 text-green-600 hover:bg-green-100'
												} disabled:opacity-50`}
										>
											{toggling === user.id ? '...' : user.isActive ? 'Disable' : 'Enable'}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
						<p className="text-xs text-gray-500">
							Page {page} of {totalPages} ({total} users)
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

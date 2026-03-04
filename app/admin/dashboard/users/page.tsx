'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, Button, Badge, Input } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { AppIcon } from '@/components/ui/AppIcon';

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
	const [openMenu, setOpenMenu] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close dropdown on outside click
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpenMenu(null);
			}
		};
		if (openMenu) document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [openMenu]);

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
		setOpenMenu(null);
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

	const deleteUser = async (userId: string) => {
		setToggling(userId);
		setConfirmDelete(null);
		setOpenMenu(null);
		const token = getSessionToken('admin');
		try {
			const res = await fetch(`/api/admin/users/${userId}/`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				setUsers((prev) => prev.filter((u) => u.id !== userId));
				setTotal((prev) => prev - 1);
			}
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
											<span className="text-green-600"><AppIcon name="check" className="w-4 h-4" /></span>
										) : (
											<span className="text-gray-400"><AppIcon name="x" className="w-4 h-4" /></span>
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
										<div className="relative inline-block" ref={openMenu === user.id ? menuRef : undefined}>
											<button
												onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
												className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
												aria-label="Actions"
											>
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
													<path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
												</svg>
											</button>

											{openMenu === user.id && (
												<div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
													<button
														onClick={() => toggleActive(user.id, user.isActive)}
														disabled={toggling === user.id}
														className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${user.isActive
																? 'text-amber-600 hover:bg-amber-50'
																: 'text-green-600 hover:bg-green-50'
															}`}
													>
														{user.isActive ? (
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
															</svg>
														) : (
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
														)}
														{toggling === user.id ? '...' : user.isActive ? 'Disable' : 'Enable'}
													</button>

													{confirmDelete === user.id ? (
														<div className="px-4 py-2 border-t border-gray-100">
															<p className="text-xs text-gray-500 mb-2">Are you sure?</p>
															<div className="flex gap-2">
																<button
																	onClick={() => deleteUser(user.id)}
																	disabled={toggling === user.id}
																	className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
																>
																	Yes
																</button>
																<button
																	onClick={() => setConfirmDelete(null)}
																	className="flex-1 px-2 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
																>
																	No
																</button>
															</div>
														</div>
													) : (
														<button
															onClick={() => setConfirmDelete(user.id)}
															className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
															</svg>
															Delete
														</button>
													)}
												</div>
											)}
										</div>
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

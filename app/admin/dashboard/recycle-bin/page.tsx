'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, FeedbackBanner, PageSkeleton, EmptyState, Spinner } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface RecycleBinUser {
	id: string;
	name: string;
	email: string;
	avatar: string | null;
	accountType: string;
	deletedAt: string;
	daysRemaining: number;
}

const accountTypeLabels: Record<string, string> = {
	founder: 'Founder',
	institution_admin: 'Institution Admin',
	mentor: 'Mentor',
	investor: 'Investor',
	explorer: 'Explorer',
	admin: 'Admin',
	approver: 'Approver',
};

const accountTypeColors: Record<string, string> = {
	founder: 'bg-blue-100 text-blue-700',
	institution_admin: 'bg-purple-100 text-purple-700',
	mentor: 'bg-green-100 text-green-700',
	investor: 'bg-amber-100 text-amber-700',
	explorer: 'bg-gray-100 text-gray-700',
	admin: 'bg-red-100 text-red-700',
	approver: 'bg-indigo-100 text-indigo-700',
};

export default function AdminRecycleBinPage() {
	const router = useRouter();
	const [users, setUsers] = useState<RecycleBinUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [search, setSearch] = useState('');

	useEffect(() => {
		loadRecycleBin();
	}, []);

	const getHeaders = (): Record<string, string> => {
		const headers: Record<string, string> = {};
		const token = getSessionToken('admin');
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}
		return headers;
	};

	const loadRecycleBin = async () => {
		try {
			const res = await fetch('/api/admin/recycle-bin/', {
				headers: getHeaders(),
			});

			if (res.status === 401 || res.status === 403) {
				router.push('/admin/login');
				return;
			}

			if (!res.ok) throw new Error('Failed to load recycle bin');

			const json = await res.json();
			setUsers(json.data || []);
			setError(null);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleRestore = async (userId: string, userName: string) => {
		setActionLoading(`restore-${userId}`);
		setSuccess(null);
		try {
			const res = await fetch(`/api/admin/recycle-bin/${userId}/restore/`, {
				method: 'POST',
				headers: getHeaders(),
			});

			if (!res.ok) {
				const json = await res.json();
				throw new Error(json.error || 'Failed to restore user');
			}

			setUsers((prev) => prev.filter((u) => u.id !== userId));
			setSuccess(`"${userName}" has been restored successfully.`);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setActionLoading(null);
		}
	};

	const handlePermanentDelete = async (userId: string, userName: string) => {
		if (
			!confirm(
				`This will PERMANENTLY delete "${userName}" and ALL related data including uploaded files.\n\nThis action cannot be undone. Continue?`
			)
		)
			return;

		setActionLoading(`delete-${userId}`);
		setSuccess(null);
		try {
			const res = await fetch(`/api/admin/recycle-bin/${userId}/`, {
				method: 'DELETE',
				headers: getHeaders(),
			});

			if (!res.ok) {
				const json = await res.json();
				throw new Error(json.error || 'Failed to delete user');
			}

			const json = await res.json();
			const r2Info = json.cleanup?.r2FilesDeleted
				? ` (${json.cleanup.r2FilesDeleted} files cleaned from storage)`
				: '';

			setUsers((prev) => prev.filter((u) => u.id !== userId));
			setSuccess(`"${userName}" has been permanently deleted${r2Info}.`);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setActionLoading(null);
		}
	};

	const filteredUsers = users.filter((u) => {
		if (!search) return true;
		const q = search.toLowerCase();
		return (
			u.name.toLowerCase().includes(q) ||
			u.email.toLowerCase().includes(q) ||
			(accountTypeLabels[u.accountType] || u.accountType).toLowerCase().includes(q)
		);
	});

	if (loading) {
		return (
			<div className="p-8">
				<PageSkeleton />
			</div>
		);
	}

	return (
		<div className="p-8 space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
					<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					Recycle Bin
				</h1>
				<p className="text-gray-500 mt-1">
					Deleted users are kept for 30 days before automatic removal. {users.length} user
					{users.length !== 1 ? 's' : ''} in recycle bin.
				</p>
			</div>

			{/* Feedback */}
			{error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}
			{success && <FeedbackBanner type="success" message={success} onDismiss={() => setSuccess(null)} />}

			{/* Search */}
			{users.length > 0 && (
				<div className="relative max-w-md">
					<svg
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						type="text"
						placeholder="Search by name, email, or role..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
					/>
				</div>
			)}

			{/* Users list */}
			{filteredUsers.length === 0 ? (
				<EmptyState
					icon={
						<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					}
					title={search ? 'No matching users' : 'Recycle bin is empty'}
					description={
						search
							? 'Try adjusting your search terms'
							: 'Users you delete from the Users page will appear here for 30 days'
					}
				/>
			) : (
				<div className="space-y-3">
					{filteredUsers.map((user) => (
						<Card
							key={user.id}
							className="p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
						>
							<div className="flex items-center gap-4 flex-1 min-w-0">
								{/* Avatar */}
								<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 overflow-hidden flex-shrink-0">
									{user.avatar ? (
										<img
											src={user.avatar}
											alt={user.name}
											className="w-full h-full object-cover"
										/>
									) : (
										user.name
											.split(' ')
											.map((n) => n[0])
											.join('')
											.toUpperCase()
											.slice(0, 2)
									)}
								</div>

								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
										<span
											className={`px-2 py-0.5 rounded-full text-xs font-medium ${accountTypeColors[user.accountType] || 'bg-gray-100 text-gray-700'
												}`}
										>
											{accountTypeLabels[user.accountType] || user.accountType}
										</span>
									</div>
									<div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
										<span className="truncate">{user.email}</span>
										<span className="text-gray-300">|</span>
										<span>
											Deleted{' '}
											{new Date(user.deletedAt).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})}
										</span>
										<span
											className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.daysRemaining <= 7
												? 'bg-red-100 text-red-700'
												: user.daysRemaining <= 14
													? 'bg-yellow-100 text-yellow-700'
													: 'bg-green-100 text-green-700'
												}`}
										>
											{user.daysRemaining} day{user.daysRemaining !== 1 ? 's' : ''} remaining
										</span>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2 ml-4">
								<Button
									variant="ghost"
									size="sm"
									className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
									onClick={() => handleRestore(user.id, user.name)}
									disabled={actionLoading === `restore-${user.id}`}
								>
									{actionLoading === `restore-${user.id}` ? (
										<Spinner size="sm" className="mr-1" />
									) : (
										<svg
											className="w-4 h-4 mr-1"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
											/>
										</svg>
									)}
									Restore
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
									onClick={() => handlePermanentDelete(user.id, user.name)}
									disabled={actionLoading === `delete-${user.id}`}
								>
									{actionLoading === `delete-${user.id}` ? (
										<Spinner size="sm" className="mr-1" />
									) : (
										<svg
											className="w-4 h-4 mr-1"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									)}
									Delete Forever
								</Button>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

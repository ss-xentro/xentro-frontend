'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface RecycleBinItem {
	id: string;
	name: string;
	deletedAt: string;
	daysRemaining: number;
}

interface RecycleBinData {
	startups: RecycleBinItem[];
	programs: RecycleBinItem[];
	projects: RecycleBinItem[];
	mentors: RecycleBinItem[];
	team: RecycleBinItem[];
}

type FolderKey = keyof RecycleBinData;

const folders: { key: FolderKey; label: string; icon: React.ReactNode }[] = [
	{
		key: 'startups',
		label: 'Startups',
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
		),
	},
	{
		key: 'mentors',
		label: 'Mentors',
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7" />
			</svg>
		),
	},
	{
		key: 'programs',
		label: 'Programs',
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
		),
	},
	{
		key: 'projects',
		label: 'Projects',
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
			</svg>
		),
	},
	{
		key: 'team',
		label: 'Team',
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
			</svg>
		),
	},
];

// Map folder key to the singular type name expected by the API
const typeMap: Record<FolderKey, string> = {
	startups: 'startup',
	programs: 'program',
	projects: 'project',
	mentors: 'mentor',
	team: 'team',
};

export default function RecycleBinPage() {
	const router = useRouter();
	const [data, setData] = useState<RecycleBinData>({
		startups: [],
		programs: [],
		projects: [],
		mentors: [],
		team: [],
	});
	const [activeFolder, setActiveFolder] = useState<FolderKey>('startups');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	useEffect(() => {
		loadRecycleBin();
	}, []);

	const loadRecycleBin = async () => {
		try {
			const token = getSessionToken('institution');
			if (!token) {
				router.push('/institution-login');
				return;
			}

			const res = await fetch('/api/institution-recycle-bin/', {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) throw new Error('Failed to load recycle bin');

			const json = await res.json();
			setData(json.data || {
				startups: [],
				programs: [],
				projects: [],
				mentors: [],
				team: [],
			});
			setError(null);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleRestore = async (type: string, id: string) => {
		setActionLoading(`restore-${id}`);
		try {
			const token = getSessionToken('institution');
			if (!token) throw new Error('Authentication required');

			const res = await fetch(`/api/institution-recycle-bin/${type}/${id}/restore/`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) {
				const json = await res.json();
				throw new Error(json.error || 'Failed to restore item');
			}

			// Remove from local state
			setData((prev) => ({
				...prev,
				[activeFolder]: prev[activeFolder].filter((item) => item.id !== id),
			}));
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setActionLoading(null);
		}
	};

	const handlePermanentDelete = async (type: string, id: string) => {
		if (!confirm('This will permanently delete this item. This action cannot be undone. Continue?'))
			return;

		setActionLoading(`delete-${id}`);
		try {
			const token = getSessionToken('institution');
			if (!token) throw new Error('Authentication required');

			const res = await fetch(`/api/institution-recycle-bin/${type}/${id}/`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) {
				const json = await res.json();
				throw new Error(json.error || 'Failed to delete item');
			}

			setData((prev) => ({
				...prev,
				[activeFolder]: prev[activeFolder].filter((item) => item.id !== id),
			}));
		} catch (err) {
			alert((err as Error).message);
		} finally {
			setActionLoading(null);
		}
	};

	const totalItems = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
	const activeItems = data[activeFolder] || [];
	const apiType = typeMap[activeFolder];

	if (loading) {
		return (
			<DashboardSidebar>
				<div className="p-8">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-gray-200 rounded w-1/4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/3"></div>
						<div className="grid grid-cols-1 gap-4 mt-6">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-20 bg-gray-200 rounded"></div>
							))}
						</div>
					</div>
				</div>
			</DashboardSidebar>
		);
	}

	return (
		<DashboardSidebar>
			<div className="p-8 space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-(--primary) flex items-center gap-3">
						<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Recycle Bin
					</h1>
					<p className="text-(--secondary) mt-1">
						Deleted items are kept for 30 days before permanent removal. {totalItems} item{totalItems !== 1 ? 's' : ''} total.
					</p>
				</div>

				{error && (
					<Card className="p-4 bg-red-50 border-red-200">
						<p className="text-red-600">{error}</p>
					</Card>
				)}

				{/* Folder tabs */}
				<div className="flex flex-wrap gap-2 border-b border-(--border) pb-4">
					{folders.map((folder) => {
						const count = (data[folder.key] || []).length;
						const isActive = activeFolder === folder.key;
						return (
							<button
								key={folder.key}
								onClick={() => setActiveFolder(folder.key)}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
										? 'bg-blue-50 text-blue-700 border border-blue-200'
										: 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border border-transparent'
									}`}
							>
								{folder.icon}
								{folder.label}
								{count > 0 && (
									<span
										className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
											}`}
									>
										{count}
									</span>
								)}
							</button>
						);
					})}
				</div>

				{/* Items list */}
				{activeItems.length === 0 ? (
					<Card className="p-12 text-center">
						<div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
							<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-700 mb-2">No deleted {activeFolder}</h3>
						<p className="text-gray-500">Items you delete will appear here for 30 days</p>
					</Card>
				) : (
					<div className="space-y-3">
						{activeItems.map((item) => (
							<Card key={item.id} className="p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
									<div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
										<span>
											Deleted {new Date(item.deletedAt).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})}
										</span>
										<span
											className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.daysRemaining <= 7
													? 'bg-red-100 text-red-700'
													: item.daysRemaining <= 14
														? 'bg-yellow-100 text-yellow-700'
														: 'bg-green-100 text-green-700'
												}`}
										>
											{item.daysRemaining} day{item.daysRemaining !== 1 ? 's' : ''} remaining
										</span>
									</div>
								</div>

								<div className="flex items-center gap-2 ml-4">
									<Button
										variant="ghost"
										size="sm"
										className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
										onClick={() => handleRestore(apiType, item.id)}
										disabled={actionLoading === `restore-${item.id}`}
									>
										{actionLoading === `restore-${item.id}` ? (
											<svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
											</svg>
										) : (
											<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
										)}
										Restore
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="text-red-600 hover:text-red-700 hover:bg-red-50"
										onClick={() => handlePermanentDelete(apiType, item.id)}
										disabled={actionLoading === `delete-${item.id}`}
									>
										{actionLoading === `delete-${item.id}` ? (
											<svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
											</svg>
										) : (
											<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
		</DashboardSidebar>
	);
}

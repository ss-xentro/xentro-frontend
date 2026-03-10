import { useRef, useEffect, useState } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { UserRecord, TYPE_COLORS } from '../_lib/constants';

interface UserRowProps {
	user: UserRecord;
	toggling: string | null;
	onToggleActive: (userId: string, current: boolean) => void;
	onDelete: (userId: string) => void;
}

export default function UserRow({ user, toggling, onToggleActive, onDelete }: UserRowProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
				setConfirmDelete(false);
			}
		};
		if (menuOpen) document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [menuOpen]);

	const handleToggle = () => {
		onToggleActive(user.id, user.isActive);
		setMenuOpen(false);
	};

	const handleDelete = () => {
		onDelete(user.id);
		setMenuOpen(false);
		setConfirmDelete(false);
	};

	return (
		<tr className="border-b border-gray-100 hover:bg-gray-50/50">
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
				<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isDeleted
					? 'bg-gray-100 text-gray-500'
					: user.isActive
						? 'bg-green-100 text-green-700'
						: 'bg-red-100 text-red-700'
					}`}>
					{user.isDeleted ? 'Deleted' : user.isActive ? 'Active' : 'Disabled'}
				</span>
			</td>
			<td className="px-4 py-3 text-xs text-gray-500">
				{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '—'}
			</td>
			<td className="px-4 py-3 text-xs text-gray-500">
				{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
			</td>
			<td className="px-4 py-3 text-right">
				<div className="relative inline-block" ref={menuRef}>
					<button
						onClick={() => setMenuOpen(!menuOpen)}
						className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
						aria-label="Actions"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
						</svg>
					</button>

					{menuOpen && (
						<div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
							<button
								onClick={handleToggle}
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

							{confirmDelete ? (
								<div className="px-4 py-2 border-t border-gray-100">
									<p className="text-xs text-gray-500 mb-2">Are you sure?</p>
									<div className="flex gap-2">
										<button
											onClick={handleDelete}
											disabled={toggling === user.id}
											className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
										>
											Yes
										</button>
										<button
											onClick={() => setConfirmDelete(false)}
											className="flex-1 px-2 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
										>
											No
										</button>
									</div>
								</div>
							) : (
								<button
									onClick={() => setConfirmDelete(true)}
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
	);
}

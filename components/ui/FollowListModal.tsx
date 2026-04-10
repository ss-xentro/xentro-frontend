'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';
import { fetchEntityFollowers, fetchUserFollowing, type FollowUser, type EntityType } from '@/lib/useFollow';

type Tab = 'followers' | 'following';

interface FollowListModalProps {
	isOpen: boolean;
	onClose: () => void;
	entityId: string;
	entityType?: EntityType;
	currentUserId?: string;
	initialTab?: Tab;
	followerCount: number;
	followingCount: number;
}

export function FollowListModal({
	isOpen,
	onClose,
	entityId,
	entityType = 'user',
	currentUserId,
	initialTab = 'followers',
	followerCount,
	followingCount,
}: FollowListModalProps) {
	const showFollowingTab = entityType === 'user' && followingCount > 0;
	const [tab, setTab] = useState<Tab>(initialTab);
	const [users, setUsers] = useState<FollowUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
	const [confirmUnfollowId, setConfirmUnfollowId] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) setTab(initialTab === 'following' && !showFollowingTab ? 'followers' : initialTab);
	}, [isOpen, initialTab, showFollowingTab]);

	const fetchList = useCallback(async () => {
		if (!isOpen || !entityId) return;
		setLoading(true);
		try {
			const data = tab === 'followers'
				? await fetchEntityFollowers(entityId, entityType)
				: await fetchUserFollowing(entityId);
			setUsers(data.users);
		} finally {
			setLoading(false);
		}
	}, [isOpen, entityId, entityType, tab]);

	useEffect(() => {
		fetchList();
	}, [fetchList]);

	const executeToggle = async (targetId: string, currentlyFollowing: boolean) => {
		if (togglingIds.has(targetId)) return;
		setTogglingIds((prev) => new Set(prev).add(targetId));
		try {
			const res = await fetch(`/api/follow/${targetId}/`, {
				method: currentlyFollowing ? 'DELETE' : 'POST',
			});
			if (res.ok) {
				setUsers((prev) =>
					prev.map((u) =>
						u.id === targetId ? { ...u, isFollowing: !currentlyFollowing } : u,
					),
				);
			}
		} finally {
			setTogglingIds((prev) => {
				const next = new Set(prev);
				next.delete(targetId);
				return next;
			});
		}
	};

	const handleToggleFollow = (targetId: string, currentlyFollowing: boolean) => {
		if (currentlyFollowing) {
			setConfirmUnfollowId(targetId);
		} else {
			executeToggle(targetId, false);
		}
	};

	const handleConfirmUnfollow = () => {
		if (confirmUnfollowId) {
			executeToggle(confirmUnfollowId, true);
			setConfirmUnfollowId(null);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
			{/* Tabs */}
			<div className="flex border-b border-(--border)">
				<button
					onClick={() => setTab('followers')}
					className={cn(
						'flex-1 py-3 text-sm font-semibold text-center transition-colors relative',
						tab === 'followers'
							? 'text-(--primary)'
							: 'text-(--secondary-light) hover:text-(--secondary)',
					)}
				>
					{followerCount} Followers
					{tab === 'followers' && (
						<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--primary)" />
					)}
				</button>
				{showFollowingTab && (
					<button
						onClick={() => setTab('following')}
						className={cn(
							'flex-1 py-3 text-sm font-semibold text-center transition-colors relative',
							tab === 'following'
								? 'text-(--primary)'
								: 'text-(--secondary-light) hover:text-(--secondary)',
						)}
					>
						{followingCount} Following
						{tab === 'following' && (
							<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--primary)" />
						)}
					</button>
				)}
			</div>

			{/* List */}
			<div className="max-h-96 overflow-y-auto">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<AppIcon name="loader-2" className="w-5 h-5 animate-spin text-(--secondary-light)" />
					</div>
				) : users.length === 0 ? (
					<div className="text-center py-12 text-sm text-(--secondary-light)">
						{tab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
					</div>
				) : (
					<ul className="divide-y divide-(--border-light)">
						{users.map((user) => {
							const isSelf = currentUserId === user.id;
							const toggling = togglingIds.has(user.id);
							return (
								<li key={user.id} className="flex items-center gap-3 px-4 py-3">
									{/* Avatar */}
									<div className="w-10 h-10 rounded-full bg-(--accent-light) border border-(--border) overflow-hidden flex items-center justify-center shrink-0">
										{user.avatar ? (
											<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
										) : (
											<span className="text-sm font-semibold text-(--secondary)">
												{user.name.charAt(0).toUpperCase()}
											</span>
										)}
									</div>

									{/* Name + context */}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-(--primary) truncate">{user.name}</p>
										{user.activeContext && (
											<p className="text-xs text-(--secondary-light) capitalize">{user.activeContext}</p>
										)}
									</div>

									{/* Follow/Following button */}
									{!isSelf && (
										<button
											onClick={() => handleToggleFollow(user.id, user.isFollowing)}
											disabled={toggling}
											className={cn(
												'px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0',
												user.isFollowing
													? 'bg-(--accent-subtle) text-(--secondary) border border-(--border) hover:border-(--border-hover)'
													: 'bg-brand text-white hover:opacity-90',
												toggling && 'opacity-60 cursor-not-allowed',
											)}
										>
											{toggling ? (
												<AppIcon name="loader-2" className="w-3 h-3 animate-spin" />
											) : user.isFollowing ? (
												'Following'
											) : (
												'Follow'
											)}
										</button>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</div>

			{/* Inline unfollow confirmation */}
			{confirmUnfollowId && (
				<div className="border-t border-(--border) px-4 py-3 flex items-center justify-between bg-(--accent-subtle)">
					<p className="text-xs text-(--secondary)">
						Unfollow {users.find((u) => u.id === confirmUnfollowId)?.name ?? 'this user'}?
					</p>
					<div className="flex gap-2">
						<button
							onClick={() => setConfirmUnfollowId(null)}
							className="px-3 py-1 rounded-lg text-xs font-semibold border border-(--border) text-(--secondary) hover:bg-(--surface) transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleConfirmUnfollow}
							className="px-3 py-1 rounded-lg text-xs font-semibold bg-(--error) text-white hover:opacity-90 transition-colors"
						>
							Unfollow
						</button>
					</div>
				</div>
			)}
		</Modal>
	);
}

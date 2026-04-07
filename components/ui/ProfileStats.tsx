'use client';

import { useState } from 'react';
import { useFollow } from '@/lib/useFollow';
import { FollowListModal } from '@/components/ui/FollowListModal';

function formatCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
	if (n >= 10_000) return `${(n / 1_000).toFixed(0)}K`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
	return String(n);
}

interface ProfileStatsProps {
	targetUserId: string;
	currentUserId?: string;
}

/**
 * Instagram-style follower/following counts.
 * Clicking a count opens the FollowListModal.
 */
export function ProfileStats({ targetUserId, currentUserId }: ProfileStatsProps) {
	const { status, loading } = useFollow({ targetUserId, currentUserId });
	const [modal, setModal] = useState<{ open: boolean; tab: 'followers' | 'following' }>({
		open: false,
		tab: 'followers',
	});

	if (loading || !status) {
		return (
			<div className="flex items-center gap-5">
				<div className="h-4 w-16 rounded bg-(--accent-subtle) animate-pulse" />
				<div className="h-4 w-16 rounded bg-(--accent-subtle) animate-pulse" />
			</div>
		);
	}

	return (
		<>
			<div className="flex items-center gap-5 text-sm">
				<button
					onClick={() => setModal({ open: true, tab: 'followers' })}
					className="hover:opacity-70 transition-opacity"
				>
					<span className="font-bold text-(--primary)">{formatCount(status.followerCount)}</span>{' '}
					<span className="text-(--secondary)">followers</span>
				</button>
				<button
					onClick={() => setModal({ open: true, tab: 'following' })}
					className="hover:opacity-70 transition-opacity"
				>
					<span className="font-bold text-(--primary)">{formatCount(status.followingCount)}</span>{' '}
					<span className="text-(--secondary)">following</span>
				</button>
			</div>

			<FollowListModal
				isOpen={modal.open}
				onClose={() => setModal((prev) => ({ ...prev, open: false }))}
				userId={targetUserId}
				currentUserId={currentUserId}
				initialTab={modal.tab}
				followerCount={status.followerCount}
				followingCount={status.followingCount}
			/>
		</>
	);
}

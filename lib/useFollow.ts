'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FollowStatus {
	following: boolean;
	followedBy: boolean;
	isMutual: boolean;
	followerCount: number;
	followingCount: number;
}

interface UseFollowOptions {
	targetUserId: string;
	/** Pass current user id to skip the fetch for self */
	currentUserId?: string;
}

export function useFollow({ targetUserId, currentUserId }: UseFollowOptions) {
	const [status, setStatus] = useState<FollowStatus | null>(null);
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);

	const isSelf = currentUserId && currentUserId === targetUserId;

	const fetchStatus = useCallback(async () => {
		if (!targetUserId || isSelf) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/follow/${targetUserId}/`);
			if (res.ok) {
				setStatus(await res.json());
			}
		} finally {
			setLoading(false);
		}
	}, [targetUserId, isSelf]);

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus]);

	const follow = useCallback(async () => {
		if (!targetUserId || actionLoading) return;
		setActionLoading(true);
		try {
			const res = await fetch(`/api/follow/${targetUserId}/`, { method: 'POST' });
			if (res.ok) {
				setStatus((prev) =>
					prev
						? {
							...prev,
							following: true,
							isMutual: prev.followedBy,
							followerCount: prev.followerCount + 1,
						}
						: null,
				);
			}
		} finally {
			setActionLoading(false);
		}
	}, [targetUserId, actionLoading]);

	const unfollow = useCallback(async () => {
		if (!targetUserId || actionLoading) return;
		setActionLoading(true);
		try {
			const res = await fetch(`/api/follow/${targetUserId}/`, { method: 'DELETE' });
			if (res.ok) {
				setStatus((prev) =>
					prev
						? {
							...prev,
							following: false,
							isMutual: false,
							followerCount: Math.max(0, prev.followerCount - 1),
						}
						: null,
				);
			}
		} finally {
			setActionLoading(false);
		}
	}, [targetUserId, actionLoading]);

	const toggle = useCallback(() => {
		if (status?.following) {
			unfollow();
		} else {
			follow();
		}
	}, [status, follow, unfollow]);

	return { status, loading, actionLoading, follow, unfollow, toggle };
}

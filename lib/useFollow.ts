'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FollowStatus {
	following: boolean;
	followedBy: boolean;
	isMutual: boolean;
	followerCount: number;
	followingCount: number;
}

export interface FollowUser {
	id: string;
	name: string;
	email: string;
	avatar: string | null;
	activeContext: string | null;
	isFollowing: boolean;
}

interface UseFollowOptions {
	targetUserId: string;
	/** Pass current user id — self profiles will fetch counts only */
	currentUserId?: string;
}

export function useFollow({ targetUserId, currentUserId }: UseFollowOptions) {
	const [status, setStatus] = useState<FollowStatus | null>(null);
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);

	const isSelf = currentUserId && currentUserId === targetUserId;

	const fetchStatus = useCallback(async () => {
		if (!targetUserId) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/follow/${targetUserId}/`);
			if (res.ok) {
				setStatus(await res.json());
			}
		} finally {
			setLoading(false);
		}
	}, [targetUserId]);

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus]);

	const follow = useCallback(async () => {
		if (!targetUserId || actionLoading || isSelf) return;
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
	}, [targetUserId, actionLoading, isSelf]);

	const unfollow = useCallback(async () => {
		if (!targetUserId || actionLoading || isSelf) return;
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
	}, [targetUserId, actionLoading, isSelf]);

	const toggle = useCallback(() => {
		if (status?.following) {
			unfollow();
		} else {
			follow();
		}
	}, [status, follow, unfollow]);

	return { status, loading, actionLoading, follow, unfollow, toggle, isSelf: !!isSelf, refetch: fetchStatus };
}

/** Fetch a user's followers list */
export async function fetchUserFollowers(userId: string): Promise<{ users: FollowUser[]; count: number }> {
	const res = await fetch(`/api/follow/${userId}/followers/`);
	if (!res.ok) return { users: [], count: 0 };
	return res.json();
}

/** Fetch a user's following list */
export async function fetchUserFollowing(userId: string): Promise<{ users: FollowUser[]; count: number }> {
	const res = await fetch(`/api/follow/${userId}/following/`);
	if (!res.ok) return { users: [], count: 0 };
	return res.json();
}

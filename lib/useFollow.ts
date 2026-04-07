'use client';

import { useState, useEffect, useCallback } from 'react';

export type EntityType = 'user' | 'startup' | 'institution';

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
	targetId: string;
	entityType?: EntityType;
	/** Pass current user id — self profiles will fetch counts only */
	currentUserId?: string;
}

function qs(type: EntityType): string {
	return type === 'user' ? '' : `?type=${type}`;
}

export function useFollow({ targetId, entityType = 'user', currentUserId }: UseFollowOptions) {
	const [status, setStatus] = useState<FollowStatus | null>(null);
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);

	const isSelf = entityType === 'user' && currentUserId && currentUserId === targetId;

	const fetchStatus = useCallback(async () => {
		if (!targetId) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/follow/${targetId}/${qs(entityType)}`);
			if (res.ok) {
				setStatus(await res.json());
			}
		} finally {
			setLoading(false);
		}
	}, [targetId, entityType]);

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus]);

	const follow = useCallback(async () => {
		if (!targetId || actionLoading || isSelf) return;
		setActionLoading(true);
		try {
			const res = await fetch(`/api/follow/${targetId}/${qs(entityType)}`, { method: 'POST' });
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
	}, [targetId, entityType, actionLoading, isSelf]);

	const unfollow = useCallback(async () => {
		if (!targetId || actionLoading || isSelf) return;
		setActionLoading(true);
		try {
			const res = await fetch(`/api/follow/${targetId}/${qs(entityType)}`, { method: 'DELETE' });
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
	}, [targetId, entityType, actionLoading, isSelf]);

	const toggle = useCallback(() => {
		if (status?.following) {
			unfollow();
		} else {
			follow();
		}
	}, [status, follow, unfollow]);

	return { status, loading, actionLoading, follow, unfollow, toggle, isSelf: !!isSelf, refetch: fetchStatus };
}

/** Fetch an entity's followers list */
export async function fetchEntityFollowers(
	entityId: string,
	entityType: EntityType = 'user',
): Promise<{ users: FollowUser[]; count: number }> {
	const res = await fetch(`/api/follow/${entityId}/followers/${qs(entityType)}`);
	if (!res.ok) return { users: [], count: 0 };
	return res.json();
}

/** Fetch a user's following list (only user entities have a "following" list) */
export async function fetchUserFollowing(userId: string): Promise<{ users: FollowUser[]; count: number }> {
	const res = await fetch(`/api/follow/${userId}/following/`);
	if (!res.ok) return { users: [], count: 0 };
	return res.json();
}

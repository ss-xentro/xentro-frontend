'use client';

import { useRouter } from 'next/navigation';
import { useFollow, type EntityType } from '@/lib/useFollow';
import { createOrGetRoom } from '@/lib/useChat';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';

interface FollowButtonProps {
	/** UUID of the entity to follow/unfollow. */
	targetId: string;
	/** Type of entity: user, startup, or institution. */
	entityType?: EntityType;
	/** UUID of the currently authenticated user. */
	currentUserId?: string;
	/** When true, show a "Message" button that opens (or creates) the chat room. */
	showMessage?: boolean;
	/** Extra class names on the wrapper div. */
	className?: string;
}

export function FollowButton({
	targetId,
	entityType = 'user',
	currentUserId,
	showMessage = false,
	className,
}: FollowButtonProps) {
	const router = useRouter();
	const { status, loading, actionLoading, toggle } = useFollow({
		targetId,
		entityType,
		currentUserId,
	});

	// Don't render for self (user entities only)
	if (entityType === 'user' && currentUserId && currentUserId === targetId) return null;
	// While initial status is loading, render a skeleton
	if (loading) {
		return (
			<div className={cn('flex gap-2', className)}>
				<div className="h-9 w-24 rounded-full bg-(--accent-subtle) animate-pulse" />
			</div>
		);
	}

	const isFollowing = status?.following ?? false;
	const isMutual = status?.isMutual ?? false;

	const handleMessageClick = async () => {
		try {
			const room = await createOrGetRoom(targetId);
			router.push(`/chat?room=${room.id}`);
		} catch {
			// TODO: surface toast error
		}
	};

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<button
				onClick={toggle}
				disabled={actionLoading}
				className={cn(
					'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all',
					isFollowing
						? 'bg-(--accent-light) text-(--foreground) border border-(--border) hover:bg-red-50 hover:text-red-600 hover:border-red-300'
						: 'bg-brand text-white hover:opacity-90',
					actionLoading && 'opacity-60 cursor-not-allowed',
				)}
			>
				{actionLoading ? (
					<AppIcon name="loader-2" className="w-3.5 h-3.5 animate-spin" />
				) : isFollowing ? (
					<AppIcon name="user-check" className="w-3.5 h-3.5" />
				) : (
					<AppIcon name="user-plus" className="w-3.5 h-3.5" />
				)}
				{isFollowing ? 'Following' : 'Follow'}
			</button>

			{showMessage && isMutual && entityType === 'user' && (
				<button
					onClick={handleMessageClick}
					className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border border-(--border) bg-(--surface) text-(--foreground) hover:bg-(--accent-subtle) transition-colors"
				>
					<AppIcon name="message-circle" className="w-3.5 h-3.5" />
					Message
				</button>
			)}
		</div>
	);
}

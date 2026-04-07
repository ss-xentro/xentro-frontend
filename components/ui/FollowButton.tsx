'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFollow, type EntityType } from '@/lib/useFollow';
import { createOrGetRoom } from '@/lib/useChat';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { Modal } from '@/components/ui/Modal';

interface FollowButtonProps {
	/** UUID of the entity to follow/unfollow. */
	targetId: string;
	/** Type of entity: user, startup, or institution. */
	entityType?: EntityType;
	/** UUID of the currently authenticated user. */
	currentUserId?: string;
	/** Display name shown in the unfollow confirmation modal. */
	targetName?: string;
	/** When true, show a "Message" button that opens (or creates) the chat room. */
	showMessage?: boolean;
	/** Extra class names on the wrapper div. */
	className?: string;
}

export function FollowButton({
	targetId,
	entityType = 'user',
	currentUserId,
	targetName,
	showMessage = false,
	className,
}: FollowButtonProps) {
	const router = useRouter();
	const { status, loading, actionLoading, follow, unfollow, toggle } = useFollow({
		targetId,
		entityType,
		currentUserId,
	});
	const [showConfirm, setShowConfirm] = useState(false);

	// Don't render for self (user entities only)
	if (entityType === 'user' && currentUserId && currentUserId === targetId) return null;
	// While initial status is loading, render a skeleton
	if (loading) {
		return (
			<div className={cn('flex gap-2', className)}>
				<div className="h-8 w-20 rounded-lg bg-(--accent-subtle) animate-pulse" />
			</div>
		);
	}

	const isFollowing = status?.following ?? false;
	const isMutual = status?.isMutual ?? false;

	const handleClick = () => {
		if (isFollowing) {
			setShowConfirm(true);
		} else {
			follow();
		}
	};

	const handleConfirmUnfollow = () => {
		setShowConfirm(false);
		unfollow();
	};

	const handleMessageClick = async () => {
		try {
			const room = await createOrGetRoom(targetId);
			router.push(`/chat?room=${room.id}`);
		} catch {
			// TODO: surface toast error
		}
	};

	const label = entityType === 'user' ? 'user' : entityType;

	return (
		<>
			<div className={cn('flex items-center gap-2', className)}>
				<button
					onClick={handleClick}
					disabled={actionLoading}
					className={cn(
						'inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
						isFollowing
							? 'bg-(--accent-subtle) text-(--secondary) border border-(--border) hover:border-(--border-hover) hover:text-(--primary)'
							: 'bg-brand text-white hover:opacity-90',
						actionLoading && 'opacity-60 cursor-not-allowed',
					)}
				>
					{actionLoading ? (
						<AppIcon name="loader-2" className="w-3 h-3 animate-spin" />
					) : isFollowing ? (
						<AppIcon name="check" className="w-3 h-3" />
					) : (
						<AppIcon name="plus" className="w-3 h-3" />
					)}
					{isFollowing ? 'Following' : 'Follow'}
				</button>

				{showMessage && isMutual && entityType === 'user' && (
					<button
						onClick={handleMessageClick}
						className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-(--border) bg-(--surface) text-(--secondary) hover:bg-(--accent-subtle) hover:text-(--primary) transition-colors"
					>
						<AppIcon name="message-circle" className="w-3 h-3" />
						Message
					</button>
				)}
			</div>

			{/* Unfollow confirmation modal */}
			<Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} className="max-w-sm">
				<div className="p-6 text-center">
					<div className="w-12 h-12 rounded-full bg-(--accent-subtle) border border-(--border) flex items-center justify-center mx-auto mb-4">
						<AppIcon name="user-minus" className="w-5 h-5 text-(--secondary)" />
					</div>
					<h3 className="text-base font-semibold text-(--primary) mb-1">
						Unfollow{targetName ? ` ${targetName}` : ''}?
					</h3>
					<p className="text-sm text-(--secondary-light) mb-6">
						You will no longer see updates from this {label} in your feed.
					</p>
					<div className="flex gap-3">
						<button
							onClick={() => setShowConfirm(false)}
							className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-(--border) text-(--secondary) bg-(--surface) hover:bg-(--accent-subtle) transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleConfirmUnfollow}
							className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
						>
							Unfollow
						</button>
					</div>
				</div>
			</Modal>
		</>
	);
}

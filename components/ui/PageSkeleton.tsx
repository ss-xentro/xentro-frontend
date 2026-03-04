'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface PageSkeletonProps {
	className?: string;
}

/**
 * Full-page skeleton for dashboard pages loading inside DashboardSidebar.
 * Replaces repeated animate-pulse blocks in edit/detail pages.
 */
export function PageSkeleton({ className }: PageSkeletonProps) {
	return (
		<div className={cn('p-8', className)}>
			<div className="animate-pulse space-y-4">
				<div className="h-8 bg-gray-200 rounded w-1/4" />
				<div className="h-4 bg-gray-200 rounded w-1/3" />
			</div>
		</div>
	);
}

interface CardListSkeletonProps {
	count?: number;
	className?: string;
}

/**
 * Skeleton for card lists (e.g. admin institution/startup listings).
 * Replaces repeated card-based skeleton patterns.
 */
export function CardListSkeleton({ count = 3, className }: CardListSkeletonProps) {
	return (
		<div className={cn('space-y-4', className)} role="status" aria-live="polite" aria-label="Loading">
			{Array.from({ length: count }, (_, i) => (
				<Card key={i} className="animate-pulse p-6">
					<div className="h-6 bg-(--surface-hover) rounded w-1/3 mb-3" />
					<div className="h-4 bg-(--surface-hover) rounded w-2/3 mb-2" />
					<div className="h-4 bg-(--surface-hover) rounded w-1/2" />
				</Card>
			))}
		</div>
	);
}

/**
 * Generic form skeleton with multiple field placeholders.
 */
export function FormSkeleton({ className }: PageSkeletonProps) {
	return (
		<div className={cn('space-y-6 animate-pulse', className)}>
			<div className="h-12 bg-(--surface) rounded-xl border border-(--border) w-1/3" />
			<div className="h-64 bg-(--surface) rounded-xl border border-(--border)" />
			<div className="h-48 bg-(--surface) rounded-xl border border-(--border)" />
			<div className="h-32 bg-(--surface) rounded-xl border border-(--border)" />
		</div>
	);
}

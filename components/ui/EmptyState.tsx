'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	ctaLabel?: string;
	onCtaClick?: () => void;
	ctaHref?: string;
	className?: string;
}

/**
 * Reusable empty-state card with icon, title, description, and optional CTA.
 * Replaces duplicate "No items" states across dashboard pages.
 */
export function EmptyState({ icon, title, description, ctaLabel, onCtaClick, ctaHref, className }: EmptyStateProps) {
	const defaultIcon = (
		<svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
		</svg>
	);

	return (
		<Card className={cn('p-12 text-center', className)}>
			<div className="max-w-md mx-auto">
				<div className="w-16 h-16 rounded-full bg-(--surface-hover) flex items-center justify-center mx-auto mb-4">
					{icon || defaultIcon}
				</div>
				<h3 className="text-lg font-semibold text-(--primary) mb-2">{title}</h3>
				{description && <p className="text-(--secondary) mb-6">{description}</p>}
				{ctaLabel && (ctaHref ? (
					<a href={ctaHref}>
						<Button>{ctaLabel}</Button>
					</a>
				) : onCtaClick ? (
					<Button onClick={onCtaClick}>{ctaLabel}</Button>
				) : null)}
			</div>
		</Card>
	);
}

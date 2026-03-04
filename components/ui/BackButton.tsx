'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BackButtonProps {
	href?: string;
	label?: string;
	onClick?: () => void;
	className?: string;
}

/**
 * Reusable back-navigation button with left chevron icon.
 * Replaces inline back buttons across edit/detail pages.
 */
export function BackButton({ href, label = 'Back', onClick, className }: BackButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		if (onClick) {
			onClick();
		} else if (href) {
			router.push(href);
		} else {
			router.back();
		}
	};

	return (
		<button
			onClick={handleClick}
			className={cn(
				'flex items-center gap-2 text-sm text-(--secondary) hover:text-(--primary) transition-colors mb-4',
				className
			)}
		>
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
			</svg>
			{label}
		</button>
	);
}

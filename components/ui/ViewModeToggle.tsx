'use client';

import { cn } from '@/lib/utils';

type ViewMode = 'cards' | 'table';

interface ViewModeToggleProps {
	mode: ViewMode;
	onChange: (mode: ViewMode) => void;
	className?: string;
}

/**
 * Cards/Table view toggle used on admin dashboard listing pages.
 * Replaces identical toggle buttons in admin/institutions and admin/startups.
 */
export function ViewModeToggle({ mode, onChange, className }: ViewModeToggleProps) {
	return (
		<div className={cn('flex items-center gap-1 p-1 bg-(--surface-hover) rounded-md', className)}>
			<button
				onClick={() => onChange('cards')}
				className={cn(
					'p-2 rounded-md transition-colors',
					mode === 'cards' ? 'bg-(--accent-light) text-(--primary)' : 'text-(--secondary)'
				)}
				aria-label="Card view"
			>
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
					/>
				</svg>
			</button>
			<button
				onClick={() => onChange('table')}
				className={cn(
					'p-2 rounded-md transition-colors',
					mode === 'table' ? 'bg-(--accent-light) text-(--primary)' : 'text-(--secondary)'
				)}
				aria-label="Table view"
			>
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 6h16M4 10h16M4 14h16M4 18h16"
					/>
				</svg>
			</button>
		</div>
	);
}

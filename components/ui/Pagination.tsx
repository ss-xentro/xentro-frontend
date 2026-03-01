'use client';

import { useMemo } from 'react';

interface PaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	/** Total item count — shown in "Showing X-Y of Z" */
	total?: number;
	/** Items per page — used to compute range display */
	perPage?: number;
	/** Max page buttons to show (default 7) */
	maxButtons?: number;
	className?: string;
}

export function Pagination({
	page,
	totalPages,
	onPageChange,
	total,
	perPage = 25,
	maxButtons = 7,
	className = '',
}: PaginationProps) {
	if (totalPages <= 1) return null;

	const pages = useMemo(() => {
		const items: (number | 'ellipsis')[] = [];

		if (totalPages <= maxButtons) {
			for (let i = 1; i <= totalPages; i++) items.push(i);
			return items;
		}

		// Always show first page
		items.push(1);

		const half = Math.floor((maxButtons - 2) / 2);
		let start = Math.max(2, page - half);
		let end = Math.min(totalPages - 1, page + half);

		// Adjust range if near edges
		if (page <= half + 1) {
			end = maxButtons - 2;
		} else if (page >= totalPages - half) {
			start = totalPages - maxButtons + 3;
		}

		if (start > 2) items.push('ellipsis');
		for (let i = start; i <= end; i++) items.push(i);
		if (end < totalPages - 1) items.push('ellipsis');

		// Always show last page
		items.push(totalPages);
		return items;
	}, [page, totalPages, maxButtons]);

	const from = total ? (page - 1) * perPage + 1 : undefined;
	const to = total ? Math.min(page * perPage, total) : undefined;

	return (
		<nav aria-label="Pagination" className={`flex items-center justify-between ${className}`}>
			{/* Range info */}
			<div className="text-xs text-(--secondary)">
				{total != null && from != null && to != null ? (
					<span>Showing {from}–{to} of {total}</span>
				) : (
					<span>Page {page} of {totalPages}</span>
				)}
			</div>

			{/* Page buttons */}
			<div className="flex items-center gap-1">
				{/* Prev */}
				<button
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
					className="px-2 py-1 rounded border border-(--border) text-xs font-medium text-(--secondary) hover:bg-(--surface-hover) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					aria-label="Previous page"
				>
					<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>

				{pages.map((item, idx) =>
					item === 'ellipsis' ? (
						<span key={`e-${idx}`} className="px-2 py-1 text-xs text-(--secondary)" aria-hidden="true">
							…
						</span>
					) : (
						<button
							key={item}
							onClick={() => onPageChange(item)}
							className={`min-w-[28px] px-2 py-1 rounded text-xs font-medium transition-colors ${item === page
								? 'bg-(--primary) text-white'
								: 'border border-(--border) text-(--secondary) hover:bg-(--surface-hover)'
								}`}
							aria-label={`Page ${item}`}
							aria-current={item === page ? 'page' : undefined}
						>
							{item}
						</button>
					)
				)}

				{/* Next */}
				<button
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
					className="px-2 py-1 rounded border border-(--border) text-xs font-medium text-(--secondary) hover:bg-(--surface-hover) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					aria-label="Next page"
				>
					<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
		</nav>
	);
}

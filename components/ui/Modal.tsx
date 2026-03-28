'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	className?: string;
	closeOnBackdrop?: boolean;
	closeOnEscape?: boolean;
}

/**
 * Shared modal/dialog primitive with portal rendering, backdrop click,
 * Escape key handling, focus trapping, scroll lock, and ARIA attributes.
 */
export function Modal({
	isOpen,
	onClose,
	title,
	children,
	className,
	closeOnBackdrop = true,
	closeOnEscape = true,
}: ModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);

	// Escape key handler
	useEffect(() => {
		if (!isOpen || !closeOnEscape) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				onClose();
			}
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, [isOpen, closeOnEscape, onClose]);

	// Scroll lock + focus management
	useEffect(() => {
		if (!isOpen) return;

		previousFocusRef.current = document.activeElement as HTMLElement;
		const original = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		// Focus the dialog container
		requestAnimationFrame(() => {
			dialogRef.current?.focus();
		});

		return () => {
			document.body.style.overflow = original;
			previousFocusRef.current?.focus();
		};
	}, [isOpen]);

	// Focus trap
	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key !== 'Tab' || !dialogRef.current) return;

		const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
			'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}, []);

	const handleBackdropClick = useCallback((e: React.MouseEvent) => {
		if (closeOnBackdrop && e.target === e.currentTarget) {
			onClose();
		}
	}, [closeOnBackdrop, onClose]);

	if (!isOpen) return null;

	const titleId = title ? 'modal-title' : undefined;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			onClick={handleBackdropClick}
			aria-hidden="false"
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

			{/* Dialog */}
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
				onKeyDown={handleKeyDown}
				className={cn(
					'relative w-full max-w-lg bg-background border border-(--border) rounded-2xl shadow-xl animate-fadeIn focus:outline-none',
					className
				)}
			>
				{title && (
					<div className="flex items-center justify-between px-6 pt-6 pb-0">
						<h2 id={titleId} className="text-xl font-semibold text-(--primary)">{title}</h2>
						<button
							onClick={onClose}
							className="p-1 rounded-lg hover:bg-(--surface-hover) transition-colors text-(--secondary)"
							aria-label="Close dialog"
						>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				)}
				<div className={cn(!title && 'pt-6', 'px-6 pb-6 pt-4')}>
					{children}
				</div>
			</div>
		</div>,
		document.body
	);
}

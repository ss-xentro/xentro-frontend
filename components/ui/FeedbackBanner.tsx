'use client';

import { cn } from '@/lib/utils';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackBannerProps {
	type: FeedbackType;
	message: string;
	title?: string;
	className?: string;
	onDismiss?: () => void;
}

const config: Record<FeedbackType, { bg: string; border: string; text: string; titleText: string; icon: React.ReactNode }> = {
	success: {
		bg: 'bg-green-50',
		border: 'border-green-200',
		text: 'text-green-700',
		titleText: 'text-green-800',
		icon: (
			<svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
			</svg>
		),
	},
	error: {
		bg: 'bg-red-50',
		border: 'border-red-200',
		text: 'text-red-700',
		titleText: 'text-red-800',
		icon: (
			<svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
			</svg>
		),
	},
	warning: {
		bg: 'bg-amber-50',
		border: 'border-amber-200',
		text: 'text-amber-700',
		titleText: 'text-amber-800',
		icon: (
			<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		),
	},
	info: {
		bg: 'bg-blue-50',
		border: 'border-blue-200',
		text: 'text-blue-700',
		titleText: 'text-blue-800',
		icon: (
			<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
};

/**
 * Unified feedback/alert banner used for success, error, warning, and info messages.
 * Replaces inline copy-pasted banners across the app.
 */
export function FeedbackBanner({ type, message, title, className, onDismiss }: FeedbackBannerProps) {
	const c = config[type];

	return (
		<div
			className={cn(c.bg, c.border, 'border rounded-xl p-4 flex items-start gap-3 animate-fadeIn', className)}
			role="alert"
			aria-live="assertive"
		>
			<div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
				style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
			>
				{c.icon}
			</div>
			<div className="flex-1 min-w-0">
				{title && <h3 className={cn('text-sm font-semibold', c.titleText)}>{title}</h3>}
				<p className={cn('text-sm', c.text, title && 'mt-0.5')}>{message}</p>
			</div>
			{onDismiss && (
				<button
					onClick={onDismiss}
					className={cn('shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors', c.text)}
					aria-label="Dismiss"
				>
					<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			)}
		</div>
	);
}

/**
 * Inline feedback message used inside wizard flows.
 * Lightweight alternative to FeedbackBanner without icon.
 */
export function InlineFeedback({ type, message, className }: { type: 'success' | 'error'; message: string; className?: string }) {
	return (
		<div
			className={cn(
				'rounded-lg px-4 py-3 text-sm border',
				type === 'success'
					? 'border-green-200 bg-green-50 text-green-700'
					: 'border-red-200 bg-red-50 text-red-700',
				className
			)}
		>
			{message}
		</div>
	);
}

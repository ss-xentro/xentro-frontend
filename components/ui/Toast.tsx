'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

interface ToastContextValue {
	toast: (message: string, type?: ToastType, duration?: number) => void;
	success: (message: string, duration?: number) => void;
	error: (message: string, duration?: number) => void;
	info: (message: string, duration?: number) => void;
	warning: (message: string, duration?: number) => void;
	dismiss: (id: string) => void;
}

// ── Context ────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
	return ctx;
}

// ── Icons ──────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { icon: string; bg: string; border: string; text: string }> = {
	success: {
		icon: '✓',
		bg: 'bg-green-500/10',
		border: 'border-green-500/30',
		text: 'text-green-400',
	},
	error: {
		icon: '✕',
		bg: 'bg-red-500/10',
		border: 'border-red-500/30',
		text: 'text-red-400',
	},
	info: {
		icon: 'ℹ',
		bg: 'bg-blue-500/10',
		border: 'border-blue-500/30',
		text: 'text-blue-400',
	},
	warning: {
		icon: '⚠',
		bg: 'bg-amber-500/10',
		border: 'border-amber-500/30',
		text: 'text-amber-400',
	},
};

// ── Provider ───────────────────────────────────────

let _counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const addToast = useCallback(
		(message: string, type: ToastType = 'info', duration = 4000) => {
			const id = `toast-${++_counter}`;
			setToasts((prev) => [...prev, { id, type, message, duration }]);

			if (duration > 0) {
				setTimeout(() => dismiss(id), duration);
			}
		},
		[dismiss]
	);

	const value: ToastContextValue = {
		toast: addToast,
		success: (msg, dur) => addToast(msg, 'success', dur),
		error: (msg, dur) => addToast(msg, 'error', dur),
		info: (msg, dur) => addToast(msg, 'info', dur),
		warning: (msg, dur) => addToast(msg, 'warning', dur),
		dismiss,
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			{/* Toast Container */}
			<div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none" aria-live="polite" aria-relevant="additions removals">
				{toasts.map((t) => {
					const config = TOAST_CONFIG[t.type];
					return (
						<div
							key={t.id}
							role={t.type === 'error' ? 'alert' : 'status'}
							className={cn(
								'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg',
								'animate-in slide-in-from-right-5 fade-in duration-200',
								config.bg,
								config.border,
							)}
						>
							<span className={cn('text-lg font-bold shrink-0 mt-0.5', config.text)}>
								{config.icon}
							</span>
							<p className="text-sm text-(--primary) flex-1">{t.message}</p>
							<button
								onClick={() => dismiss(t.id)}
								className="text-(--secondary) hover:text-(--primary) shrink-0 text-sm"
								aria-label="Dismiss notification"
							>
								✕
							</button>
						</div>
					);
				})}
			</div>
		</ToastContext.Provider>
	);
}

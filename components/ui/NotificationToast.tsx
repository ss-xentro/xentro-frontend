'use client';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { WsNotification } from '@/lib/useNotifications';

// ─── Icon paths per category ──────────────────────────────

const ICONS = {
	message: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
	booking: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
	connection: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
	form: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
	team: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
	check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
	bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
	close: 'M6 18L18 6M6 6l12 12',
};

function getIcon(type: string): { path: string; accent: string } {
	const t = type.toLowerCase();
	if (t.includes('message') || t === 'mention') return { path: ICONS.message, accent: 'bg-blue-500/20 text-blue-400' };
	if (t.includes('booking') || t.includes('session')) return { path: ICONS.booking, accent: 'bg-purple-500/20 text-purple-400' };
	if (t.includes('connect') || t.includes('mentor_request') || t.includes('startup_linked')) return { path: ICONS.connection, accent: 'bg-cyan-500/20 text-cyan-400' };
	if (t.includes('form') || t.includes('application') || t.includes('pitch')) return { path: ICONS.form, accent: 'bg-amber-500/20 text-amber-400' };
	if (t.includes('team') || t.includes('member') || t.includes('invite') || t.includes('ambassador')) return { path: ICONS.team, accent: 'bg-indigo-500/20 text-indigo-400' };
	if (t.includes('approve') || t.includes('accept') || t.includes('confirm')) return { path: ICONS.check, accent: 'bg-green-500/20 text-green-400' };
	return { path: ICONS.bell, accent: 'bg-[var(--accent-light)] text-[var(--primary)]' };
}

// ─── Component ────────────────────────────────────────────

interface NotificationToastProps {
	toastId: string | number;
	notification: WsNotification;
}

export function NotificationToast({ toastId, notification }: NotificationToastProps) {
	const { path, accent } = getIcon(notification.type);

	function handleClick() {
		toast.dismiss(toastId);
		if (notification.actionUrl) {
			window.location.href = notification.actionUrl;
		}
	}

	function handleDismiss(e: React.MouseEvent) {
		e.stopPropagation();
		toast.dismiss(toastId);
	}

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={(e) => e.key === 'Enter' && handleClick()}
			className={cn(
				'flex items-start gap-3 w-full rounded-xl p-3',
				'bg-(--surface) border border-(--border)',
				'shadow-lg cursor-pointer',
				'transition-opacity duration-200',
				notification.actionUrl && 'hover:bg-(--surface-hover)',
			)}
		>
			{/* Colored icon pill */}
			<div className={cn('shrink-0 rounded-lg p-2 mt-0.5', accent)}>
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d={path} />
				</svg>
			</div>

			{/* Text */}
			<div className="flex-1 min-w-0">
				<p className="text-[13px] font-semibold text-(--primary) leading-snug truncate">
					{notification.title}
				</p>
				{notification.body && (
					<p className="text-[12px] text-(--secondary) mt-0.5 line-clamp-2 leading-snug">
						{notification.body}
					</p>
				)}
			</div>

			{/* Dismiss button */}
			<button
				onClick={handleDismiss}
				className="shrink-0 p-1 rounded-md text-(--secondary) hover:text-(--primary) hover:bg-(--accent-subtle) transition-colors"
				aria-label="Dismiss notification"
			>
				<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d={ICONS.close} />
				</svg>
			</button>
		</div>
	);
}

// ─── Fire notification toast + optional browser notification ─

export function showNotificationToast(n: WsNotification) {
	// In-app Sonner toast (always, even if page is hidden — shows when tab refocused)
	toast.custom(
		(id) => <NotificationToast toastId={id} notification={n} />,
		{
			duration: 6000,
			position: 'top-right',
			unstyled: true,
			classNames: { toast: 'w-[360px] max-w-[calc(100vw-2rem)]' },
		},
	);

	// Browser desktop notification when the tab is in the background
	if (
		typeof document !== 'undefined' &&
		document.hidden &&
		typeof Notification !== 'undefined' &&
		Notification.permission === 'granted'
	) {
		try {
			const browserNotif = new Notification(n.title, {
				body: n.body || undefined,
				icon: '/favicon.ico',
				tag: n.id ?? undefined,        // collapses duplicate notifications of the same id
				requireInteraction: false,
			});

			if (n.actionUrl) {
				browserNotif.onclick = () => {
					window.focus();
					window.location.href = n.actionUrl!;
					browserNotif.close();
				};
			}
		} catch {
			// Browser notifications not available in this context — silently skip
		}
	}
}

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getSessionToken } from '@/lib/auth-utils';

export interface WsNotification {
	id: string | null;
	type: string;
	title: string;
	body: string;
	entityType: string | null;
	entityId: string | null;
	actionUrl: string | null;
	data: Record<string, unknown> | null;
}

interface UseNotificationsOptions {
	/** Called for every incoming WS notification */
	onNotification?: (n: WsNotification) => void;
	/** Auto-connect on mount (default: true) */
	enabled?: boolean;
}

const WS_BASE =
	typeof window !== 'undefined'
		? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000`
		: '';

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000]; // exponential backoff

/**
 * Hook that maintains a WebSocket connection to the notification consumer.
 * Automatically reconnects with exponential backoff on disconnect.
 */
export function useNotifications({ onNotification, enabled = true }: UseNotificationsOptions = {}) {
	const wsRef = useRef<WebSocket | null>(null);
	const retriesRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onNotificationRef = useRef(onNotification);
	const [connected, setConnected] = useState(false);

	// Keep callback ref fresh without re-triggering effect
	useEffect(() => {
		onNotificationRef.current = onNotification;
	}, [onNotification]);

	const connect = useCallback(() => {
		const token = getSessionToken();
		if (!token || !WS_BASE) return;

		// Don't open if one is already connecting/open
		if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
			return;
		}

		const ws = new WebSocket(`${WS_BASE}/ws/notifications/?token=${encodeURIComponent(token)}`);

		ws.onopen = () => {
			retriesRef.current = 0;
			setConnected(true);
		};

		ws.onmessage = (event) => {
			try {
				const payload: WsNotification = JSON.parse(event.data);
				onNotificationRef.current?.(payload);
			} catch {
				// ignore malformed messages
			}
		};

		ws.onclose = (event) => {
			setConnected(false);
			wsRef.current = null;

			// Don't reconnect on intentional close (4001 = auth failure)
			if (event.code === 4001) return;

			// Exponential backoff reconnect
			const delay = RECONNECT_DELAYS[Math.min(retriesRef.current, RECONNECT_DELAYS.length - 1)];
			retriesRef.current += 1;
			timerRef.current = setTimeout(connect, delay);
		};

		ws.onerror = () => {
			// onerror is always followed by onclose, so we just let onclose handle reconnection
		};

		wsRef.current = ws;
	}, []);

	const disconnect = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		if (wsRef.current) {
			wsRef.current.close(1000, 'unmount');
			wsRef.current = null;
		}
		setConnected(false);
	}, []);

	useEffect(() => {
		if (enabled) {
			connect();
		}
		return () => {
			disconnect();
		};
	}, [enabled, connect, disconnect]);

	return { connected, disconnect, reconnect: connect };
}

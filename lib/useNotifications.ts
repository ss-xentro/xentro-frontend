'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

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

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000]; // exponential backoff

/**
 * Returns the WebSocket base URL.
 * Uses NEXT_PUBLIC_WS_URL in production; falls back to ws://localhost:8000.
 */
function getWsBase(): string {
	const envUrl = process.env.NEXT_PUBLIC_WS_URL;
	if (envUrl) return envUrl;
	if (typeof window === 'undefined') return '';
	const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
	return `${proto}://${window.location.hostname}:8000`;
}

/**
 * Fetches a real JWT from the Next.js API route that reads the HttpOnly cookie.
 * WebSocket connections cannot send cookies, so we get a one-time token this way.
 */
async function fetchWsToken(): Promise<string | null> {
	try {
		const res = await fetch('/api/auth/ws-token');
		if (!res.ok) return null;
		const data = await res.json();
		return data.token ?? null;
	} catch {
		return null;
	}
}

/**
 * Hook that maintains a WebSocket connection to the notification consumer.
 * Authenticates via a first-message handshake (same pattern as useChat).
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

	const connect = useCallback(async () => {
		const wsBase = getWsBase();
		if (!wsBase) return;

		// Don't open if one is already connecting/open
		if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
			return;
		}

		const token = await fetchWsToken();
		if (!token) return;

		const ws = new WebSocket(`${wsBase}/ws/notifications/`);

		ws.onopen = () => {
			// First message must be the auth handshake; the consumer ignores URL params
			ws.send(JSON.stringify({ type: 'auth', token }));
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === 'auth_ok') {
					retriesRef.current = 0;
					setConnected(true);
					return;
				}
				onNotificationRef.current?.(data as WsNotification);
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

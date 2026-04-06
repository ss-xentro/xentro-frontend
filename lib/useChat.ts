'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export interface ChatMessage {
	id: string;
	senderId: string;
	body: string;
	sentAt: string;
	readByRecipient: boolean;
}

export interface PresenceInfo {
	isOnline: boolean;
	lastSeen: string | null;
}

export interface ChatRoom {
	id: string;
	booking_id: string;
	mentorId: string;
	mentorName: string;
	mentorAvatar: string | null;
	menteeId: string;
	menteeName: string;
	menteeAvatar: string | null;
	lastMessage: { body: string; sentAt: string; senderId: string } | null;
	unreadCount: number;
	mentorPresence: PresenceInfo;
	menteePresence: PresenceInfo;
	created_at: string;
}

/**
 * WebSocket base URL.
 * In production (Vercel → Railway) set NEXT_PUBLIC_WS_URL in Vercel env vars,
 * e.g. wss://your-backend.up.railway.app
 * In local dev it falls back to the same host on port 8000.
 */
function getWsBase(): string {
	if (typeof window === 'undefined') return '';
	// Explicit override wins (production / staging)
	const envUrl = process.env.NEXT_PUBLIC_WS_URL;
	if (envUrl) return envUrl.replace(/\/$/, '');
	// Local dev fallback
	const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
	return `${proto}://${window.location.hostname}:8000`;
}

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

/** Fetches the JWT from server for WS auth (reads the HttpOnly cookie server-side). */
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

interface UseChatOptions {
	roomId: string | null;
	currentUserId?: string;
	onPresenceUpdate?: (userId: string, isOnline: boolean, lastSeen: string) => void;
}

export function useChat({ roomId, currentUserId, onPresenceUpdate }: UseChatOptions) {
	const wsRef = useRef<WebSocket | null>(null);
	const retriesRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onPresenceRef = useRef(onPresenceUpdate);

	const [connected, setConnected] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [peerTyping, setPeerTyping] = useState(false);

	useEffect(() => {
		onPresenceRef.current = onPresenceUpdate;
	}, [onPresenceUpdate]);

	const connect = useCallback(async () => {
		const wsBase = getWsBase();
		if (!roomId || !wsBase) return;
		if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) return;

		const token = await fetchWsToken();
		if (!token) return;

		const ws = new WebSocket(`${wsBase}/ws/chat/${roomId}/`);

		ws.onopen = () => {
			// First message must be auth handshake
			ws.send(JSON.stringify({ type: 'auth', token }));
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === 'auth_ok') {
					retriesRef.current = 0;
					setConnected(true);
					// Load history from auth_ok
					if (Array.isArray(data.history)) {
						setMessages(
							data.history.map((m: {
								id: string;
								senderId: string;
								body: string;
								sentAt: string;
								readByRecipient: boolean;
							}) => ({
								id: m.id,
								senderId: m.senderId,
								body: m.body,
								sentAt: m.sentAt,
								readByRecipient: m.readByRecipient,
							}))
						);
					}
				} else if (data.type === 'message') {
					setMessages((prev) => {
						// Avoid duplicates
						if (prev.some((m) => m.id === data.id)) return prev;
						return [...prev, {
							id: data.id,
							senderId: data.senderId,
							body: data.body,
							sentAt: data.sentAt,
							readByRecipient: data.readByRecipient ?? false,
						}];
					});
				} else if (data.type === 'typing') {
					if (!currentUserId || data.userId !== currentUserId) {
						setPeerTyping(!!data.isTyping);
					}
				} else if (data.type === 'presence') {
					onPresenceRef.current?.(data.userId, data.isOnline, data.lastSeen);
				}
			} catch {
				// ignore malformed frames
			}
		};

		ws.onclose = (event) => {
			setConnected(false);
			wsRef.current = null;
			if (event.code === 4001 || event.code === 4003) return; // auth failure — don't retry
			const delay = RECONNECT_DELAYS[Math.min(retriesRef.current, RECONNECT_DELAYS.length - 1)];
			retriesRef.current += 1;
			timerRef.current = setTimeout(() => connect(), delay);
		};

		ws.onerror = () => { /* handled by onclose */ };
		wsRef.current = ws;
	}, [roomId]);

	const disconnect = useCallback(() => {
		if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
		if (wsRef.current) { wsRef.current.close(1000, 'unmount'); wsRef.current = null; }
		setConnected(false);
	}, []);

	useEffect(() => {
		if (roomId) connect();
		return () => disconnect();
	}, [roomId, connect, disconnect]);

	const sendMessage = useCallback((body: string) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
		wsRef.current.send(JSON.stringify({ type: 'message', body }));
	}, []);

	const sendTyping = useCallback((isTyping: boolean) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
		wsRef.current.send(JSON.stringify({ type: 'typing', isTyping }));
	}, []);

	const markRead = useCallback(() => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
		wsRef.current.send(JSON.stringify({ type: 'read' }));
	}, []);

	return { connected, messages, peerTyping, sendMessage, sendTyping, markRead };
}

/** Fetches all chat rooms for the current user via REST. */
export async function fetchChatRooms(): Promise<ChatRoom[]> {
	const res = await fetch('/api/chat/rooms/', { cache: 'no-store' });
	if (!res.ok) return [];
	return res.json();
}

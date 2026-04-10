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
	participant1Id: string;
	participant1Name: string;
	participant1Avatar: string | null;
	participant2Id: string;
	participant2Name: string;
	participant2Avatar: string | null;
	lastMessage: { body: string; sentAt: string; senderId: string } | null;
	unreadCount: number;
	participant1Presence: PresenceInfo;
	participant2Presence: PresenceInfo;
	isRequest: boolean;
	requestSenderId: string | null;
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
		if (!res.ok) {
			console.warn('[useChat] ws-token fetch failed:', res.status);
			return null;
		}
		const data = await res.json();
		return data.token ?? null;
	} catch (err) {
		console.warn('[useChat] ws-token fetch error:', err);
		return null;
	}
}

interface UseChatOptions {
	roomId: string | null;
	currentUserId?: string;
	onPresenceUpdate?: (userId: string, isOnline: boolean, lastSeen: string) => void;
	onNewMessage?: (roomId: string, message: { body: string; sentAt: string; senderId: string }) => void;
}

export function useChat({ roomId, currentUserId, onPresenceUpdate, onNewMessage }: UseChatOptions) {
	const wsRef = useRef<WebSocket | null>(null);
	const retriesRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onPresenceRef = useRef(onPresenceUpdate);
	const onNewMessageRef = useRef(onNewMessage);

	const [connected, setConnected] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [peerTyping, setPeerTyping] = useState(false);

	useEffect(() => {
		onPresenceRef.current = onPresenceUpdate;
	}, [onPresenceUpdate]);

	useEffect(() => {
		onNewMessageRef.current = onNewMessage;
	}, [onNewMessage]);

	const connect = useCallback(async () => {
		const wsBase = getWsBase();
		if (!roomId || !wsBase) return;
		if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) return;

		const token = await fetchWsToken();
		if (!token) {
			// Retry with exponential backoff (token may not be available yet)
			const delay = RECONNECT_DELAYS[Math.min(retriesRef.current, RECONNECT_DELAYS.length - 1)];
			retriesRef.current += 1;
			timerRef.current = setTimeout(() => connect(), delay);
			return;
		}

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
					const msg = {
						id: data.id,
						senderId: data.senderId,
						body: data.body,
						sentAt: data.sentAt,
						readByRecipient: data.readByRecipient ?? false,
					};
					setMessages((prev) => {
						if (prev.some((m) => m.id === data.id)) return prev;
						return [...prev, msg];
					});
					if (roomId) {
						onNewMessageRef.current?.(roomId, { body: msg.body, sentAt: msg.sentAt, senderId: msg.senderId });
					}
				} else if (data.type === 'read_receipt') {
					// Sender receives notification that their messages were read
					if (currentUserId && data.readerId !== currentUserId) {
						setMessages((prev) =>
							prev.map((m) =>
								m.senderId === currentUserId && !m.readByRecipient
									? { ...m, readByRecipient: true }
									: m,
							),
						);
					}
				} else if (data.type === 'typing') {
					if (!currentUserId || data.userId !== currentUserId) {
						setPeerTyping(!!data.isTyping);
						// Auto-clear typing after 4s in case the sender disconnects
						if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
						if (data.isTyping) {
							typingTimeoutRef.current = setTimeout(() => setPeerTyping(false), 4000);
						}
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
		if (typingTimeoutRef.current) { clearTimeout(typingTimeoutRef.current); typingTimeoutRef.current = null; }
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

/**
 * Create or retrieve a chat room with a mutual follower.
 * Returns the ChatRoom or throws on failure.
 */
export async function createOrGetRoom(targetUserId: string): Promise<ChatRoom> {
	const res = await fetch('/api/chat/rooms/create/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ target_user_id: targetUserId }),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error((err as { error?: string }).error ?? 'Failed to create chat room');
	}
	return res.json();
}

/** Fetches pending message requests received by the current user. */
export async function fetchMessageRequests(): Promise<ChatRoom[]> {
	const res = await fetch('/api/chat/rooms/requests/', { cache: 'no-store' });
	if (!res.ok) return [];
	return res.json();
}

/** Accept a message request. */
export async function acceptMessageRequest(roomId: string): Promise<ChatRoom> {
	const res = await fetch(`/api/chat/rooms/${roomId}/accept/`, { method: 'POST' });
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error((err as { error?: string }).error ?? 'Failed to accept request');
	}
	return res.json();
}

/** Decline (delete) a message request. */
export async function declineMessageRequest(roomId: string): Promise<void> {
	const res = await fetch(`/api/chat/rooms/${roomId}/decline/`, { method: 'POST' });
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error((err as { error?: string }).error ?? 'Failed to decline request');
	}
}

/** Fetch users the current user follows, with isMutual flag. */
export async function fetchFollowingWithStatus(): Promise<
	Array<{ id: string; name: string; email: string; avatar: string | null; activeContext: string | null; isMutual: boolean }>
> {
	const res = await fetch('/api/following-with-status/', { cache: 'no-store' });
	if (!res.ok) return [];
	const data = await res.json();
	return data.users ?? [];
}

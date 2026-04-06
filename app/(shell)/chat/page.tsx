'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, fetchChatRooms, createOrGetRoom, type ChatRoom, type ChatMessage, type PresenceInfo } from '@/lib/useChat';
import { AppIcon } from '@/components/ui/AppIcon';

/* ─── helpers ─── */

interface MutualUser {
	id: string;
	name: string;
	avatar: string | null;
	activeContext: string | null;
}

async function fetchMutualFollowers(): Promise<MutualUser[]> {
	try {
		const res = await fetch('/api/mutual-followers/', { cache: 'no-store' });
		if (!res.ok) return [];
		const data = await res.json();
		return data.mutuals ?? [];
	} catch {
		return [];
	}
}

function formatTime(iso: string) {
	const d = new Date(iso);
	return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatLastSeen(iso: string | null) {
	if (!iso) return 'offline';
	const d = new Date(iso);
	const diff = Date.now() - d.getTime();
	if (diff < 60_000) return 'just now';
	if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
	if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
	return d.toLocaleDateString();
}

function Avatar({ name, avatar, size = 'w-10 h-10' }: { name: string; avatar: string | null; size?: string }) {
	const [imgError, setImgError] = useState(false);
	const initials = name
		.split(' ')
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? '')
		.join('');
	if (avatar && !imgError) {
		return (
			<img
				src={avatar}
				alt={name}
				className={cn(size, 'rounded-full object-cover shrink-0')}
				onError={() => setImgError(true)}
			/>
		);
	}
	return (
		<div
			className={cn(
				size,
				'rounded-full bg-(--accent-light) flex items-center justify-center shrink-0',
			)}
		>
			<span className="text-sm font-semibold text-(--primary)">{initials}</span>
		</div>
	);
}

/* ─── New Chat Modal ─── */
function NewChatModal({
	onClose,
	onRoomCreated,
}: {
	onClose: () => void;
	onRoomCreated: (room: ChatRoom) => void;
}) {
	const [mutuals, setMutuals] = useState<MutualUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState('');

	useEffect(() => {
		fetchMutualFollowers().then((data) => {
			setMutuals(data);
			setLoading(false);
		});
	}, []);

	const filtered = mutuals.filter((u) =>
		u.name.toLowerCase().includes(search.toLowerCase()),
	);

	const handleStart = async (userId: string) => {
		setCreating(userId);
		setError(null);
		try {
			const room = await createOrGetRoom(userId);
			onRoomCreated(room);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to start chat');
		} finally {
			setCreating(null);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
			<div className="relative bg-(--surface) rounded-t-2xl sm:rounded-2xl w-full sm:w-96 max-h-[70vh] flex flex-col shadow-xl">
				<div className="flex items-center gap-3 px-4 py-4 border-b border-(--border)">
					<h2 className="flex-1 text-base font-semibold text-(--foreground)">New Message</h2>
					<button onClick={onClose} className="text-(--secondary) hover:text-(--foreground)">
						<AppIcon name="x" className="w-5 h-5" />
					</button>
				</div>

				<div className="px-4 py-2 border-b border-(--border)">
					<div className="flex items-center gap-2 bg-(--accent-subtle) rounded-xl px-3 py-2">
						<AppIcon name="search" className="w-4 h-4 text-(--secondary) shrink-0" />
						<input
							autoFocus
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search people…"
							className="flex-1 bg-transparent text-sm text-(--foreground) placeholder:text-(--secondary-light) focus:outline-none"
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<AppIcon name="loader-2" className="w-6 h-6 animate-spin text-(--secondary)" />
						</div>
					) : filtered.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 gap-2 text-(--secondary) text-sm px-6 text-center">
							<AppIcon name="users" className="w-8 h-8 opacity-30" />
							<p>{search ? 'No results found.' : 'No mutual followers yet. Follow someone and wait for them to follow back.'}</p>
						</div>
					) : (
						filtered.map((user) => (
							<button
								key={user.id}
								disabled={creating === user.id}
								onClick={() => handleStart(user.id)}
								className="w-full flex items-center gap-3 px-4 py-3 hover:bg-(--accent-subtle) transition-colors disabled:opacity-60"
							>
								<Avatar name={user.name} avatar={user.avatar} size="w-10 h-10" />
								<div className="flex-1 text-left min-w-0">
									<p className="text-sm font-medium text-(--foreground) truncate">{user.name}</p>
									{user.activeContext && (
										<p className="text-xs text-(--secondary) capitalize truncate">{user.activeContext}</p>
									)}
								</div>
								{creating === user.id ? (
									<AppIcon name="loader-2" className="w-4 h-4 animate-spin text-(--secondary)" />
								) : (
									<AppIcon name="message-circle" className="w-4 h-4 text-(--secondary)" />
								)}
							</button>
						))
					)}
				</div>

				{error && (
					<div className="px-4 py-3 border-t border-(--border)">
						<p className="text-xs text-red-500">{error}</p>
					</div>
				)}
			</div>
		</div>
	);
}

/* ─── Room list item ─── */
function RoomListItem({
	room,
	isActive,
	currentUserId,
	onClick,
	presence,
}: {
	room: ChatRoom;
	isActive: boolean;
	currentUserId: string;
	onClick: () => void;
	presence: PresenceInfo;
}) {
	const isP1 = room.participant1Id === currentUserId;
	const peerName = isP1 ? room.participant2Name : room.participant1Name;
	const peerAvatar = isP1 ? room.participant2Avatar : room.participant1Avatar;

	return (
		<button
			onClick={onClick}
			className={cn(
				'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-(--accent-subtle)',
				isActive && 'bg-(--accent-light)',
			)}
		>
			<div className="relative shrink-0">
				<Avatar name={peerName} avatar={peerAvatar} size="w-11 h-11" />
				{presence.isOnline && (
					<span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-(--surface)" />
				)}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between">
					<span className="font-semibold text-sm text-(--foreground) truncate">{peerName}</span>
					{room.lastMessage && (
						<span className="text-xs text-(--secondary) shrink-0 ml-1">
							{formatTime(room.lastMessage.sentAt)}
						</span>
					)}
				</div>
				<div className="flex items-center justify-between mt-0.5">
					<span className="text-xs text-(--secondary) truncate">
						{room.lastMessage ? room.lastMessage.body : 'No messages yet'}
					</span>
					{room.unreadCount > 0 && (
						<span className="ml-1 shrink-0 bg-(--brand) text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
							{room.unreadCount > 9 ? '9+' : room.unreadCount}
						</span>
					)}
				</div>
			</div>
		</button>
	);
}

/* ─── Bubble ─── */
function MessageBubble({ msg, isMine }: { msg: ChatMessage; isMine: boolean }) {
	return (
		<div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
			<div
				className={cn(
					'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
					isMine
						? 'bg-(--brand) text-white rounded-br-sm'
						: 'bg-(--accent-light) text-(--foreground) rounded-bl-sm',
				)}
			>
				<p className="wrap-break-word">{msg.body}</p>
				<div className={cn('flex items-center gap-1 mt-1 justify-end', isMine ? 'text-white/70' : 'text-(--secondary)')}>
					<span className="text-[10px]">{formatTime(msg.sentAt)}</span>
					{isMine && (
						<AppIcon
							name={msg.readByRecipient ? 'check-check' : 'check'}
							className="w-3 h-3"
						/>
					)}
				</div>
			</div>
		</div>
	);
}

/* ─── Chat panel ─── */
function ChatPanel({
	room,
	currentUserId,
}: {
	room: ChatRoom;
	currentUserId: string;
}) {
	const router = useRouter();
	const [input, setInput] = useState('');
	const [peerPresence, setPeerPresence] = useState<PresenceInfo>(
		room.participant1Id === currentUserId ? room.participant2Presence : room.participant1Presence,
	);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const isP1 = room.participant1Id === currentUserId;
	const peerName = isP1 ? room.participant2Name : room.participant1Name;
	const peerAvatar = isP1 ? room.participant2Avatar : room.participant1Avatar;
	const peerId = isP1 ? room.participant2Id : room.participant1Id;

	const handlePresence = useCallback(
		(userId: string, isOnline: boolean, lastSeen: string) => {
			if (userId === peerId) {
				setPeerPresence({ isOnline, lastSeen });
			}
		},
		[peerId],
	);

	const { connected, messages, peerTyping, sendMessage, sendTyping, markRead } = useChat({
		roomId: room.id,
		currentUserId,
		onPresenceUpdate: handlePresence,
	});

	// Mark as read when messages arrive
	useEffect(() => {
		if (connected && messages.length > 0) {
			markRead();
		}
	}, [connected, messages.length, markRead]);

	// Auto-scroll
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, peerTyping]);

	const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		sendTyping(true);
		if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
		typingTimerRef.current = setTimeout(() => sendTyping(false), 1500);
	};

	const handleSend = () => {
		const trimmed = input.trim();
		if (!trimmed || !connected) return;
		sendMessage(trimmed);
		setInput('');
		if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
		sendTyping(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center gap-3 px-4 py-3 border-b border-(--border) bg-(--surface)">
				<button
					className="md:hidden mr-1 text-(--secondary) hover:text-(--foreground)"
					onClick={() => router.push('/chat')}
				>
					<AppIcon name="arrow-left" className="w-5 h-5" />
				</button>
				<div className="relative">
					<Avatar name={peerName} avatar={peerAvatar} size="w-10 h-10" />
					{peerPresence.isOnline && (
						<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-(--surface)" />
					)}
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-semibold text-sm text-(--foreground) truncate">{peerName}</p>
					<p className="text-xs text-(--secondary)">
						{peerPresence.isOnline
							? 'Online'
							: `Last seen ${formatLastSeen(peerPresence.lastSeen)}`}
					</p>
				</div>
				{!connected && (
					<span className="text-xs text-amber-500 flex items-center gap-1">
						<AppIcon name="wifi-off" className="w-3.5 h-3.5" /> Reconnecting…
					</span>
				)}
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 bg-(--surface)">
				{messages.length === 0 && (
					<div className="flex flex-col items-center justify-center h-full text-(--secondary) text-sm gap-2">
						<AppIcon name="message-circle" className="w-10 h-10 opacity-30" />
						<p>No messages yet. Say hello!</p>
					</div>
				)}
				{messages.map((msg) => (
					<MessageBubble key={msg.id} msg={msg} isMine={msg.senderId === currentUserId} />
				))}
				{peerTyping && (
					<div className="flex justify-start">
						<div className="bg-(--accent-light) rounded-2xl rounded-bl-sm px-4 py-2">
							<span className="text-xs text-(--secondary) italic">{peerName} is typing…</span>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="px-4 py-3 border-t border-(--border) bg-(--surface) flex items-end gap-2">
				<textarea
					value={input}
					onChange={handleInput}
					onKeyDown={handleKeyDown}
					rows={1}
					placeholder="Type a message…"
					className="flex-1 resize-none rounded-2xl border border-(--border) bg-background text-(--foreground) px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--brand)/30 max-h-32 overflow-y-auto"
				/>
				<button
					onClick={handleSend}
					disabled={!input.trim() || !connected}
					className={cn(
						'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all',
						input.trim() && connected
							? 'bg-(--brand) text-white hover:opacity-90'
							: 'bg-(--accent-subtle) text-(--secondary-light) cursor-not-allowed',
					)}
				>
					<AppIcon name="send" className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}

/* ─── Main page ─── */
export default function ChatPage() {
	const { user } = useAuth();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [rooms, setRooms] = useState<ChatRoom[]>([]);
	const [loading, setLoading] = useState(true);
	const [presenceMap, setPresenceMap] = useState<Record<string, PresenceInfo>>({});
	const [showNewChat, setShowNewChat] = useState(false);

	const roomIdParam = searchParams.get('room');
	const activeRoom = rooms.find((r) => r.id === roomIdParam) ?? null;

	useEffect(() => {
		fetchChatRooms().then((data) => {
			setRooms(data);
			setLoading(false);
			// If no room selected and rooms exist, auto-select first on desktop
			if (!roomIdParam && data.length > 0) {
				// Only auto-select on wide viewport (handled by CSS, just pre-load)
			}
		});
	}, [roomIdParam]);

	const handlePresenceUpdate = useCallback((userId: string, isOnline: boolean, lastSeen: string) => {
		setPresenceMap((prev) => ({ ...prev, [userId]: { isOnline, lastSeen } }));
		// Also update rooms so the list reflects live presence
		setRooms((prev) =>
			prev.map((r) => {
				if (r.participant1Id === userId) return { ...r, participant1Presence: { isOnline, lastSeen } };
				if (r.participant2Id === userId) return { ...r, participant2Presence: { isOnline, lastSeen } };
				return r;
			}),
		);
	}, []);

	const currentUserId = user?.id ?? '';

	const handleRoomCreated = useCallback((room: ChatRoom) => {
		setRooms((prev) => {
			const exists = prev.find((r) => r.id === room.id);
			if (exists) return prev;
			return [room, ...prev];
		});
		setShowNewChat(false);
		router.push(`/chat?room=${room.id}`);
	}, [router]);

	const getPeerPresence = (room: ChatRoom): PresenceInfo => {
		const isP1 = room.participant1Id === currentUserId;
		const peerId = isP1 ? room.participant2Id : room.participant1Id;
		return presenceMap[peerId] ?? (isP1 ? room.participant2Presence : room.participant1Presence);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full text-(--secondary)">
				<AppIcon name="loader-2" className="w-6 h-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-4rem)] md:h-full overflow-hidden bg-background">
			{/* Sidebar — room list */}
			<div
				className={cn(
					'flex-col border-r border-(--border) bg-(--surface)',
					'w-full md:w-80 md:flex',
					activeRoom ? 'hidden md:flex' : 'flex',
				)}
			>
				<div className="px-4 py-3 border-b border-(--border) flex items-center justify-between">
					<h1 className="text-lg font-semibold text-(--foreground)">Messages</h1>
					<button
						onClick={() => setShowNewChat(true)}
						className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-(--accent-subtle) text-(--secondary) hover:text-(--foreground) transition-colors"
						title="New message"
					>
						<AppIcon name="pencil" className="w-4 h-4" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto">
					{rooms.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-60 gap-3 text-(--secondary) text-sm px-6 text-center">
							<AppIcon name="message-circle" className="w-10 h-10 opacity-30" />
							<p>No chats yet. Follow someone and when they follow you back, you can start chatting.</p>
						</div>
					) : (
						rooms.map((room) => (
							<RoomListItem
								key={room.id}
								room={room}
								isActive={room.id === roomIdParam}
								currentUserId={currentUserId}
								presence={getPeerPresence(room)}
								onClick={() => router.push(`/chat?room=${room.id}`)}
							/>
						))
					)}
				</div>
			</div>

			{/* Main chat area */}
			<div
				className={cn(
					'flex-1',
					activeRoom ? 'flex flex-col' : 'hidden md:flex md:flex-col',
				)}
			>
				{activeRoom ? (
					<ChatPanel
						room={activeRoom}
						currentUserId={currentUserId}
					/>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-(--secondary) gap-3">
						<AppIcon name="message-circle" className="w-14 h-14 opacity-20" />
						<p className="text-sm">Select a conversation to start chatting</p>
						<button
							onClick={() => setShowNewChat(true)}
							className="mt-2 px-4 py-2 rounded-xl bg-(--brand) text-white text-sm font-medium hover:opacity-90 transition-opacity"
						>
							Start a new chat
						</button>
					</div>
				)}
			</div>

			{showNewChat && (
				<NewChatModal
					onClose={() => setShowNewChat(false)}
					onRoomCreated={handleRoomCreated}
				/>
			)}
		</div>
	);
}

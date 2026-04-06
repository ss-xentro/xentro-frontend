'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
	useChat,
	fetchChatRooms,
	createOrGetRoom,
	fetchMessageRequests,
	acceptMessageRequest,
	declineMessageRequest,
	fetchFollowingWithStatus,
	type ChatRoom,
	type ChatMessage,
	type PresenceInfo,
} from '@/lib/useChat';
import { AppIcon } from '@/components/ui/AppIcon';

/* ─── helpers ─── */

interface FollowingUser {
	id: string;
	name: string;
	avatar: string | null;
	activeContext: string | null;
	isMutual: boolean;
}

/* (fetchFollowingWithStatus is imported from useChat) */

function formatTime(iso: string) {
	return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMessageDate(iso: string): string {
	const d = new Date(iso);
	const now = new Date();
	const diff = now.getTime() - d.getTime();
	const isToday = d.toDateString() === now.toDateString();
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	const isYesterday = d.toDateString() === yesterday.toDateString();

	if (isToday) return 'Today';
	if (isYesterday) return 'Yesterday';
	if (diff < 7 * 86_400_000) return d.toLocaleDateString([], { weekday: 'long' });
	return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: now.getFullYear() !== d.getFullYear() ? 'numeric' : undefined });
}

function formatRoomDate(iso: string): string {
	const d = new Date(iso);
	const now = new Date();
	const isToday = d.toDateString() === now.toDateString();
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	const isYesterday = d.toDateString() === yesterday.toDateString();

	if (isToday) return formatTime(iso);
	if (isYesterday) return 'Yesterday';
	const diff = now.getTime() - d.getTime();
	if (diff < 7 * 86_400_000) return d.toLocaleDateString([], { weekday: 'short' });
	return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
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

function shouldShowDateSeparator(current: ChatMessage, previous?: ChatMessage): boolean {
	if (!previous) return true;
	return new Date(current.sentAt).toDateString() !== new Date(previous.sentAt).toDateString();
}

function isSameSenderGroup(current: ChatMessage, previous?: ChatMessage): boolean {
	if (!previous) return false;
	if (current.senderId !== previous.senderId) return false;
	const diff = new Date(current.sentAt).getTime() - new Date(previous.sentAt).getTime();
	return diff < 120_000;
}

/* ─── Avatar ─── */
function Avatar({
	name,
	avatar,
	size = 'w-10 h-10',
	textSize = 'text-sm',
}: {
	name: string;
	avatar: string | null;
	size?: string;
	textSize?: string;
}) {
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
		<div className={cn(size, 'rounded-full bg-linear-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center shrink-0')}>
			<span className={cn(textSize, 'font-semibold text-(--primary)')}>{initials}</span>
		</div>
	);
}

/* ─── New Chat Modal ─── */
function NewChatModal({
	onClose,
	onRoomCreated,
	existingPeerIds,
}: {
	onClose: () => void;
	onRoomCreated: (room: ChatRoom) => void;
	existingPeerIds: Set<string>;
}) {
	const [users, setUsers] = useState<FollowingUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState('');

	useEffect(() => {
		fetchFollowingWithStatus().then((data) => {
			setUsers(data as FollowingUser[]);
			setLoading(false);
		});
	}, []);

	const filtered = users.filter((u) =>
		u.name.toLowerCase().includes(search.toLowerCase()),
	);

	const sorted = useMemo(() => {
		return [...filtered].sort((a, b) => {
			const aHasChat = existingPeerIds.has(a.id);
			const bHasChat = existingPeerIds.has(b.id);
			if (aHasChat !== bHasChat) return aHasChat ? 1 : -1;
			// Mutuals first, then non-mutuals
			if (a.isMutual !== b.isMutual) return a.isMutual ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
	}, [filtered, existingPeerIds]);

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
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
			<div className="relative bg-(--surface) rounded-t-2xl sm:rounded-2xl w-full sm:w-105 max-h-[70vh] flex flex-col shadow-2xl border border-(--border)">
				<div className="flex items-center gap-3 px-5 py-4 border-b border-(--border)">
					<h2 className="flex-1 text-base font-semibold text-(--foreground)">New Message</h2>
					<button
						onClick={onClose}
						className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-(--accent-subtle) text-(--secondary) hover:text-(--foreground) transition-colors"
					>
						<AppIcon name="x" className="w-4 h-4" />
					</button>
				</div>

				<div className="px-4 py-3">
					<div className="flex items-center gap-2 bg-(--accent-subtle) rounded-xl px-3 py-2.5">
						<AppIcon name="search" className="w-4 h-4 text-(--secondary) shrink-0" />
						<input
							autoFocus
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search people…"
							className="flex-1 bg-transparent text-sm text-(--foreground) placeholder:text-(--secondary-light) focus:outline-none"
						/>
						{search && (
							<button onClick={() => setSearch('')} className="text-(--secondary) hover:text-(--foreground)">
								<AppIcon name="x" className="w-3.5 h-3.5" />
							</button>
						)}
					</div>
				</div>

				<div className="flex-1 overflow-y-auto pb-2">
					{loading ? (
						<div className="flex items-center justify-center py-16">
							<AppIcon name="loader-2" className="w-5 h-5 animate-spin text-(--secondary)" />
						</div>
					) : sorted.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 gap-2 text-(--secondary) text-sm px-6 text-center">
							<AppIcon name="users" className="w-8 h-8 opacity-30" />
							<p className="font-medium">{search ? 'No results' : 'Not following anyone yet'}</p>
							<p className="text-xs text-(--secondary-light)">
								{search ? 'Try a different search term.' : 'Follow someone to send them a message or message request.'}
							</p>
						</div>
					) : (
						sorted.map((user) => {
							const hasChat = existingPeerIds.has(user.id);
							return (
								<button
									key={user.id}
									disabled={creating === user.id}
									onClick={() => handleStart(user.id)}
									className="w-full flex items-center gap-3 px-5 py-3 hover:bg-(--accent-subtle) transition-colors disabled:opacity-60"
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
									) : hasChat ? (
										<span className="text-[10px] text-(--secondary-light) bg-(--accent-subtle) px-2 py-0.5 rounded-full">Existing</span>
									) : !user.isMutual ? (
										<span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">Request</span>
									) : (
										<AppIcon name="message-circle" className="w-4 h-4 text-brand" />
									)}
								</button>
							);
						})
					)}
				</div>

				{error && (
					<div className="px-5 py-3 border-t border-(--border) bg-red-500/5">
						<p className="text-xs text-red-400">{error}</p>
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
	const isMySender = room.lastMessage?.senderId === currentUserId;

	return (
		<button
			onClick={onClick}
			className={cn(
				'w-full flex items-center gap-3 px-4 py-3 text-left transition-all',
				isActive
					? 'bg-(--accent-light) border-l-2 border-l-brand'
					: 'hover:bg-(--accent-subtle) border-l-2 border-l-transparent',
			)}
		>
			<div className="relative shrink-0">
				<Avatar name={peerName} avatar={peerAvatar} size="w-11 h-11" />
				{presence.isOnline && (
					<span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-(--surface) ring-2 ring-(--surface)" />
				)}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between gap-2">
					<span className={cn(
						'text-sm truncate',
						room.unreadCount > 0 ? 'font-bold text-(--foreground)' : 'font-semibold text-(--foreground)',
					)}>
						{peerName}
					</span>
					{room.lastMessage && (
						<span className={cn(
							'text-[11px] shrink-0',
							room.unreadCount > 0 ? 'text-brand font-medium' : 'text-(--secondary)',
						)}>
							{formatRoomDate(room.lastMessage.sentAt)}
						</span>
					)}
				</div>
				<div className="flex items-center justify-between gap-2 mt-0.5">
					<span className={cn(
						'text-xs truncate',
						room.unreadCount > 0 ? 'text-(--foreground) font-medium' : 'text-(--secondary)',
					)}>
						{room.lastMessage
							? `${isMySender ? 'You: ' : ''}${room.lastMessage.body}`
							: 'No messages yet'}
					</span>
					{room.unreadCount > 0 && (
						<span className="ml-1 shrink-0 bg-brand text-white text-[10px] font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
							{room.unreadCount > 99 ? '99+' : room.unreadCount}
						</span>
					)}
				</div>
			</div>
		</button>
	);
}

/* ─── Date separator ─── */
function DateSeparator({ date }: { date: string }) {
	return (
		<div className="flex items-center gap-3 py-3">
			<div className="flex-1 h-px bg-(--border)" />
			<span className="text-[11px] font-medium text-(--secondary) px-2 py-0.5 rounded-full bg-(--accent-subtle)">
				{formatMessageDate(date)}
			</span>
			<div className="flex-1 h-px bg-(--border)" />
		</div>
	);
}

/* ─── Message bubble ─── */
function MessageBubble({
	msg,
	isMine,
	isGrouped,
}: {
	msg: ChatMessage;
	isMine: boolean;
	isGrouped: boolean;
}) {
	return (
		<div className={cn(
			'flex',
			isMine ? 'justify-end' : 'justify-start',
			isGrouped ? 'mt-0.5' : 'mt-2.5',
		)}>
			<div
				className={cn(
					'max-w-[75%] sm:max-w-[65%] px-3.5 py-2 text-sm leading-relaxed',
					isMine
						? cn(
							'bg-brand text-white',
							isGrouped ? 'rounded-2xl rounded-tr-lg' : 'rounded-2xl rounded-br-lg',
						)
						: cn(
							'bg-(--accent-light) text-(--foreground)',
							isGrouped ? 'rounded-2xl rounded-tl-lg' : 'rounded-2xl rounded-bl-lg',
						),
				)}
			>
				<p className="wrap-break-word whitespace-pre-wrap">{msg.body}</p>
				<div className={cn(
					'flex items-center gap-1 mt-0.5 justify-end',
					isMine ? 'text-white/60' : 'text-(--secondary)',
				)}>
					<span className="text-[10px]">{formatTime(msg.sentAt)}</span>
					{isMine && (
						<AppIcon
							name={msg.readByRecipient ? 'check-check' : 'check'}
							className={cn('w-3.5 h-3.5', msg.readByRecipient && 'text-sky-200')}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

/* ─── Typing indicator ─── */
function TypingIndicator({ name }: { name: string }) {
	return (
		<div className="flex justify-start mt-2">
			<div className="bg-(--accent-light) rounded-2xl rounded-bl-lg px-4 py-2.5 flex items-center gap-2">
				<div className="flex gap-1">
					<span className="w-1.5 h-1.5 rounded-full bg-(--secondary) animate-bounce [animation-delay:0ms]" />
					<span className="w-1.5 h-1.5 rounded-full bg-(--secondary) animate-bounce [animation-delay:150ms]" />
					<span className="w-1.5 h-1.5 rounded-full bg-(--secondary) animate-bounce [animation-delay:300ms]" />
				</div>
				<span className="text-xs text-(--secondary)">{name}</span>
			</div>
		</div>
	);
}

/* ─── Chat panel ─── */
function ChatPanel({
	room,
	currentUserId,
	onNewMessage,
	onAcceptRequest,
	onDeclineRequest,
	acceptingId,
	decliningId,
}: {
	room: ChatRoom;
	currentUserId: string;
	onNewMessage?: (roomId: string, message: { body: string; sentAt: string; senderId: string }) => void;
	onAcceptRequest?: (roomId: string) => void;
	onDeclineRequest?: (roomId: string) => void;
	acceptingId?: string | null;
	decliningId?: string | null;
}) {
	const router = useRouter();
	const [input, setInput] = useState('');
	const [peerPresence, setPeerPresence] = useState<PresenceInfo>(
		room.participant1Id === currentUserId ? room.participant2Presence : room.participant1Presence,
	);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [showScrollBtn, setShowScrollBtn] = useState(false);

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
		onNewMessage,
	});

	useEffect(() => {
		if (connected && messages.length > 0) {
			markRead();
		}
	}, [connected, messages.length, markRead]);

	useEffect(() => {
		const container = messagesContainerRef.current;
		if (!container) return;
		const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
		if (isNearBottom) {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages, peerTyping]);

	const handleScroll = useCallback(() => {
		const container = messagesContainerRef.current;
		if (!container) return;
		const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
		setShowScrollBtn(!isNearBottom);
	}, []);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
	}, [room.id]);

	const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		const ta = textareaRef.current;
		if (ta) {
			ta.style.height = 'auto';
			ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
		}
		sendTyping(true);
		if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
		typingTimerRef.current = setTimeout(() => sendTyping(false), 1500);
	};

	const handleSend = () => {
		const trimmed = input.trim();
		if (!trimmed || !connected) return;
		sendMessage(trimmed);
		setInput('');
		if (textareaRef.current) textareaRef.current.style.height = 'auto';
		if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
		sendTyping(false);
		requestAnimationFrame(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		});
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
			<div className="flex items-center gap-3 px-4 py-3 border-b border-(--border) bg-(--surface)/80 backdrop-blur-sm">
				<button
					className="md:hidden mr-1 p-1 rounded-lg text-(--secondary) hover:text-(--foreground) hover:bg-(--accent-subtle) transition-colors"
					onClick={() => router.push('/chat')}
				>
					<AppIcon name="arrow-left" className="w-5 h-5" />
				</button>
				<div className="relative">
					<Avatar name={peerName} avatar={peerAvatar} size="w-10 h-10" />
					{peerPresence.isOnline && (
						<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-(--surface)" />
					)}
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-semibold text-sm text-(--foreground) truncate">{peerName}</p>
					<p className="text-xs text-(--secondary)">
						{peerPresence.isOnline ? (
							<span className="text-emerald-400">Online</span>
						) : (
							`Last seen ${formatLastSeen(peerPresence.lastSeen)}`
						)}
					</p>
				</div>
				{!connected && (
					<span className="text-xs text-amber-500 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full">
						<AppIcon name="wifi-off" className="w-3 h-3" /> Reconnecting…
					</span>
				)}
			</div>

			{/* Messages */}
			<div
				ref={messagesContainerRef}
				onScroll={handleScroll}
				className="flex-1 overflow-y-auto px-4 py-3 bg-(--surface) relative"
			>
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-(--secondary) text-sm gap-3">
						<div className="w-16 h-16 rounded-full bg-(--accent-subtle) flex items-center justify-center">
							<AppIcon name="message-circle" className="w-8 h-8 opacity-40" />
						</div>
						<div className="text-center">
							<p className="font-medium">No messages yet</p>
							<p className="text-xs text-(--secondary-light) mt-1">
								Send a message to start the conversation with {peerName}
							</p>
						</div>
					</div>
				) : (
					messages.map((msg, i) => {
						const prev = messages[i - 1];
						const showDate = shouldShowDateSeparator(msg, prev);
						const isGrouped = !showDate && isSameSenderGroup(msg, prev);

						return (
							<div key={msg.id}>
								{showDate && <DateSeparator date={msg.sentAt} />}
								<MessageBubble
									msg={msg}
									isMine={msg.senderId === currentUserId}
									isGrouped={isGrouped}
								/>
							</div>
						);
					})
				)}
				{peerTyping && <TypingIndicator name={peerName} />}
				<div ref={messagesEndRef} />

				{showScrollBtn && (
					<button
						onClick={scrollToBottom}
						className="sticky bottom-2 left-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-(--surface) border border-(--border) shadow-lg flex items-center justify-center hover:bg-(--accent-subtle) transition-all"
					>
						<AppIcon name="chevron-down" className="w-5 h-5 text-(--secondary)" />
					</button>
				)}
			</div>

			{/* Input */}
			{room.isRequest && room.requestSenderId !== currentUserId ? (
				/* Recipient sees accept/decline bar instead of input */
				<div className="px-4 py-3 border-t border-(--border) bg-amber-500/5">
					<p className="text-xs text-(--secondary) text-center mb-2.5">
						<span className="font-medium text-(--foreground)">{isP1 ? room.participant2Name : room.participant1Name}</span> wants to send you a message
					</p>
					<div className="flex gap-2 justify-center">
						<button
							onClick={() => onAcceptRequest?.(room.id)}
							disabled={acceptingId === room.id}
							className="flex-1 max-w-32 py-2 text-sm font-medium rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-60"
						>
							{acceptingId === room.id ? 'Accepting…' : 'Accept'}
						</button>
						<button
							onClick={() => onDeclineRequest?.(room.id)}
							disabled={decliningId === room.id}
							className="flex-1 max-w-32 py-2 text-sm font-medium rounded-xl bg-(--accent-subtle) text-(--secondary) hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-60"
						>
							{decliningId === room.id ? 'Declining…' : 'Decline'}
						</button>
					</div>
				</div>
			) : room.isRequest && room.requestSenderId === currentUserId ? (
				/* Sender sees a pending notice */
				<div className="px-4 py-3 border-t border-(--border) bg-amber-500/5">
					<p className="text-xs text-(--secondary) text-center">
						Message request sent. Waiting for <span className="font-medium text-(--foreground)">{peerName}</span> to accept.
					</p>
				</div>
			) : (
				<div className="px-4 py-3 border-t border-(--border) bg-(--surface)">
					<div className="flex items-end gap-2">
						<textarea
							ref={textareaRef}
							value={input}
							onChange={handleInput}
							onKeyDown={handleKeyDown}
							rows={1}
							placeholder="Type a message…"
							className="flex-1 resize-none rounded-2xl border border-(--border) bg-background text-(--foreground) px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-(--brand)/50 max-h-32 overflow-y-auto transition-all"
						/>
						<button
							onClick={handleSend}
							disabled={!input.trim() || !connected}
							className={cn(
								'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all',
								input.trim() && connected
									? 'bg-brand text-white hover:opacity-90 shadow-md shadow-brand/20'
									: 'bg-accent-subtle text-secondary-light cursor-not-allowed',
							)}
						>
							<AppIcon name="send" className="w-4 h-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

/* ─── Main page ─── */
export default function ChatPage() {
	const { user } = useAuth();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [rooms, setRooms] = useState<ChatRoom[]>([]);
	const [requests, setRequests] = useState<ChatRoom[]>([]);
	const [loading, setLoading] = useState(true);
	const [presenceMap, setPresenceMap] = useState<Record<string, PresenceInfo>>({});
	const [showNewChat, setShowNewChat] = useState(false);
	const [sidebarSearch, setSidebarSearch] = useState('');
	const [tab, setTab] = useState<'chats' | 'requests'>('chats');
	const [acceptingId, setAcceptingId] = useState<string | null>(null);
	const [decliningId, setDecliningId] = useState<string | null>(null);

	const roomIdParam = searchParams.get('room');
	const allRooms = [...rooms, ...requests];
	const activeRoom = allRooms.find((r) => r.id === roomIdParam) ?? null;

	const sortedRooms = useMemo(() => {
		return [...rooms].sort((a, b) => {
			const aTime = a.lastMessage?.sentAt ?? a.created_at;
			const bTime = b.lastMessage?.sentAt ?? b.created_at;
			return new Date(bTime).getTime() - new Date(aTime).getTime();
		});
	}, [rooms]);

	const filteredRooms = useMemo(() => {
		if (!sidebarSearch.trim()) return sortedRooms;
		const q = sidebarSearch.toLowerCase();
		return sortedRooms.filter((r) => {
			const isP1 = r.participant1Id === (user?.id ?? '');
			const peerName = isP1 ? r.participant2Name : r.participant1Name;
			return peerName.toLowerCase().includes(q);
		});
	}, [sortedRooms, sidebarSearch, user?.id]);

	const existingPeerIds = useMemo(() => {
		const ids = new Set<string>();
		const uid = user?.id ?? '';
		for (const r of [...rooms, ...requests]) {
			ids.add(r.participant1Id === uid ? r.participant2Id : r.participant1Id);
		}
		return ids;
	}, [rooms, requests, user?.id]);

	useEffect(() => {
		Promise.all([fetchChatRooms(), fetchMessageRequests()]).then(([roomsData, reqsData]) => {
			setRooms(roomsData);
			setRequests(reqsData);
			setLoading(false);
		});
	}, []);

	useEffect(() => {
		if (!roomIdParam) {
			Promise.all([fetchChatRooms(), fetchMessageRequests()]).then(([roomsData, reqsData]) => {
				setRooms(roomsData);
				setRequests(reqsData);
			});
		}
	}, [roomIdParam]);

	const handlePresenceUpdate = useCallback((userId: string, isOnline: boolean, lastSeen: string) => {
		setPresenceMap((prev) => ({ ...prev, [userId]: { isOnline, lastSeen } }));
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
		if (room.isRequest) {
			setRequests((prev) => {
				const exists = prev.find((r) => r.id === room.id);
				if (exists) return prev;
				return [room, ...prev];
			});
			setTab('requests');
		} else {
			setRooms((prev) => {
				const exists = prev.find((r) => r.id === room.id);
				if (exists) return prev;
				return [room, ...prev];
			});
		}
		setShowNewChat(false);
		router.push(`/chat?room=${room.id}`);
	}, [router]);

	const handleAcceptRequest = useCallback(async (roomId: string) => {
		setAcceptingId(roomId);
		try {
			const updatedRoom = await acceptMessageRequest(roomId);
			setRequests((prev) => prev.filter((r) => r.id !== roomId));
			setRooms((prev) => [updatedRoom, ...prev]);
		} catch {
			// fail silently
		} finally {
			setAcceptingId(null);
		}
	}, []);

	const handleDeclineRequest = useCallback(async (roomId: string) => {
		setDecliningId(roomId);
		try {
			await declineMessageRequest(roomId);
			setRequests((prev) => prev.filter((r) => r.id !== roomId));
			if (roomIdParam === roomId) {
				router.push('/chat');
			}
		} catch {
			// fail silently
		} finally {
			setDecliningId(null);
		}
	}, [roomIdParam, router]);

	const handleNewMessage = useCallback((roomId: string, message: { body: string; sentAt: string; senderId: string }) => {
		setRooms((prev) =>
			prev.map((r) =>
				r.id === roomId ? { ...r, lastMessage: message } : r,
			),
		);
	}, []);

	const getPeerPresence = (room: ChatRoom): PresenceInfo => {
		const isP1 = room.participant1Id === currentUserId;
		const peerId = isP1 ? room.participant2Id : room.participant1Id;
		return presenceMap[peerId] ?? (isP1 ? room.participant2Presence : room.participant1Presence);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full text-(--secondary)">
				<div className="flex flex-col items-center gap-3">
					<AppIcon name="loader-2" className="w-6 h-6 animate-spin" />
					<span className="text-sm">Loading conversations…</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-4rem)] md:h-full overflow-hidden bg-background">
			{/* Sidebar */}
			<div
				className={cn(
					'flex-col border-r border-(--border) bg-(--surface)',
					'w-full md:w-80 lg:w-96 md:flex',
					activeRoom ? 'hidden md:flex' : 'flex',
				)}
			>
				<div className="px-4 py-3 border-b border-(--border)">
					<div className="flex items-center justify-between mb-3">
						<h1 className="text-lg font-bold text-(--foreground)">Messages</h1>
						<button
							onClick={() => setShowNewChat(true)}
							className="w-8 h-8 flex items-center justify-center rounded-full bg-(--accent-subtle) hover:bg-(--accent-light) text-(--secondary) hover:text-(--foreground) transition-colors"
							title="New message"
						>
							<AppIcon name="pencil" className="w-4 h-4" />
						</button>
					</div>
					{/* Tab switcher */}
					<div className="flex gap-1 bg-(--accent-subtle) rounded-xl p-1 mb-3">
						<button
							onClick={() => setTab('chats')}
							className={cn(
								'flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors',
								tab === 'chats'
									? 'bg-(--surface) text-(--foreground) shadow-sm'
									: 'text-(--secondary) hover:text-(--foreground)',
							)}
						>
							Chats
						</button>
						<button
							onClick={() => setTab('requests')}
							className={cn(
								'flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors relative',
								tab === 'requests'
									? 'bg-(--surface) text-(--foreground) shadow-sm'
									: 'text-(--secondary) hover:text-(--foreground)',
							)}
						>
							Requests
							{requests.length > 0 && (
								<span className="ml-1.5 inline-flex items-center justify-center min-w-4 h-4 text-[10px] font-bold bg-amber-500 text-white rounded-full px-1">
									{requests.length}
								</span>
							)}
						</button>
					</div>
					{rooms.length > 3 && (
						<div className="flex items-center gap-2 bg-(--accent-subtle) rounded-xl px-3 py-2">
							<AppIcon name="search" className="w-3.5 h-3.5 text-(--secondary) shrink-0" />
							<input
								value={sidebarSearch}
								onChange={(e) => setSidebarSearch(e.target.value)}
								placeholder="Search conversations…"
								className="flex-1 bg-transparent text-sm text-(--foreground) placeholder:text-(--secondary-light) focus:outline-none"
							/>
							{sidebarSearch && (
								<button onClick={() => setSidebarSearch('')} className="text-(--secondary) hover:text-(--foreground)">
									<AppIcon name="x" className="w-3 h-3" />
								</button>
							)}
						</div>
					)}
				</div>

				<div className="flex-1 overflow-y-auto">
					{tab === 'chats' ? (
						filteredRooms.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-60 gap-3 text-(--secondary) text-sm px-6 text-center">
								{sidebarSearch ? (
									<>
										<AppIcon name="search" className="w-8 h-8 opacity-30" />
										<p>No conversations match your search</p>
									</>
								) : (
									<>
										<div className="w-14 h-14 rounded-full bg-(--accent-subtle) flex items-center justify-center">
											<AppIcon name="message-circle" className="w-7 h-7 opacity-30" />
										</div>
										<div>
											<p className="font-medium text-(--foreground)">No conversations yet</p>
											<p className="text-xs text-(--secondary-light) mt-1">
												Follow someone to start a conversation or send a message request.
											</p>
										</div>
										<button
											onClick={() => setShowNewChat(true)}
											className="mt-1 px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
										>
											Start a conversation
										</button>
									</>
								)}
							</div>
						) : (
							filteredRooms.map((room) => (
								<RoomListItem
									key={room.id}
									room={room}
									isActive={room.id === roomIdParam}
									currentUserId={currentUserId}
									presence={getPeerPresence(room)}
									onClick={() => router.push(`/chat?room=${room.id}`)}
								/>
							))
						)
					) : (
						requests.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-60 gap-3 text-(--secondary) text-sm px-6 text-center">
								<div className="w-14 h-14 rounded-full bg-(--accent-subtle) flex items-center justify-center">
									<AppIcon name="mail" className="w-7 h-7 opacity-30" />
								</div>
								<div>
									<p className="font-medium text-(--foreground)">No message requests</p>
									<p className="text-xs text-(--secondary-light) mt-1">
										When someone you don&apos;t follow sends you a message, it will appear here.
									</p>
								</div>
							</div>
						) : (
							requests.map((room) => {
								const isP1 = room.participant1Id === currentUserId;
								const peerName = isP1 ? room.participant2Name : room.participant1Name;
								const peerAvatar = isP1 ? room.participant2Avatar : room.participant1Avatar;
								return (
									<div
										key={room.id}
										className={cn(
											'flex items-center gap-3 px-4 py-3 transition-all cursor-pointer',
											room.id === roomIdParam
												? 'bg-(--accent-light) border-l-2 border-l-amber-500'
												: 'hover:bg-(--accent-subtle) border-l-2 border-l-transparent',
										)}
										onClick={() => router.push(`/chat?room=${room.id}`)}
									>
										<Avatar name={peerName} avatar={peerAvatar} size="w-11 h-11" />
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-(--foreground) truncate">{peerName}</p>
											<p className="text-xs text-(--secondary) truncate">
												{room.lastMessage?.body ?? 'Message request'}
											</p>
										</div>
										<div className="flex gap-1.5 shrink-0">
											<button
												onClick={(e) => { e.stopPropagation(); handleAcceptRequest(room.id); }}
												disabled={acceptingId === room.id}
												className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-60"
											>
												{acceptingId === room.id ? '…' : 'Accept'}
											</button>
											<button
												onClick={(e) => { e.stopPropagation(); handleDeclineRequest(room.id); }}
												disabled={decliningId === room.id}
												className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-(--accent-subtle) text-(--secondary) hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-60"
											>
												{decliningId === room.id ? '…' : 'Decline'}
											</button>
										</div>
									</div>
								);
							})
						)
					)}
				</div>
			</div>

			{/* Main chat area */}
			<div
				className={cn(
					'flex-1 min-w-0',
					activeRoom ? 'flex flex-col' : 'hidden md:flex md:flex-col',
				)}
			>
				{activeRoom ? (
					<ChatPanel
						room={activeRoom}
						currentUserId={currentUserId}
						onNewMessage={handleNewMessage}
						onAcceptRequest={handleAcceptRequest}
						onDeclineRequest={handleDeclineRequest}
						acceptingId={acceptingId}
						decliningId={decliningId}
					/>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-(--secondary) gap-4">
						<div className="w-20 h-20 rounded-full bg-(--accent-subtle) flex items-center justify-center">
							<AppIcon name="message-circle" className="w-10 h-10 opacity-20" />
						</div>
						<div className="text-center">
							<p className="text-base font-medium text-(--foreground)">Your messages</p>
							<p className="text-sm text-(--secondary-light) mt-1 max-w-xs">
								Select a conversation from the sidebar or start a new one
							</p>
						</div>
						<button
							onClick={() => setShowNewChat(true)}
							className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-md shadow-brand/10"
						>
							New message
						</button>
					</div>
				)}
			</div>

			{showNewChat && (
				<NewChatModal
					onClose={() => setShowNewChat(false)}
					onRoomCreated={handleRoomCreated}
					existingPeerIds={existingPeerIds}
				/>
			)}
		</div>
	);
}

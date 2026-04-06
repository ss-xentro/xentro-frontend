'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, fetchChatRooms, type ChatRoom, type ChatMessage, type PresenceInfo } from '@/lib/useChat';
import { AppIcon } from '@/components/ui/AppIcon';

/* ─── helpers ─── */

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
	const isMentor = room.mentorId === currentUserId;
	const peerName = isMentor ? room.menteeName : room.mentorName;
	const peerAvatar = isMentor ? room.menteeAvatar : room.mentorAvatar;

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
		room.mentorId === currentUserId ? room.menteePresence : room.mentorPresence,
	);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const isMentor = room.mentorId === currentUserId;
	const peerName = isMentor ? room.menteeName : room.mentorName;
	const peerAvatar = isMentor ? room.menteeAvatar : room.mentorAvatar;
	const peerId = isMentor ? room.menteeId : room.mentorId;

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
				if (r.mentorId === userId) return { ...r, mentorPresence: { isOnline, lastSeen } };
				if (r.menteeId === userId) return { ...r, menteePresence: { isOnline, lastSeen } };
				return r;
			}),
		);
	}, []);

	const currentUserId = user?.id ?? '';

	const getPeerPresence = (room: ChatRoom): PresenceInfo => {
		const isMentor = room.mentorId === currentUserId;
		const peerId = isMentor ? room.menteeId : room.mentorId;
		return presenceMap[peerId] ?? (isMentor ? room.menteePresence : room.mentorPresence);
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
				<div className="px-4 py-3 border-b border-(--border)">
					<h1 className="text-lg font-semibold text-(--foreground)">Messages</h1>
				</div>

				<div className="flex-1 overflow-y-auto">
					{rooms.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-60 gap-3 text-(--secondary) text-sm px-6 text-center">
							<AppIcon name="message-circle" className="w-10 h-10 opacity-30" />
							<p>No chats yet. Book a session with a mentor to start chatting once it&apos;s confirmed.</p>
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
					</div>
				)}
			</div>
		</div>
	);
}

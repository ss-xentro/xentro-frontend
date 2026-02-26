'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSessionToken } from '@/lib/auth-utils';

interface ConnectionRequest {
	id: string;
	mentor: string;
	requester: string;
	requester_name: string;
	mentor_user_name: string;
	mentor_user_email: string;
	message: string;
	status: string;
	created_at: string;
	responded_at: string | null;
}

interface Booking {
	id: string;
	mentor_user: string;
	mentorName: string | null;
	menteeName: string | null;
	scheduledDate: string;
	slotDay: string | null;
	slotStart: string | null;
	slotEnd: string | null;
	status: string;
	notes: string | null;
	created_at: string;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
	pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pending' },
	accepted: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Connected' },
	rejected: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Declined' },
};

const BOOKING_STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
	pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pending' },
	confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Confirmed' },
	cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Cancelled' },
	completed: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Completed' },
};

export default function MyMentorsPage() {
	const [connections, setConnections] = useState<ConnectionRequest[]>([]);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState<'connections' | 'bookings'>('connections');
	const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
	const [cancellingId, setCancellingId] = useState<string | null>(null);

	useEffect(() => {
		loadData();
	}, []);

	async function loadData() {
		const token = getSessionToken();
		if (!token) return;

		try {
			setLoading(true);
			const [connRes, bookRes] = await Promise.all([
				fetch('/api/mentor-connections/', {
					headers: { Authorization: `Bearer ${token}` },
				}),
				fetch('/api/mentor-bookings/', {
					headers: { Authorization: `Bearer ${token}` },
				}),
			]);

			if (connRes.ok) {
				const json = await connRes.json();
				setConnections(json.data ?? []);
			}
			if (bookRes.ok) {
				const json = await bookRes.json();
				setBookings(json.data ?? []);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}

	async function cancelBooking(bookingId: string) {
		const token = getSessionToken();
		if (!token) return;
		setCancellingId(bookingId);
		try {
			const res = await fetch('/api/mentor-bookings/', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ bookingId, status: 'cancelled' }),
			});
			if (res.ok) {
				setBookings((prev) =>
					prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
				);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setCancellingId(null);
		}
	}

	const filteredConns = filter === 'all' ? connections : connections.filter((c) => c.status === filter);
	const pendingCount = connections.filter((c) => c.status === 'pending').length;
	const acceptedCount = connections.filter((c) => c.status === 'accepted').length;
	const upcomingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-(--primary)">My Mentors</h1>
					<p className="text-sm text-(--secondary) mt-1">
						{acceptedCount > 0
							? `${acceptedCount} connected mentor${acceptedCount > 1 ? 's' : ''}`
							: 'Manage your mentor connections and session bookings'}
					</p>
				</div>
				<Link
					href="/explore/mentors"
					className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors"
				>
					<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					Find Mentors
				</Link>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 bg-(--surface) border border-(--border) rounded-xl p-1">
				{(['connections', 'bookings'] as const).map((t) => (
					<button
						key={t}
						onClick={() => setTab(t)}
						className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${tab === t
								? 'bg-(--background) text-(--primary) shadow-sm'
								: 'text-(--secondary) hover:text-(--primary)'
							}`}
					>
						{t === 'connections' ? 'Connections' : 'Bookings'}
						{t === 'connections' && pendingCount > 0 && (
							<span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
								{pendingCount}
							</span>
						)}
						{t === 'bookings' && upcomingBookings.length > 0 && (
							<span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-accent text-white rounded-full">
								{upcomingBookings.length}
							</span>
						)}
					</button>
				))}
			</div>

			{/* Loading */}
			{loading && (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-20 bg-(--surface) border border-(--border) rounded-xl animate-pulse" />
					))}
				</div>
			)}

			{/* ── CONNECTIONS TAB ── */}
			{!loading && tab === 'connections' && (
				<>
					{/* Filter */}
					<div className="flex gap-2">
						{(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === f
										? 'bg-accent/10 text-accent border border-accent/30'
										: 'bg-(--surface) text-(--secondary) border border-(--border) hover:bg-(--surface-hover)'
									}`}
							>
								{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
							</button>
						))}
					</div>

					{filteredConns.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="w-14 h-14 rounded-full bg-(--surface) flex items-center justify-center text-2xl mb-3">
								🧠
							</div>
							<h3 className="text-base font-semibold text-(--primary) mb-1">No connections yet</h3>
							<p className="text-sm text-(--secondary) mb-4">
								Browse mentors on the explore page and send connection requests.
							</p>
							<Link
								href="/explore/mentors"
								className="text-sm text-accent hover:underline"
							>
								Explore Mentors →
							</Link>
						</div>
					) : (
						<div className="space-y-3">
							{filteredConns.map((conn) => {
								const badge = STATUS_BADGE[conn.status] || STATUS_BADGE.pending;
								return (
									<div
										key={conn.id}
										className="flex items-start gap-4 p-4 bg-(--surface) border border-(--border) rounded-xl hover:border-(--border-hover) transition-colors"
									>
										{/* Avatar */}
										<div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold shrink-0">
											{conn.mentor_user_name?.charAt(0).toUpperCase() || 'M'}
										</div>

										{/* Info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between gap-3">
												<div className="min-w-0">
													<p className="text-sm font-semibold text-(--primary) truncate">
														{conn.mentor_user_name || 'Mentor'}
													</p>
													<p className="text-xs text-(--secondary) truncate">
														{conn.mentor_user_email}
													</p>
												</div>
												<span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
													{badge.label}
												</span>
											</div>

											{conn.message && (
												<p className="text-xs text-(--secondary) mt-1.5 line-clamp-2 italic">
													&ldquo;{conn.message}&rdquo;
												</p>
											)}

											<div className="flex items-center gap-4 mt-2.5">
												<span className="text-xs text-(--secondary)">
													Sent {new Date(conn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
												</span>
												{conn.responded_at && (
													<span className="text-xs text-(--secondary)">
														Responded {new Date(conn.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
													</span>
												)}
											</div>

											{/* Actions */}
											{conn.status === 'accepted' && (
												<div className="mt-3 flex gap-2">
													<Link
														href={`/explore/mentors/${conn.mentor}`}
														className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
													>
														<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
															<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
														Book Session
													</Link>
													<Link
														href={`/explore/mentors/${conn.mentor}`}
														className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-(--border) text-(--secondary) hover:text-(--primary) hover:border-(--border-hover) transition-colors"
													>
														View Profile
													</Link>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</>
			)}

			{/* ── BOOKINGS TAB ── */}
			{!loading && tab === 'bookings' && (
				<>
					{bookings.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="w-14 h-14 rounded-full bg-(--surface) flex items-center justify-center text-2xl mb-3">
								📅
							</div>
							<h3 className="text-base font-semibold text-(--primary) mb-1">No sessions booked</h3>
							<p className="text-sm text-(--secondary) mb-4">
								Once you connect with a mentor you can book sessions from their profile.
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{bookings.map((booking) => {
								const badge = BOOKING_STATUS_BADGE[booking.status] || BOOKING_STATUS_BADGE.pending;
								const sched = new Date(booking.scheduledDate);
								return (
									<div
										key={booking.id}
										className="flex items-start gap-4 p-4 bg-(--surface) border border-(--border) rounded-xl hover:border-(--border-hover) transition-colors"
									>
										{/* Date badge */}
										<div className="w-14 h-14 rounded-xl bg-accent/10 flex flex-col items-center justify-center shrink-0">
											<span className="text-xs font-medium text-accent">
												{sched.toLocaleDateString('en-US', { month: 'short' })}
											</span>
											<span className="text-lg font-bold text-accent leading-tight">
												{sched.getDate()}
											</span>
										</div>

										{/* Info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between gap-3">
												<div className="min-w-0">
													<p className="text-sm font-semibold text-(--primary) truncate">
														Session with {booking.mentorName || 'Mentor'}
													</p>
													<p className="text-xs text-(--secondary)">
														{sched.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
														{booking.slotStart && booking.slotEnd && (
															<> · {booking.slotStart} - {booking.slotEnd}</>
														)}
													</p>
												</div>
												<span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
													{badge.label}
												</span>
											</div>

											{booking.notes && (
												<p className="text-xs text-(--secondary) mt-1.5 line-clamp-1">
													{booking.notes}
												</p>
											)}

											{/* Cancel action for pending/confirmed bookings */}
											{(booking.status === 'pending' || booking.status === 'confirmed') && (
												<div className="mt-2.5">
													<button
														onClick={() => cancelBooking(booking.id)}
														disabled={cancellingId === booking.id}
														className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
													>
														{cancellingId === booking.id ? 'Cancelling...' : 'Cancel Session'}
													</button>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</>
			)}
		</div>
	);
}

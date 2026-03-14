'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface Event {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	type: string | null;
	startTime: string | null;
	endTime: string | null;
	isVirtual: boolean;
	availableSlots: number | null;
	remainingSlots: number | null;
	attendeeCount: number;
	institutionName: string | null;
	organizerName: string | null;
	currentUserRsvp?: 'going' | 'maybe' | 'not_going' | null;
	approved: boolean;
	createdAt: string;
}

export default function PublicEventsPage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchEvents();
	}, []);

	const fetchEvents = async () => {
		try {
			const token = getSessionToken();
			const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
			const res = await fetch('/api/events/', { headers });
			if (!res.ok) throw new Error('Failed to fetch events');
			const data = await res.json();
			setEvents(data.events || data.data || []);
		} catch {
			// silently fail for public page
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return null;
		const d = new Date(dateStr);
		return {
			month: d.toLocaleDateString('en-US', { month: 'short' }),
			day: d.getDate(),
			time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
		};
	};

	const isUpcoming = (startTime: string | null) => {
		if (!startTime) return true;
		return new Date(startTime) > new Date();
	};

	const upcomingEvents = events.filter((e) => isUpcoming(e.startTime));
	const pastEvents = events.filter((e) => !isUpcoming(e.startTime));

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
			<div className="flex items-start justify-between gap-4 flex-wrap">
				<div>
					<h1 className="text-3xl font-bold text-(--primary)">Events</h1>
					<p className="text-(--secondary) mt-1">
						Discover and book events from institutions and Xentro admin.
					</p>
				</div>
				<Link href="/events/my-bookings">
					<Button variant="ghost">My Bookings</Button>
				</Link>
			</div>

			{loading ? (
				<div className="grid gap-4 md:grid-cols-2">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-48 rounded-xl bg-(--surface) animate-pulse" />
					))}
				</div>
			) : events.length === 0 ? (
				<div className="text-center py-20">
					<p className="text-lg text-(--secondary)">No events scheduled yet.</p>
				</div>
			) : (
				<>
					{upcomingEvents.length > 0 && (
						<section className="space-y-4">
							<h2 className="text-lg font-semibold text-(--primary)">Now Showing</h2>
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{upcomingEvents.map((event) => {
									const start = formatDate(event.startTime);
									const isBooked = event.currentUserRsvp === 'going';
									return (
										<Link key={event.id} href={`/events/${event.id}`}>
											<Card className="p-5 bg-(--surface) border-(--border) hover:bg-(--surface-hover) transition-colors space-y-3 h-full">
												<div className="flex gap-4">
													{start && (
														<div className="flex-shrink-0 w-14 h-14 rounded-lg bg-accent/10 flex flex-col items-center justify-center">
															<span className="text-[10px] uppercase text-accent font-semibold">{start.month}</span>
															<span className="text-lg font-bold text-(--primary) leading-tight">{start.day}</span>
														</div>
													)}
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between gap-2">
															<h3 className="font-semibold text-(--primary) truncate">{event.name}</h3>
															{isBooked && (
																<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">Booked</span>
															)}
														</div>
														<p className="text-xs text-(--secondary) mt-1">by {event.organizerName || (event.institutionName || 'Xentro')}</p>
														<div className="flex items-center gap-2 mt-1 text-xs text-(--secondary)">
															{start && <span>{start.time}</span>}
															{event.location && (
																<>
																	<span>·</span>
																	<span>{event.location}</span>
																</>
															)}
															{event.isVirtual && (
																<span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Online</span>
															)}
														</div>
													</div>
												</div>
												{event.description && <p className="text-sm text-(--secondary) line-clamp-2">{event.description}</p>}
												<div className="flex items-center justify-between pt-2 border-t border-(--border)">
													<span className="text-xs text-(--secondary)">
														{event.remainingSlots != null ? `${event.remainingSlots} slots left` : 'Unlimited slots'}
													</span>
													<span className="text-sm font-medium text-accent">View details</span>
												</div>
											</Card>
										</Link>
									);
								})}
							</div>
						</section>
					)}

					{pastEvents.length > 0 && (
						<section className="space-y-4">
							<h2 className="text-lg font-semibold text-(--secondary)">Past Events</h2>
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{pastEvents.map((event) => {
									const start = formatDate(event.startTime);
									return (
										<Link key={event.id} href={`/events/${event.id}`}>
											<Card className="p-5 bg-(--surface) border-(--border) opacity-70 space-y-2 h-full">
												<div className="flex gap-4">
													{start && (
														<div className="flex-shrink-0 w-14 h-14 rounded-lg bg-(--surface-hover) flex flex-col items-center justify-center">
															<span className="text-[10px] uppercase text-(--secondary) font-semibold">
																{start.month}
															</span>
															<span className="text-lg font-bold text-(--primary) leading-tight">
																{start.day}
															</span>
														</div>
													)}
													<div className="flex-1 min-w-0">
														<h3 className="font-semibold text-(--primary) truncate">{event.name}</h3>
														<p className="text-xs text-(--secondary) mt-0.5">{event.attendeeCount} attended</p>
													</div>
												</div>
											</Card>
										</Link>
									);
								})}
							</div>
						</section>
					)}
				</>
			)}
		</div>
	);
}

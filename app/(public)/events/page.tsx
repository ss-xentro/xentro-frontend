'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/ui/AppShell';
import { Card } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { cn } from '@/lib/utils';

interface Event {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	type: string | null;
	startTime: string | null;
	endTime: string | null;
	isVirtual: boolean;
	maxAttendees: number | null;
	attendeeCount: number;
	createdAt: string;
}

export default function PublicEventsPage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

	useEffect(() => {
		fetchEvents();
	}, []);

	const fetchEvents = async () => {
		try {
			const res = await fetch('/api/events/');
			if (!res.ok) throw new Error('Failed to fetch events');
			const data = await res.json();
			setEvents(data.events || data.data || []);
		} catch {
			// silently fail for public page
		} finally {
			setLoading(false);
		}
	};

	const handleRsvp = async (eventId: string) => {
		const token = getSessionToken();
		if (!token) {
			window.location.href = '/login';
			return;
		}

		setRsvpLoading(eventId);
		try {
			const res = await fetch(`/api/events/${eventId}/rsvp/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ status: 'going' }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				alert(data.message || 'RSVP failed');
				return;
			}
			// Refresh to show updated attendee count
			fetchEvents();
		} catch {
			alert('Failed to RSVP');
		} finally {
			setRsvpLoading(null);
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
		<AppShell>
			<div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-white">Events</h1>
					<p className="text-gray-400 mt-1">
						Discover upcoming events from institutions and the startup community.
					</p>
				</div>

				{loading ? (
					<div className="grid gap-4 md:grid-cols-2">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />
						))}
					</div>
				) : events.length === 0 ? (
					<div className="text-center py-20">
						<p className="text-lg text-gray-400">No events scheduled yet.</p>
					</div>
				) : (
					<>
						{upcomingEvents.length > 0 && (
							<section className="space-y-4">
								<h2 className="text-lg font-semibold text-white">Upcoming</h2>
								<div className="grid gap-4 md:grid-cols-2">
									{upcomingEvents.map((event) => {
										const start = formatDate(event.startTime);
										return (
											<Card
												key={event.id}
												className="p-5 bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors space-y-3"
											>
												<div className="flex gap-4">
													{start && (
														<div className="flex-shrink-0 w-14 h-14 rounded-lg bg-accent/10 flex flex-col items-center justify-center">
															<span className="text-[10px] uppercase text-accent font-semibold">
																{start.month}
															</span>
															<span className="text-lg font-bold text-white leading-tight">
																{start.day}
															</span>
														</div>
													)}
													<div className="flex-1 min-w-0">
														<h3 className="font-semibold text-white truncate">
															{event.name}
														</h3>
														<div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
															{start && <span>{start.time}</span>}
															{event.location && (
																<>
																	<span>·</span>
																	<span>{event.location}</span>
																</>
															)}
															{event.isVirtual && (
																<span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
																	Virtual
																</span>
															)}
														</div>
													</div>
												</div>

												{event.description && (
													<p className="text-sm text-gray-400 line-clamp-2">
														{event.description}
													</p>
												)}

												<div className="flex items-center justify-between pt-2 border-t border-white/5">
													<span className="text-xs text-gray-500">
														{event.attendeeCount} attendee{event.attendeeCount !== 1 ? 's' : ''}
														{event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
													</span>
													<button
														onClick={() => handleRsvp(event.id)}
														disabled={rsvpLoading === event.id}
														className={cn(
															'px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
															'bg-accent/10 text-accent hover:bg-accent/20',
															'disabled:opacity-50'
														)}
													>
														{rsvpLoading === event.id ? 'Saving…' : 'RSVP'}
													</button>
												</div>
											</Card>
										);
									})}
								</div>
							</section>
						)}

						{pastEvents.length > 0 && (
							<section className="space-y-4">
								<h2 className="text-lg font-semibold text-gray-400">Past Events</h2>
								<div className="grid gap-4 md:grid-cols-2">
									{pastEvents.map((event) => {
										const start = formatDate(event.startTime);
										return (
											<Card
												key={event.id}
												className="p-5 bg-white/[0.02] border-white/5 opacity-70 space-y-2"
											>
												<div className="flex gap-4">
													{start && (
														<div className="flex-shrink-0 w-14 h-14 rounded-lg bg-white/5 flex flex-col items-center justify-center">
															<span className="text-[10px] uppercase text-gray-500 font-semibold">
																{start.month}
															</span>
															<span className="text-lg font-bold text-gray-300 leading-tight">
																{start.day}
															</span>
														</div>
													)}
													<div className="flex-1 min-w-0">
														<h3 className="font-semibold text-gray-300 truncate">
															{event.name}
														</h3>
														<p className="text-xs text-gray-500 mt-0.5">
															{event.attendeeCount} attended
														</p>
													</div>
												</div>
											</Card>
										);
									})}
								</div>
							</section>
						)}
					</>
				)}
			</div>
		</AppShell>
	);
}

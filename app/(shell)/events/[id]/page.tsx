'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, FeedbackBanner } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

interface EventDetail {
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
	currentUserRsvp: 'going' | 'maybe' | 'not_going' | 'waitlist' | 'cancelled' | null;
	approved: boolean;
}

interface CalendarLinks {
	google?: string;
	outlook?: string;
	ics?: string;
}

function formatDateTime(value: string | null): string {
	if (!value) return 'TBA';
	return new Date(value).toLocaleString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export default function EventDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const eventId = params?.id;

	const [eventData, setEventData] = useState<EventDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [holding, setHolding] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [cancelling, setCancelling] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [holdId, setHoldId] = useState<string | null>(null);
	const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
	const [holdSecondsLeft, setHoldSecondsLeft] = useState(0);
	const [calendarLinks, setCalendarLinks] = useState<CalendarLinks | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		if (!eventId) return;
		let mounted = true;

		setLoading(true);
		fetch(`/api/events/${eventId}/`)
			.then(async (res) => {
				if (!res.ok) throw new Error('Failed to load event details');
				return res.json();
			})
			.then((data) => {
				if (!mounted) return;
				setEventData(data);
			})
			.catch((err) => {
				if (!mounted) return;
				setError(err instanceof Error ? err.message : 'Failed to load event details');
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [eventId]);

	useEffect(() => {
		if (!holdExpiresAt) {
			setHoldSecondsLeft(0);
			return;
		}

		const tick = () => {
			const secs = Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000));
			setHoldSecondsLeft(secs);
			if (secs <= 0) {
				setHoldId(null);
				setHoldExpiresAt(null);
			}
		};

		tick();
		const timer = setInterval(tick, 1000);
		return () => clearInterval(timer);
	}, [holdExpiresAt]);

	const seatsLabel = useMemo(() => {
		if (!eventData) return '—';
		if (eventData.remainingSlots == null) return 'Unlimited slots';
		return `${eventData.remainingSlots} slots left`;
	}, [eventData]);

	const refreshEvent = async () => {
		if (!eventData) return;
		const res = await fetch(`/api/events/${eventData.id}/`);
		if (res.ok) {
			setEventData(await res.json());
		}
	};

	const handleHold = async () => {
		if (!eventData) return;
		const token = getSessionToken();
		if (!token) {
			router.push('/login');
			return;
		}

		setHolding(true);
		setError(null);
		setSuccess(null);

		try {
			const res = await fetch(`/api/events/${eventData.id}/hold/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ quantity }),
			});
			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(payload.message || 'Seat hold failed');
			}

			setHoldId(payload.holdId || null);
			setHoldExpiresAt(payload.expiresAt || null);
			setSuccess('Seats reserved. Complete checkout before the hold expires.');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Seat hold failed');
		} finally {
			setHolding(false);
		}
	};

	const handleConfirmHold = async () => {
		if (!eventData || !holdId) return;
		const token = getSessionToken();
		if (!token) {
			router.push('/login');
			return;
		}

		setConfirming(true);
		setError(null);
		setSuccess(null);

		try {
			const res = await fetch(`/api/events/${eventData.id}/confirm-hold/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ holdId }),
			});
			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(payload.message || 'Booking confirmation failed');
			}

			setCalendarLinks(payload.calendarLinks || null);
			setHoldId(null);
			setHoldExpiresAt(null);
			setSuccess(
				eventData.isVirtual
					? 'Booking confirmed. Confirmation details were sent to your email.'
					: 'Booking confirmed. Check your email for the entry QR code.'
			);
			await refreshEvent();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Booking confirmation failed');
		} finally {
			setConfirming(false);
		}
	};

	const handleCancelBooking = async () => {
		if (!eventData) return;
		const token = getSessionToken();
		if (!token) {
			router.push('/login');
			return;
		}

		setCancelling(true);
		setError(null);
		setSuccess(null);

		try {
			const res = await fetch(`/api/events/${eventData.id}/cancel/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});
			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(payload.message || 'Cancellation failed');
			}

			setSuccess(payload.message || 'Booking cancelled');
			setCalendarLinks(null);
			await refreshEvent();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Cancellation failed');
		} finally {
			setCancelling(false);
		}
	};

	if (loading) {
		return (
			<div className="max-w-5xl mx-auto px-4 py-10">
				<div className="h-64 rounded-2xl bg-(--surface) animate-pulse" />
			</div>
		);
	}

	if (!eventData) {
		return (
			<div className="max-w-5xl mx-auto px-4 py-10">
				<FeedbackBanner type="error" message={error || 'Event not found'} />
				<div className="mt-4">
					<Link href="/events" className="text-sm text-accent hover:underline">Back to Events</Link>
				</div>
			</div>
		);
	}

	const hasBooked = eventData.currentUserRsvp === 'going';
	const isSoldOut = eventData.remainingSlots !== null && eventData.remainingSlots <= 0;

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
			<div className="rounded-3xl overflow-hidden border border-(--border) bg-gradient-to-br from-[#0f172a] via-[#1d4ed8] to-[#0ea5e9] text-white p-8 md:p-10">
				<p className="text-xs uppercase tracking-[0.2em] text-white/80">
					{eventData.type || 'Event'} · {eventData.isVirtual ? 'Online' : 'Offline'}
				</p>
				<h1 className="text-3xl md:text-4xl font-bold mt-3">{eventData.name}</h1>
				<p className="mt-3 text-white/90 max-w-3xl">{eventData.description || 'No event description provided.'}</p>
				<div className="mt-5 flex flex-wrap gap-3 text-xs">
					<span className="px-3 py-1 rounded-full bg-white/20">{formatDateTime(eventData.startTime)}</span>
					<span className="px-3 py-1 rounded-full bg-white/20">{eventData.location || (eventData.isVirtual ? 'Online event' : 'Venue TBA')}</span>
					<span className="px-3 py-1 rounded-full bg-white/20">Organized by {eventData.organizerName || 'Xentro'}</span>
				</div>
			</div>

			{error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}
			{success && <FeedbackBanner type="success" message={success} onDismiss={() => setSuccess(null)} />}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
				<Card className="lg:col-span-2 p-6 space-y-4 bg-(--surface)">
					<h2 className="text-xl font-semibold text-(--primary)">Event Details</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
						<div>
							<p className="text-(--secondary)">Start</p>
							<p className="font-medium text-(--primary)">{formatDateTime(eventData.startTime)}</p>
						</div>
						<div>
							<p className="text-(--secondary)">End</p>
							<p className="font-medium text-(--primary)">{formatDateTime(eventData.endTime)}</p>
						</div>
						<div>
							<p className="text-(--secondary)">Mode</p>
							<p className="font-medium text-(--primary)">{eventData.isVirtual ? 'Online Event' : 'In-Person Event'}</p>
						</div>
						<div>
							<p className="text-(--secondary)">Organizer</p>
							<p className="font-medium text-(--primary)">{eventData.organizerName || eventData.institutionName || 'Xentro Admin'}</p>
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-(--surface) space-y-4 sticky top-6">
					<h3 className="text-lg font-semibold text-(--primary)">Book Your Slot</h3>

					<div className="space-y-1 text-sm">
						<p className="text-(--secondary)">Seats</p>
						<input
							type="number"
							min={1}
							max={10}
							value={quantity}
							onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
							disabled={hasBooked}
							className="w-full rounded-lg border border-(--border) bg-(--surface-hover) px-3 py-2 text-sm text-(--primary)"
						/>
					</div>

					<div className="space-y-1 text-sm">
						<p className="text-(--secondary)">Availability</p>
						<p className="font-medium text-(--primary)">{seatsLabel}</p>
					</div>

					<div className="space-y-1 text-sm">
						<p className="text-(--secondary)">Attendees</p>
						<p className="font-medium text-(--primary)">{eventData.attendeeCount}</p>
					</div>

					{!holdId && (
						<Button onClick={handleHold} disabled={holding || hasBooked || isSoldOut} className="w-full">
							{hasBooked ? 'Already Booked' : holding ? 'Holding…' : isSoldOut ? 'Slots Full' : 'Hold Seats (10 min)'}
						</Button>
					)}

					{holdId && !hasBooked && (
						<>
							<p className="text-xs text-amber-400">Hold active for {holdSecondsLeft}s</p>
							<Button onClick={handleConfirmHold} disabled={confirming || holdSecondsLeft <= 0} className="w-full">
								{confirming ? 'Confirming…' : 'Confirm Booking'}
							</Button>
						</>
					)}

					{hasBooked && (
						<Button variant="ghost" onClick={handleCancelBooking} disabled={cancelling} className="w-full text-red-400">
							{cancelling ? 'Cancelling…' : 'Cancel Booking'}
						</Button>
					)}

					{calendarLinks && (
						<div className="text-xs text-(--secondary) space-y-1">
							<p className="font-medium text-(--primary)">Add to Calendar</p>
							<div className="flex gap-3 flex-wrap">
								{calendarLinks.google && <a href={calendarLinks.google} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google</a>}
								{calendarLinks.outlook && <a href={calendarLinks.outlook} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Outlook</a>}
								{calendarLinks.ics && <a href={calendarLinks.ics} className="text-accent hover:underline">ICS</a>}
							</div>
						</div>
					)}

					<Link href="/events" className="block text-center text-sm text-accent hover:underline">Back to all events</Link>
					<Link href="/events/my-bookings" className="block text-center text-sm text-accent hover:underline">Go to My Bookings</Link>
				</Card>
			</div>
		</div>
	);
}

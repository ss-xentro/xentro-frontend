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
	currentUserRsvp: 'going' | 'maybe' | 'not_going' | null;
	approved: boolean;
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
	const [booking, setBooking] = useState(false);
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

		return () => { mounted = false; };
	}, [eventId]);

	const seatsLabel = useMemo(() => {
		if (!eventData) return '—';
		if (eventData.remainingSlots == null) return 'Unlimited slots';
		return `${eventData.remainingSlots} slots left`;
	}, [eventData]);

	const handleBook = async () => {
		if (!eventData) return;
		const token = getSessionToken();
		if (!token) {
			router.push('/login');
			return;
		}

		setBooking(true);
		setError(null);
		setSuccess(null);

		try {
			const res = await fetch(`/api/events/${eventData.id}/rsvp/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ status: 'going' }),
			});

			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(payload.message || 'Booking failed');
			}

			setSuccess(
				eventData.isVirtual
					? 'Booking confirmed. Confirmation details were sent to your email.'
					: 'Booking confirmed. Check your email for the entry QR code.'
			);

			const latest = await fetch(`/api/events/${eventData.id}/`);
			if (latest.ok) {
				setEventData(await latest.json());
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Booking failed');
		} finally {
			setBooking(false);
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
				<p className="mt-3 text-white/90 max-w-3xl">
					{eventData.description || 'No event description provided.'}
				</p>
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
					{!eventData.isVirtual && (
						<p className="text-sm text-(--secondary)">
							Offline attendees receive a QR code by email after booking and must show it at check-in.
						</p>
					)}
					{eventData.isVirtual && (
						<p className="text-sm text-(--secondary)">
							Online attendees receive a confirmation email. Access details are shared before event time.
						</p>
					)}
				</Card>

				<Card className="p-6 bg-(--surface) space-y-4 sticky top-6">
					<h3 className="text-lg font-semibold text-(--primary)">Book Your Slot</h3>
					<div className="space-y-1 text-sm">
						<p className="text-(--secondary)">Availability</p>
						<p className="font-medium text-(--primary)">{seatsLabel}</p>
					</div>
					<div className="space-y-1 text-sm">
						<p className="text-(--secondary)">Attendees</p>
						<p className="font-medium text-(--primary)">{eventData.attendeeCount}</p>
					</div>
					<Button
						onClick={handleBook}
						disabled={booking || hasBooked || isSoldOut}
						className="w-full"
					>
						{hasBooked ? 'Already Booked' : booking ? 'Booking…' : isSoldOut ? 'Slots Full' : 'Book Now'}
					</Button>
					<Link href="/events" className="block text-center text-sm text-accent hover:underline">
						Back to all events
					</Link>
					<Link href="/events/my-bookings" className="block text-center text-sm text-accent hover:underline">
						Go to My Bookings
					</Link>
				</Card>
			</div>
		</div>
	);
}

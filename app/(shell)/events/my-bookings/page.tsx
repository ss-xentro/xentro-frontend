'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from 'sonner';
import { getSessionToken } from '@/lib/auth-utils';
import { readApiErrorMessage } from '@/lib/error-utils';

type BookingEvent = {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	startTime: string | null;
	endTime: string | null;
	isVirtual: boolean;
	organizerName: string | null;
	bookingReference: string;
	bookingStatus: 'going' | 'maybe' | 'not_going';
	registeredAt: string;
	qrCodeUrl: string | null;
	invoiceUrl?: string;
	certificateUrl?: string;
};

function isUpcoming(startTime: string | null): boolean {
	if (!startTime) return false;
	return new Date(startTime).getTime() >= Date.now();
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

export default function EventBookingsPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [bookings, setBookings] = useState<BookingEvent[]>([]);
	const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

	const downloadDocument = async (url: string | undefined, fallbackName: string) => {
		if (!url) return;
		const token = getSessionToken();
		if (!token) {
			router.push('/login');
			return;
		}

		setDownloadingRef(url);
		try {
			const response = await fetch(url, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!response.ok) {
				throw new Error('Download failed');
			}

			const blob = await response.blob();
			const href = window.URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = href;
			anchor.download = fallbackName;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			window.URL.revokeObjectURL(href);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Download failed');
		} finally {
			setDownloadingRef(null);
		}
	};

	useEffect(() => {
		const token = getSessionToken();
		if (!token) {
			router.push('/login');
			return;
		}

		fetch('/api/events/my-bookings/', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(async (res) => {
				if (!res.ok) {
					throw new Error(await readApiErrorMessage(res, 'Failed to load bookings'));
				}
				return res.json();
			})
			.then((data) => {
				setBookings(data.data || data.events || []);
			})
			.catch((err) => {
				toast.error(err instanceof Error ? err.message : 'Failed to load bookings');
			})
			.finally(() => setLoading(false));
	}, [router]);

	const upcoming = useMemo(() => bookings.filter((b) => isUpcoming(b.startTime)), [bookings]);
	const past = useMemo(() => bookings.filter((b) => !isUpcoming(b.startTime)), [bookings]);

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
			<div className="flex items-start justify-between gap-4 flex-wrap">
				<div>
					<h1 className="text-3xl font-bold text-(--primary)">My Event Bookings</h1>
					<p className="text-(--secondary) mt-1">Track your booked events, references, and entry details.</p>
				</div>
				<Link href="/events">
					<Button variant="ghost">Browse Events</Button>
				</Link>
			</div>

			{loading ? (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-52 rounded-xl bg-(--surface) animate-pulse" />
					))}
				</div>
			) : bookings.length === 0 ? (
				<EmptyState
					title="No bookings yet"
					description="Book events from the Events page to see them here."
					ctaLabel="Go to Events"
					ctaHref="/events"
				/>
			) : (
				<>
					{upcoming.length > 0 && (
						<section className="space-y-4">
							<h2 className="text-lg font-semibold text-(--primary)">Upcoming</h2>
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{upcoming.map((event) => (
									<Card key={event.bookingReference} className="p-5 bg-(--surface) border-(--border) space-y-3">
										<div className="flex items-start justify-between gap-3">
											<div>
												<h3 className="font-semibold text-(--primary)">{event.name}</h3>
												<p className="text-xs text-(--secondary) mt-1">by {event.organizerName || 'Xentro'}</p>
											</div>
											<span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400">Booked</span>
										</div>
										<p className="text-sm text-(--secondary)">{formatDateTime(event.startTime)}</p>
										<p className="text-xs text-(--secondary)">Reference: {event.bookingReference}</p>
										{!event.isVirtual && event.qrCodeUrl && (
											<div className="rounded-lg border border-(--border) p-3 bg-(--surface-hover)">
												<p className="text-xs text-(--secondary) mb-2">Show this at venue check-in</p>
												<img src={event.qrCodeUrl} alt="Booking QR" className="w-28 h-28 rounded-md bg-white p-1" />
											</div>
										)}
										{event.isVirtual && (
											<p className="text-xs text-(--secondary)">Online confirmation sent to your email.</p>
										)}
										<div className="flex flex-wrap gap-2">
											<Button
												variant="ghost"
												onClick={() => downloadDocument(event.invoiceUrl, `invoice-${event.bookingReference}.txt`)}
												disabled={!event.invoiceUrl || downloadingRef === event.invoiceUrl}
											>
												Invoice
											</Button>
											<Button
												variant="ghost"
												onClick={() => downloadDocument(event.certificateUrl, `certificate-${event.bookingReference}.txt`)}
												disabled={!event.certificateUrl || downloadingRef === event.certificateUrl}
											>
												Certificate
											</Button>
										</div>
										<Link href={`/events/${event.id}`} className="inline-block text-sm text-accent hover:underline">View event details</Link>
									</Card>
								))}
							</div>
						</section>
					)}

					{past.length > 0 && (
						<section className="space-y-4">
							<h2 className="text-lg font-semibold text-(--secondary)">Past</h2>
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{past.map((event) => (
									<Card key={event.bookingReference} className="p-5 bg-(--surface) border-(--border) opacity-80 space-y-2">
										<h3 className="font-semibold text-(--primary)">{event.name}</h3>
										<p className="text-xs text-(--secondary)">{formatDateTime(event.startTime)}</p>
										<p className="text-xs text-(--secondary)">Reference: {event.bookingReference}</p>
										<div className="flex flex-wrap gap-2">
											<Button
												variant="ghost"
												onClick={() => downloadDocument(event.invoiceUrl, `invoice-${event.bookingReference}.txt`)}
												disabled={!event.invoiceUrl || downloadingRef === event.invoiceUrl}
											>
												Invoice
											</Button>
										</div>
										<Link href={`/events/${event.id}`} className="inline-block text-sm text-accent hover:underline">View event details</Link>
									</Card>
								))}
							</div>
						</section>
					)}
				</>
			)}
		</div>
	);
}

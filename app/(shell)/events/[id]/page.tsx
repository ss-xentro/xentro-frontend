"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { toast } from "sonner";
import { getSessionToken } from "@/lib/auth-utils";

interface EventDetail {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	type: string | null;
	audienceTypes?: string[];
	startupStages?: string[];
	domain?: string | null;
	mode?: string | null;
	pricingType?: string | null;
	organizerType?: string | null;
	benefits?: string[];
	difficultyLevel?: string | null;
	applicationRequirement?: string | null;
	availabilityStatus?: string | null;
	startTime: string | null;
	endTime: string | null;
	isVirtual: boolean;
	availableSlots: number | null;
	remainingSlots: number | null;
	attendeeCount: number;
	institutionName: string | null;
	organizerName: string | null;
	currentUserRsvp:
	| "going"
	| "maybe"
	| "not_going"
	| "waitlist"
	| "cancelled"
	| null;
	approved: boolean;
}

interface CalendarLinks {
	google?: string;
	outlook?: string;
	ics?: string;
}

interface EventOccurrence {
	id: string;
	startTime: string;
	endTime: string;
	maxAttendees: number | null;
	status: string;
}

interface BookingConstraintPayload {
	message?: string;
	teamSize?: number;
	availableSeats?: number;
	maxBookableSeats?: number;
}

function normalizeEventDetailResponse(payload: unknown): EventDetail | null {
	if (!payload || typeof payload !== "object") return null;

	const record = payload as Record<string, unknown>;
	if (record.id) return record as unknown as EventDetail;
	if (record.data && typeof record.data === "object") return record.data as EventDetail;
	if (record.event && typeof record.event === "object") return record.event as EventDetail;

	return null;
}

function formatDateTime(value: string | null): string {
	if (!value) return "TBA";
	return new Date(value).toLocaleString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function pretty(value: string | null | undefined): string {
	if (!value) return 'Not specified';
	return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatBookingConstraintError(payload: BookingConstraintPayload, fallback: string): string {
	if (typeof payload.maxBookableSeats === "number") {
		const base = payload.message || fallback;
		return `${base} You can book up to ${payload.maxBookableSeats} seat${payload.maxBookableSeats === 1 ? "" : "s"}.`;
	}

	if (payload.message) return payload.message;
	return fallback;
}

export default function EventDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const eventId = params?.id;

	const [eventData, setEventData] = useState<EventDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [holding, setHolding] = useState(false);
	const [booking, setBooking] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [cancelling, setCancelling] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [holdId, setHoldId] = useState<string | null>(null);
	const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
	const [holdSecondsLeft, setHoldSecondsLeft] = useState(0);
	const [calendarLinks, setCalendarLinks] = useState<CalendarLinks | null>(
		null,
	);
	const [occurrences, setOccurrences] = useState<EventOccurrence[]>([]);
	const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>("");

	useEffect(() => {
		if (!eventId) return;
		let mounted = true;

		setLoading(true);
		fetch(`/api/events/${eventId}/`)
			.then(async (res) => {
				if (!res.ok) throw new Error("Failed to load event details");
				return res.json();
			})
			.then((data) => {
				if (!mounted) return;
				setEventData(normalizeEventDetailResponse(data));
			})
			.catch((err) => {
				if (!mounted) return;
				toast.error(
					err instanceof Error ? err.message : "Failed to load event details",
				);
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [eventId]);

	useEffect(() => {
		if (!eventId) return;
		fetch(`/api/events/${eventId}/occurrences/`)
			.then(async (res) => {
				if (!res.ok) return { data: [] };
				return res.json();
			})
			.then((data) => {
				const list = data.data || [];
				setOccurrences(list);
				if (list.length > 0) {
					setSelectedOccurrenceId((prev) => prev || list[0].id);
				}
			})
			.catch(() => {
				setOccurrences([]);
			});
	}, [eventId]);

	useEffect(() => {
		if (!holdExpiresAt) {
			setHoldSecondsLeft(0);
			return;
		}

		const tick = () => {
			const secs = Math.max(
				0,
				Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000),
			);
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
		if (!eventData) return "—";
		if (eventData.remainingSlots == null) return "Open";
		return `${eventData.remainingSlots} slots left`;
	}, [eventData]);

	const isUnlimitedSeats = useMemo(() => eventData?.remainingSlots == null, [eventData]);
	const maxSelectableSeats = useMemo(() => {
		if (!eventData) return 1;
		if (eventData.remainingSlots == null) return 99;
		return Math.max(1, eventData.remainingSlots);
	}, [eventData]);

	useEffect(() => {
		setQuantity((prev) => Math.min(Math.max(prev, 1), maxSelectableSeats));
	}, [maxSelectableSeats]);

	const handleQuantityChange = (rawValue: string) => {
		if (!rawValue) {
			setQuantity(1);
			return;
		}
		const parsed = Number(rawValue);
		if (!Number.isFinite(parsed)) return;
		setQuantity(Math.min(Math.max(Math.floor(parsed), 1), maxSelectableSeats));
	};

	const decrementQuantity = () => {
		setQuantity((prev) => Math.max(1, prev - 1));
	};

	const incrementQuantity = () => {
		setQuantity((prev) => Math.min(maxSelectableSeats, prev + 1));
	};

	const refreshEvent = async () => {
		if (!eventData) return;
		const res = await fetch(`/api/events/${eventData.id}/`);
		if (res.ok) {
			const payload = await res.json();
			setEventData(normalizeEventDetailResponse(payload));
		}
	};

	const handleHold = async () => {
		if (!eventData) return;
		const token = getSessionToken();
		if (!token) {
			router.push("/login");
			return;
		}

		setHolding(true);

		try {
			const res = await fetch(`/api/events/${eventData.id}/hold/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					quantity,
					occurrenceId: selectedOccurrenceId || undefined,
				}),
			});
			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(formatBookingConstraintError(payload, "Seat hold failed"));
			}

			setHoldId(payload.holdId || null);
			setHoldExpiresAt(payload.expiresAt || null);
			toast.success("Seats reserved. Complete checkout before the hold expires.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Seat hold failed");
		} finally {
			setHolding(false);
		}
	};

	const handleBook = async () => {
		if (!eventData) return;
		const token = getSessionToken();
		if (!token) {
			router.push("/login");
			return;
		}

		setBooking(true);

		try {
			const res = await fetch(`/api/events/${eventData.id}/rsvp/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					status: "going",
					quantity,
					occurrenceId: selectedOccurrenceId || undefined,
				}),
			});

			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(formatBookingConstraintError(payload, "Booking failed"));
			}

			setCalendarLinks(payload.calendarLinks || null);
			setHoldId(null);
			setHoldExpiresAt(null);
			if (payload.waitlisted) {
				toast.info(payload.message || "Event is full, you have been added to waitlist.");
			} else {
				toast.success(
					eventData.isVirtual
						? "Booking confirmed. Confirmation details were sent to your email."
						: "Booking confirmed. Check your email for the entry QR code.",
				);
			}
			await refreshEvent();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Booking failed");
		} finally {
			setBooking(false);
		}
	};

	const handleConfirmHold = async () => {
		if (!eventData || !holdId) return;
		const token = getSessionToken();
		if (!token) {
			router.push("/login");
			return;
		}

		setConfirming(true);

		try {
			const res = await fetch(`/api/events/${eventData.id}/confirm-hold/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ holdId }),
			});
			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(formatBookingConstraintError(payload, "Booking confirmation failed"));
			}

			setCalendarLinks(payload.calendarLinks || null);
			setHoldId(null);
			setHoldExpiresAt(null);
			toast.success(
				eventData.isVirtual
					? "Booking confirmed. Confirmation details were sent to your email."
					: "Booking confirmed. Check your email for the entry QR code.",
			);
			await refreshEvent();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Booking confirmation failed",
			);
		} finally {
			setConfirming(false);
		}
	};

	const handleCancelBooking = async () => {
		if (!eventData) return;
		const token = getSessionToken();
		if (!token) {
			router.push("/login");
			return;
		}

		setCancelling(true);

		try {
			const cancelRequest = async (occurrenceId?: string) => {
				const res = await fetch(`/api/events/${eventData.id}/cancel/`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ occurrenceId: occurrenceId || undefined }),
				});
				const payload = await res.json().catch(() => ({}));
				return { res, payload };
			};

			let { res, payload } = await cancelRequest(selectedOccurrenceId || undefined);
			if (
				!res.ok &&
				selectedOccurrenceId &&
				(payload?.message === "No active booking found" || payload?.message === "Invalid occurrence")
			) {
				({ res, payload } = await cancelRequest(undefined));
			}

			if (!res.ok) {
				throw new Error(payload.message || "Cancellation failed");
			}

			toast.success(payload.message || "Booking cancelled");
			setCalendarLinks(null);
			await refreshEvent();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Cancellation failed");
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
				<p className="text-red-400">Event not found.</p>
				<div className="mt-4">
					<Link href="/events" className="text-sm text-accent hover:underline">
						Back to Events
					</Link>
				</div>
			</div>
		);
	}

	const hasBooked = eventData.currentUserRsvp === "going";
	const isSoldOut =
		eventData.remainingSlots !== null && eventData.remainingSlots <= 0;

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
			<div className="rounded-3xl overflow-hidden border border-white/10 bg-[linear-gradient(140deg,#111827,#1f2937_45%,#4c1d35)] text-white p-8 md:p-10">
				<p className="text-xs uppercase tracking-[0.2em] text-[#fecaca]">
					{pretty(eventData.type || 'event')} · {pretty(eventData.mode || (eventData.isVirtual ? 'online' : 'offline'))}
				</p>
				<h1 className="text-3xl md:text-5xl font-bold mt-3 max-w-4xl">
					{eventData.name}
				</h1>
				<p className="mt-4 text-white/90 max-w-3xl text-sm md:text-base">
					{eventData.description || "No event description provided."}
				</p>
				<div className="mt-6 flex flex-wrap gap-3 text-xs">
					<span className="px-3 py-1 rounded-full bg-white/15">{formatDateTime(eventData.startTime)}</span>
					<span className="px-3 py-1 rounded-full bg-white/15">{eventData.location || (eventData.isVirtual ? "Online event" : "Venue TBA")}</span>
					<span className="px-3 py-1 rounded-full bg-white/15">Organizer: {pretty(eventData.organizerType || eventData.organizerName || 'xentro')}</span>
					<span className="px-3 py-1 rounded-full bg-white/15">Pricing: {pretty(eventData.pricingType || 'free')}</span>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
				<div className="lg:col-span-2 space-y-6">
					<Card className="p-6 space-y-4 bg-(--surface)">
						<h2 className="text-xl font-semibold text-(--primary)">
							Event Details
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-(--secondary)">Start</p>
								<p className="font-medium text-(--primary)">
									{formatDateTime(eventData.startTime)}
								</p>
							</div>
							<div>
								<p className="text-(--secondary)">End</p>
								<p className="font-medium text-(--primary)">
									{formatDateTime(eventData.endTime)}
								</p>
							</div>
							<div>
								<p className="text-(--secondary)">Mode</p>
								<p className="font-medium text-(--primary)">
									{eventData.isVirtual ? "Online Event" : "In-Person Event"}
								</p>
							</div>
							<div>
								<p className="text-(--secondary)">Organizer</p>
								<p className="font-medium text-(--primary)">
									{eventData.organizerName ||
										eventData.institutionName ||
										"Xentro Admin"}
								</p>
							</div>
						</div>
					</Card>

					<Card className="p-6 bg-(--surface) space-y-4">
						<h3 className="text-lg font-semibold text-(--primary)">Startup Fit</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-(--secondary)">Domain</p>
								<p className="font-medium text-(--primary)">{pretty(eventData.domain)}</p>
							</div>
							<div>
								<p className="text-(--secondary)">Difficulty</p>
								<p className="font-medium text-(--primary)">{pretty(eventData.difficultyLevel)}</p>
							</div>
							<div>
								<p className="text-(--secondary)">Application</p>
								<p className="font-medium text-(--primary)">{pretty(eventData.applicationRequirement)}</p>
							</div>
							<div>
								<p className="text-(--secondary)">Availability</p>
								<p className="font-medium text-(--primary)">{pretty(eventData.availabilityStatus)}</p>
							</div>
						</div>

						{(eventData.startupStages || []).length > 0 && (
							<div>
								<p className="text-sm text-(--secondary) mb-2">Startup Stages</p>
								<div className="flex flex-wrap gap-2">
									{(eventData.startupStages || []).map((stage) => (
										<span key={stage} className="px-2 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">{pretty(stage)}</span>
									))}
								</div>
							</div>
						)}

						{(eventData.benefits || []).length > 0 && (
							<div>
								<p className="text-sm text-(--secondary) mb-2">Benefits</p>
								<div className="flex flex-wrap gap-2">
									{(eventData.benefits || []).map((benefit) => (
										<span key={benefit} className="px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{pretty(benefit)}</span>
									))}
								</div>
							</div>
						)}
					</Card>
				</div>

				<Card className="p-6 bg-(--surface) space-y-4 sticky top-6">
					<h3 className="text-lg font-semibold text-(--primary)">
						Book Your Slot
					</h3>

					<div className="space-y-1 text-sm">
						<p className="text-(--secondary)">Seats</p>
						<div className="flex items-center rounded-lg border border-(--border) bg-(--surface-hover)">
							<button
								type="button"
								onClick={decrementQuantity}
								disabled={hasBooked || quantity <= 1}
								className="px-3 py-2 text-(--primary) hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
								aria-label="Decrease seats"
							>
								-
							</button>
							<input
								type="number"
								min={1}
								max={maxSelectableSeats}
								value={quantity}
								onChange={(e) => handleQuantityChange(e.target.value)}
								onBlur={(e) => handleQuantityChange(e.target.value)}
								disabled={hasBooked}
								className="w-full bg-transparent px-2 py-2 text-center text-sm text-(--primary) [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							/>
							<button
								type="button"
								onClick={incrementQuantity}
								disabled={hasBooked || quantity >= maxSelectableSeats}
								className="px-3 py-2 text-(--primary) hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
								aria-label="Increase seats"
							>
								+
							</button>
						</div>
					</div>

					{occurrences.length > 0 && (
						<div className="space-y-1 text-sm">
							<p className="text-(--secondary)">Occurrence</p>
							<select
								value={selectedOccurrenceId}
								onChange={(e) => setSelectedOccurrenceId(e.target.value)}
								className="w-full rounded-lg border border-(--border) bg-(--surface-hover) px-3 py-2 text-sm text-(--primary)"
							>
								{occurrences.map((occ) => (
									<option key={occ.id} value={occ.id}>
										{formatDateTime(occ.startTime)}
									</option>
								))}
							</select>
						</div>
					)}

					<div className="space-y-1 text-sm">
						<p className="text-(--secondary)">Availability</p>
						<p className="font-medium text-(--primary)">{seatsLabel}</p>
					</div>

					{!hasBooked && !isSoldOut && !holdId && (
						<Button
							onClick={handleBook}
							disabled={booking}
							className="w-full"
						>
							{booking ? "Booking…" : "Book Event"}
						</Button>
					)}

					{!holdId && !isUnlimitedSeats && (
						<Button
							onClick={handleHold}
							disabled={holding || booking || hasBooked || isSoldOut}
							className="w-full"
						>
							{hasBooked
								? "Already Booked"
								: holding
									? "Holding…"
									: isSoldOut
										? "Slots Full"
										: "Hold Seats (10 min)"}
						</Button>
					)}

					{holdId && !hasBooked && (
						<>
							<p className="text-xs text-amber-400">
								Hold active for {holdSecondsLeft}s
							</p>
							<Button
								onClick={handleConfirmHold}
								disabled={confirming || holdSecondsLeft <= 0}
								className="w-full"
							>
								{confirming ? "Confirming…" : "Confirm Booking"}
							</Button>
						</>
					)}

					{hasBooked && (
						<Button
							variant="ghost"
							onClick={handleCancelBooking}
							disabled={cancelling}
							className="w-full text-red-400"
						>
							{cancelling ? "Cancelling…" : "Cancel Booking"}
						</Button>
					)}

					{calendarLinks && (
						<div className="text-xs text-(--secondary) space-y-1">
							<p className="font-medium text-(--primary)">Add to Calendar</p>
							<div className="flex gap-3 flex-wrap">
								{calendarLinks.google && (
									<a
										href={calendarLinks.google}
										target="_blank"
										rel="noopener noreferrer"
										className="text-accent hover:underline"
									>
										Google
									</a>
								)}
								{calendarLinks.outlook && (
									<a
										href={calendarLinks.outlook}
										target="_blank"
										rel="noopener noreferrer"
										className="text-accent hover:underline"
									>
										Outlook
									</a>
								)}
								{calendarLinks.ics && (
									<a
										href={calendarLinks.ics}
										className="text-accent hover:underline"
									>
										ICS
									</a>
								)}
							</div>
						</div>
					)}

					<Link
						href="/events"
						className="block text-center text-sm text-accent hover:underline"
					>
						Back to all events
					</Link>
					<Link
						href="/events/my-bookings"
						className="block text-center text-sm text-accent hover:underline"
					>
						Go to My Bookings
					</Link>
				</Card>
			</div>
		</div>
	);
}

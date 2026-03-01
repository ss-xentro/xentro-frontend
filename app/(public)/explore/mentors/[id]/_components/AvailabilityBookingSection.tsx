'use client';

import { useState } from 'react';
import { getSessionToken } from '@/lib/auth-utils';
import { Section, ORDERED_DAYS, DAY_LABELS, FULL_DAY, formatTime, formatTimeSlot, getNextDateForDay } from './MentorProfileHelpers';

interface MentorSlot {
	id: string;
	dayOfWeek: string;
	startTime: string;
	endTime: string;
	isActive: boolean;
}

interface AvailabilityBookingSectionProps {
	mentorId: string;
	mentorName: string;
	connectionStatus: string | null;
	slots: MentorSlot[];
	slotsLoading: boolean;
	availability?: Record<string, string[]> | null;
}

export default function AvailabilityBookingSection({
	mentorId,
	mentorName,
	connectionStatus,
	slots,
	slotsLoading,
	availability,
}: AvailabilityBookingSectionProps) {
	const [selectedSlot, setSelectedSlot] = useState<MentorSlot | null>(null);
	const [selectedDate, setSelectedDate] = useState('');
	const [bookingNotes, setBookingNotes] = useState('');
	const [bookingSubmitting, setBookingSubmitting] = useState(false);
	const [bookingError, setBookingError] = useState('');
	const [bookingSuccess, setBookingSuccess] = useState(false);

	const handleBookSession = async () => {
		const token = getSessionToken();
		if (!token || !selectedSlot || !selectedDate) return;
		setBookingSubmitting(true);
		setBookingError('');
		try {
			const res = await fetch('/api/mentor-bookings/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					slotId: selectedSlot.id,
					scheduledDate: selectedDate,
					notes: bookingNotes,
					mentorUserId: mentorId,
				}),
			});
			if (res.ok) {
				setBookingSuccess(true);
			} else {
				const data = await res.json();
				setBookingError(data.error || 'Failed to book session');
			}
		} catch {
			setBookingError('Failed to book session');
		} finally {
			setBookingSubmitting(false);
		}
	};

	return (
		<div id="availability-booking">
			<Section
				title="Availability & Booking"
				icon={<svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}
			>
				{/* Real slots from API (shown when connected) */}
				{connectionStatus === 'accepted' && (
					<>
						{slotsLoading ? (
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-20 bg-white/3 border border-white/5 rounded-lg animate-pulse" />
								))}
							</div>
						) : slots.length === 0 ? (
							<p className="text-sm text-gray-500 py-6 text-center">
								This mentor hasn&apos;t set up any bookable slots yet.
							</p>
						) : (
							<div className="space-y-3">
								{ORDERED_DAYS.map((day) => {
									const daySlots = slots.filter((s) => s.dayOfWeek.toLowerCase() === day);
									if (daySlots.length === 0) return null;
									return (
										<div key={day} className="bg-white/3 border border-white/5 rounded-lg p-4">
											<div className="flex items-center justify-between mb-3">
												<div>
													<p className="text-sm font-semibold text-white">{DAY_LABELS[day] || day}</p>
													<p className="text-xs text-gray-600">{FULL_DAY[day] || day}</p>
												</div>
												<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
													<rect x="3" y="4" width="18" height="18" rx="2" />
													<path d="M16 2v4M8 2v4M3 10h18" />
												</svg>
											</div>
											<div className="flex flex-wrap gap-2">
												{daySlots.map((slot) => (
													<button
														key={slot.id}
														onClick={() => {
															setSelectedSlot(slot);
															setSelectedDate(getNextDateForDay(slot.dayOfWeek));
															setBookingError('');
															setBookingSuccess(false);
															setBookingNotes('');
														}}
														className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${selectedSlot?.id === slot.id
															? 'border-violet-500/50 bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30'
															: 'border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-violet-300 hover:bg-violet-500/5'
															}`}
													>
														{formatTime(slot.startTime)} – {formatTime(slot.endTime)}
													</button>
												))}
											</div>
										</div>
									);
								})}

								{/* Inline booking form */}
								{selectedSlot && !bookingSuccess && (
									<div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-4 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
										<div className="flex items-center gap-2 mb-3">
											<svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											<p className="text-sm font-medium text-violet-300">
												{FULL_DAY[selectedSlot.dayOfWeek.toLowerCase()] || selectedSlot.dayOfWeek} · {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
											</p>
											<button onClick={() => setSelectedSlot(null)} className="ml-auto text-gray-500 hover:text-white transition-colors">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
											<div>
												<label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
												<input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors scheme-dark" />
											</div>
											<div>
												<label className="block text-xs font-medium text-gray-400 mb-1">Notes (optional)</label>
												<input type="text" value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} placeholder="Topic to discuss..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors" maxLength={500} />
											</div>
										</div>

										{bookingError && (
											<div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">{bookingError}</div>
										)}

										<button onClick={handleBookSession} disabled={bookingSubmitting || !selectedDate} className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2">
											{bookingSubmitting ? (
												<>
													<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
													Booking...
												</>
											) : (
												<>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
													Confirm Booking
												</>
											)}
										</button>
									</div>
								)}

								{/* Booking success */}
								{bookingSuccess && (
									<div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mt-1 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
										<div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
											<svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
										</div>
										<div className="flex-1">
											<p className="text-sm font-semibold text-emerald-400">Session Booked!</p>
											<p className="text-xs text-emerald-400/70 mt-0.5">{mentorName} will be notified. You&apos;ll see this session in your dashboard.</p>
										</div>
										<button onClick={() => { setBookingSuccess(false); setSelectedSlot(null); }} className="text-xs text-emerald-400 hover:text-emerald-300 shrink-0">Book another</button>
									</div>
								)}
							</div>
						)}
					</>
				)}

				{/* Static availability display (not connected yet) */}
				{connectionStatus !== 'accepted' && availability && Object.keys(availability).length > 0 && (
					<div className="space-y-3">
						{ORDERED_DAYS.map((day) => {
							const avSlots = availability[day];
							if (!avSlots || avSlots.length === 0) return null;
							return (
								<div key={day} className="bg-white/3 border border-white/5 rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<div>
											<p className="text-sm font-semibold text-white">{DAY_LABELS[day] || day}</p>
											<p className="text-xs text-gray-600">{FULL_DAY[day] || day}</p>
										</div>
										<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
									</div>
									<div className="flex flex-wrap gap-2">
										{avSlots.map((slot, i) => (
											<span key={i} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400">{formatTimeSlot(slot)}</span>
										))}
									</div>
								</div>
							);
						})}
						{!connectionStatus && (
							<p className="text-xs text-gray-500 text-center pt-1">Connect with this mentor to book a session</p>
						)}
					</div>
				)}

				{/* No availability at all */}
				{connectionStatus !== 'accepted' && (!availability || Object.keys(availability).length === 0) && (
					<p className="text-sm text-gray-500 py-4 text-center">Availability not set yet.</p>
				)}
			</Section>
		</div>
	);
}

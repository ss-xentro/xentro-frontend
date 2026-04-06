'use client';

import { useState, useMemo } from 'react';
import { getSessionToken } from '@/lib/auth-utils';
import { toast } from 'sonner';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';
import {
	ORDERED_DAYS,
	FULL_DAY,
	DAY_LABELS,
	formatTime,
} from './MentorProfileHelpers';

/* ── Types ── */

interface MentorSlot {
	id: string;
	dayOfWeek: string;
	startTime: string;
	endTime: string;
	isActive: boolean;
}

interface AvailabilitySlot {
	dayOfWeek: string;
	startTime: string;
	endTime: string;
}

interface BookSessionModalProps {
	isOpen: boolean;
	onClose: () => void;
	mentorId: string;
	mentorUserId: string | null;
	mentorName: string;
	mentorAvatar?: string | null;
	slots: MentorSlot[];
	slotsLoading: boolean;
	availability?: Record<string, string[]> | null;
	/** Pre-select a specific slot (e.g. from AvailabilityBookingSection click) */
	preselectedSlot?: MentorSlot | AvailabilitySlot | null;
}

/* ── Helpers ── */

function getUpcomingDatesForDay(dayName: string, count = 4): string[] {
	const dayIndex: Record<string, number> = {
		monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
		friday: 5, saturday: 6, sunday: 0,
	};
	const target = dayIndex[(dayName || '').toLowerCase()];
	if (target === undefined) return [];
	const results: string[] = [];
	const now = new Date();
	const current = now.getDay();
	let diff = target - current;
	if (diff <= 0) diff += 7;
	for (let i = 0; i < count; i++) {
		const d = new Date(now);
		d.setDate(now.getDate() + diff + i * 7);
		results.push(d.toISOString().split('T')[0]);
	}
	return results;
}

function formatDateLabel(d: string): string {
	return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	});
}

/* ── Step indicators ── */

const STEPS = ['Select Slot', 'Details', 'Confirm'] as const;

function StepIndicator({ current }: { current: number }) {
	return (
		<div className="flex items-center gap-1.5 px-5 py-3">
			{STEPS.map((label, i) => (
				<div key={label} className="flex items-center gap-1.5">
					{i > 0 && (
						<div className={cn(
							'w-8 h-px transition-colors',
							i <= current ? 'bg-brand' : 'bg-(--border)',
						)} />
					)}
					<div className="flex items-center gap-1.5">
						<div className={cn(
							'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
							i < current && 'bg-brand text-white',
							i === current && 'bg-brand text-white ring-2 ring-(--brand)/30',
							i > current && 'bg-(--accent-subtle) text-(--secondary)',
						)}>
							{i < current ? (
								<AppIcon name="check" className="w-3.5 h-3.5" />
							) : (
								i + 1
							)}
						</div>
						<span className={cn(
							'text-xs font-medium hidden sm:inline',
							i <= current ? 'text-(--foreground)' : 'text-(--secondary-light)',
						)}>
							{label}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}

/* ── Main component ── */

export default function BookSessionModal({
	isOpen,
	onClose,
	mentorId,
	mentorUserId,
	mentorName,
	mentorAvatar,
	slots,
	slotsLoading,
	availability,
	preselectedSlot,
}: BookSessionModalProps) {
	const [step, setStep] = useState<number>(preselectedSlot ? 1 : 0);
	const [selectedSlot, setSelectedSlot] = useState<MentorSlot | AvailabilitySlot | null>(
		preselectedSlot ?? null,
	);
	const [selectedDate, setSelectedDate] = useState(() => {
		if (preselectedSlot) {
			const dates = getUpcomingDatesForDay(preselectedSlot.dayOfWeek);
			return dates[0] || '';
		}
		return '';
	});
	const [notes, setNotes] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);

	/* Build unified slot list: real DB slots first, then availability-derived slots */
	const allSlotsByDay = useMemo(() => {
		const map: Record<string, Array<MentorSlot | AvailabilitySlot>> = {};

		// Real slots
		for (const slot of slots) {
			const day = slot.dayOfWeek.toLowerCase();
			if (!map[day]) map[day] = [];
			map[day].push(slot);
		}

		// Availability-derived slots (only if no real slots for that day)
		if (availability) {
			for (const [day, ranges] of Object.entries(availability)) {
				if (map[day] && map[day].length > 0) continue;
				if (!map[day]) map[day] = [];
				for (const range of ranges) {
					const [start, end] = range.split('-').map((s) => s.trim());
					if (start && end) {
						map[day].push({ dayOfWeek: day, startTime: start, endTime: end });
					}
				}
			}
		}

		return map;
	}, [slots, availability]);

	const availableDays = ORDERED_DAYS.filter((d) => allSlotsByDay[d]?.length);

	const dateOptions = useMemo(() => {
		if (!selectedSlot) return [];
		return getUpcomingDatesForDay(selectedSlot.dayOfWeek);
	}, [selectedSlot]);

	const isRealSlot = (s: MentorSlot | AvailabilitySlot): s is MentorSlot => 'id' in s;

	const handleSelectSlot = (slot: MentorSlot | AvailabilitySlot) => {
		setSelectedSlot(slot);
		const dates = getUpcomingDatesForDay(slot.dayOfWeek);
		setSelectedDate(dates[0] || '');
		setStep(1);
	};

	const handleSubmit = async () => {
		if (!selectedSlot || !selectedDate) return;

		const token = getSessionToken();
		if (!token) {
			toast.error('Please sign in to book a session');
			return;
		}

		setSubmitting(true);
		try {
			const body: Record<string, string> = {
				scheduledDate: selectedDate,
				notes,
				mentorUserId: mentorUserId || mentorId,
			};

			if (isRealSlot(selectedSlot)) {
				body.slotId = selectedSlot.id;
			} else {
				body.dayOfWeek = selectedSlot.dayOfWeek;
				body.startTime = selectedSlot.startTime;
				body.endTime = selectedSlot.endTime;
			}

			const res = await fetch('/api/mentor-bookings/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			});
			const payload = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(payload.error || 'Failed to book session');
			}
			setSuccess(true);
			setStep(2);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to book session');
		} finally {
			setSubmitting(false);
		}
	};

	const handleClose = () => {
		setStep(0);
		setSelectedSlot(null);
		setSelectedDate('');
		setNotes('');
		setSuccess(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
			<div className="relative bg-(--surface) rounded-t-2xl sm:rounded-2xl w-full sm:w-120 max-h-[80vh] flex flex-col shadow-2xl border border-(--border) overflow-hidden">
				{/* Header */}
				<div className="flex items-center gap-3 px-5 py-4 border-b border-(--border)">
					{step > 0 && !success && (
						<button
							onClick={() => setStep(step - 1)}
							className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-(--accent-subtle) text-(--secondary) hover:text-(--foreground) transition-colors"
						>
							<AppIcon name="arrow-left" className="w-4 h-4" />
						</button>
					)}
					<div className="flex items-center gap-3 flex-1 min-w-0">
						{mentorAvatar ? (
							<img
								src={mentorAvatar}
								alt={mentorName}
								className="w-8 h-8 rounded-full object-cover shrink-0"
							/>
						) : (
							<div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center shrink-0">
								<span className="text-xs font-semibold text-(--foreground)">
									{mentorName.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
						<div className="min-w-0">
							<h2 className="text-sm font-semibold text-(--foreground) truncate">
								Book Session with {mentorName}
							</h2>
						</div>
					</div>
					<button
						onClick={handleClose}
						className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-(--accent-subtle) text-(--secondary) hover:text-(--foreground) transition-colors shrink-0"
					>
						<AppIcon name="x" className="w-4 h-4" />
					</button>
				</div>

				<StepIndicator current={step} />

				{/* Content */}
				<div className="flex-1 overflow-y-auto">
					{/* Step 0: Select Slot */}
					{step === 0 && (
						<div className="px-5 py-4">
							{slotsLoading ? (
								<div className="flex flex-col items-center justify-center py-12 gap-3">
									<AppIcon name="loader-2" className="w-5 h-5 animate-spin text-(--secondary)" />
									<p className="text-sm text-(--secondary)">Loading availability…</p>
								</div>
							) : availableDays.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
									<div className="w-14 h-14 rounded-full bg-(--accent-subtle) flex items-center justify-center">
										<AppIcon name="calendar-x" className="w-7 h-7 text-(--secondary-light) opacity-50" />
									</div>
									<div>
										<p className="text-sm font-medium text-(--foreground)">No available slots</p>
										<p className="text-xs text-(--secondary-light) mt-1 max-w-xs">
											This mentor hasn&apos;t set up any bookable time slots yet. Check back later.
										</p>
									</div>
								</div>
							) : (
								<div className="space-y-3">
									<p className="text-xs text-(--secondary) mb-1">
										Choose a time that works for you
									</p>
									{availableDays.map((day) => {
										const daySlots = allSlotsByDay[day] || [];
										return (
											<div key={day} className="rounded-xl border border-(--border) p-3.5 bg-(--accent-subtle)/50">
												<div className="flex items-center gap-2 mb-2.5">
													<AppIcon name="calendar" className="w-3.5 h-3.5 text-(--secondary)" />
													<span className="text-sm font-semibold text-(--foreground)">{FULL_DAY[day]}</span>
													<span className="text-xs text-(--secondary-light)">({DAY_LABELS[day]})</span>
												</div>
												<div className="flex flex-wrap gap-2">
													{daySlots.map((slot, i) => (
														<button
															key={isRealSlot(slot) ? slot.id : `${day}-${i}`}
															onClick={() => handleSelectSlot(slot)}
															className={cn(
																'text-xs px-3.5 py-2 rounded-xl border transition-all font-medium',
																selectedSlot === slot
																	? 'border-brand bg-brand/10 text-brand ring-1 ring-brand/30'
																	: 'border-(--border) text-(--foreground) hover:border-(--brand)/40 hover:bg-brand/5',
															)}
														>
															{formatTime(slot.startTime)} – {formatTime(slot.endTime)}
														</button>
													))}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}

					{/* Step 1: Date + Notes */}
					{step === 1 && selectedSlot && (
						<div className="px-5 py-4 space-y-4">
							{/* Selected slot summary */}
							<div className="flex items-center gap-3 p-3 rounded-xl bg-(--accent-subtle) border border-(--border)">
								<div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
									<AppIcon name="clock" className="w-5 h-5 text-brand" />
								</div>
								<div>
									<p className="text-sm font-semibold text-(--foreground)">
										{FULL_DAY[selectedSlot.dayOfWeek.toLowerCase()] || selectedSlot.dayOfWeek}
									</p>
									<p className="text-xs text-(--secondary)">
										{formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
									</p>
								</div>
								<button
									onClick={() => setStep(0)}
									className="ml-auto text-xs text-brand hover:underline"
								>
									Change
								</button>
							</div>

							{/* Date selection */}
							<div>
								<label className="block text-sm font-medium text-(--foreground) mb-2">
									Select a Date
								</label>
								<div className="grid grid-cols-2 gap-2">
									{dateOptions.map((d) => (
										<button
											key={d}
											onClick={() => setSelectedDate(d)}
											className={cn(
												'px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left',
												selectedDate === d
													? 'border-brand bg-brand/10 text-brand ring-1 ring-brand/30'
													: 'border-(--border) text-(--foreground) hover:border-brand/40',
											)}
										>
											{formatDateLabel(d)}
										</button>
									))}
								</div>
							</div>

							{/* Notes */}
							<div>
								<label className="block text-sm font-medium text-(--foreground) mb-2">
									What would you like to discuss?
								</label>
								<textarea
									rows={3}
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Tell the mentor what topics you'd like to cover…"
									maxLength={500}
									className="w-full px-3.5 py-2.5 rounded-xl bg-(--accent-subtle) border border-(--border) text-sm text-(--foreground) placeholder:text-(--secondary-light) focus:outline-none focus:border-(--brand)/50 focus:ring-2 focus:ring-(--brand)/20 resize-none transition-all"
								/>
								<p className="text-[11px] text-(--secondary-light) mt-1 text-right">
									{notes.length}/500
								</p>
							</div>
						</div>
					)}

					{/* Step 2: Confirmation / Success */}
					{step === 2 && (
						<div className="px-5 py-8">
							{success ? (
								<div className="flex flex-col items-center text-center gap-4">
									<div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
										<AppIcon name="check-circle-2" className="w-8 h-8 text-emerald-500" />
									</div>
									<div>
										<h3 className="text-lg font-bold text-(--foreground)">Session Booked!</h3>
										<p className="text-sm text-(--secondary) mt-1.5 max-w-xs mx-auto">
											{mentorName} will be notified and can confirm your booking. You&apos;ll see it in your dashboard.
										</p>
									</div>

									{/* Booking summary */}
									{selectedSlot && (
										<div className="w-full mt-2 p-4 rounded-xl bg-(--accent-subtle) border border-(--border) text-left">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
													<AppIcon name="calendar-check" className="w-5 h-5 text-brand" />
												</div>
												<div>
													<p className="text-sm font-semibold text-(--foreground)">
														{selectedDate && formatDateLabel(selectedDate)}
													</p>
													<p className="text-xs text-(--secondary)">
														{formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
													</p>
												</div>
											</div>
											{notes && (
												<p className="text-xs text-(--secondary) mt-3 pt-3 border-t border-(--border) italic">
													&ldquo;{notes}&rdquo;
												</p>
											)}
										</div>
									)}

									<button
										onClick={handleClose}
										className="mt-2 px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity"
									>
										Done
									</button>
								</div>
							) : (
								/* Confirm before submit */
								<div className="space-y-4">
									<h3 className="text-base font-semibold text-(--foreground)">Confirm Booking</h3>
									{selectedSlot && (
										<div className="p-4 rounded-xl bg-(--accent-subtle) border border-(--border) space-y-2">
											<div className="flex items-center gap-2 text-sm">
												<AppIcon name="user" className="w-4 h-4 text-(--secondary)" />
												<span className="text-(--foreground) font-medium">{mentorName}</span>
											</div>
											<div className="flex items-center gap-2 text-sm">
												<AppIcon name="calendar" className="w-4 h-4 text-(--secondary)" />
												<span className="text-(--foreground)">
													{selectedDate && formatDateLabel(selectedDate)}
												</span>
											</div>
											<div className="flex items-center gap-2 text-sm">
												<AppIcon name="clock" className="w-4 h-4 text-(--secondary)" />
												<span className="text-(--foreground)">
													{formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
												</span>
											</div>
											{notes && (
												<div className="flex items-start gap-2 text-sm pt-1">
													<AppIcon name="message-circle" className="w-4 h-4 text-(--secondary) mt-0.5" />
													<span className="text-(--secondary) italic">{notes}</span>
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Footer actions */}
				{step === 1 && !success && (
					<div className="px-5 py-4 border-t border-(--border) flex gap-3">
						<button
							onClick={() => setStep(0)}
							className="flex-1 px-4 py-2.5 rounded-xl border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--accent-subtle) transition-colors"
						>
							Back
						</button>
						<button
							onClick={handleSubmit}
							disabled={submitting || !selectedDate || !notes.trim()}
							className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{submitting ? (
								<>
									<AppIcon name="loader-2" className="w-4 h-4 animate-spin" />
									Booking…
								</>
							) : (
								<>
									<AppIcon name="calendar-check" className="w-4 h-4" />
									Confirm Booking
								</>
							)}
						</button>
					</div>
				)}

				{step === 2 && !success && (
					<div className="px-5 py-4 border-t border-(--border) flex gap-3">
						<button
							onClick={() => setStep(1)}
							className="flex-1 px-4 py-2.5 rounded-xl border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--accent-subtle) transition-colors"
						>
							Back
						</button>
						<button
							onClick={handleSubmit}
							disabled={submitting || !selectedDate}
							className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{submitting ? (
								<>
									<AppIcon name="loader-2" className="w-4 h-4 animate-spin" />
									Booking…
								</>
							) : (
								<>
									<AppIcon name="send" className="w-4 h-4" />
									Send Booking Request
								</>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

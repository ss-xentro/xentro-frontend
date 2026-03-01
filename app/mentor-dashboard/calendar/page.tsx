'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, string> = {
	monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
	friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM - 8 PM

interface Slot {
	id: string;
	day_of_week: string;
	start_time: string;
	end_time: string;
	is_active: boolean;
}

interface Booking {
	id: string;
	scheduled_date: string;
	status: string;
	notes: string;
	mentee_user?: { id: string; name: string; email: string; avatar?: string };
	slot?: { id: string; day_of_week: string; start_time: string; end_time: string };
}

function parseTime(t: string): number {
	const [h, m] = t.split(':').map(Number);
	return h + m / 60;
}

function formatTime(t: string): string {
	const [h, m] = t.split(':');
	const hour = parseInt(h, 10);
	const ampm = hour >= 12 ? 'PM' : 'AM';
	const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
	return `${h12}:${m} ${ampm}`;
}

function getWeekDates(baseDate: Date): Record<string, Date> {
	const day = baseDate.getDay();
	const monday = new Date(baseDate);
	monday.setDate(baseDate.getDate() - ((day + 6) % 7));
	const result: Record<string, Date> = {};
	DAYS.forEach((d, i) => {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);
		result[d] = date;
	});
	return result;
}

const STATUS_COLORS: Record<string, string> = {
	pending: 'bg-amber-100 text-amber-800 border-amber-200',
	confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
	completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
	cancelled: 'bg-red-100 text-red-800 border-red-200',
	no_show: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function MentorCalendarPage() {
	const [slots, setSlots] = useState<Slot[]>([]);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [weekOffset, setWeekOffset] = useState(0);
	const [view, setView] = useState<'week' | 'availability'>('week');

	// New slot form
	const [showAddSlot, setShowAddSlot] = useState(false);
	const [newDay, setNewDay] = useState<string>('monday');
	const [newStart, setNewStart] = useState('09:00');
	const [newEnd, setNewEnd] = useState('10:00');
	const [slotSaving, setSlotSaving] = useState(false);

	const baseDate = new Date();
	baseDate.setDate(baseDate.getDate() + weekOffset * 7);
	const weekDates = getWeekDates(baseDate);

	const fetchData = useCallback(async () => {
		const token = getSessionToken('mentor');
		if (!token) return;
		const headers = { Authorization: `Bearer ${token}` };

		try {
			const [slotsRes, bookingsRes] = await Promise.all([
				fetch(`${API}/api/mentor-slots/`, { headers }),
				fetch(`${API}/api/mentor-bookings/`, { headers }),
			]);
			const slotsJson = await slotsRes.json();
			const bookingsJson = await bookingsRes.json();
			setSlots(slotsJson.data || []);
			setBookings(bookingsJson.data || []);
		} catch {
			// silent
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchData(); }, [fetchData]);

	const handleAddSlot = async () => {
		const token = getSessionToken('mentor');
		if (!token) return;
		setSlotSaving(true);
		try {
			const res = await fetch(`${API}/api/mentor-slots/`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ day_of_week: newDay, start_time: newStart, end_time: newEnd }),
			});
			if (!res.ok) {
				const json = await res.json();
				alert(json.error || 'Failed to add slot');
				return;
			}
			setShowAddSlot(false);
			fetchData();
		} catch {
			alert('Failed to add slot');
		} finally {
			setSlotSaving(false);
		}
	};

	const handleDeleteSlot = async (slotId: string) => {
		const token = getSessionToken('mentor');
		if (!token) return;
		if (!confirm('Delete this availability slot?')) return;
		try {
			await fetch(`${API}/api/mentor-slots/`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ slotId }),
			});
			fetchData();
		} catch {
			// silent
		}
	};

	const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
		const token = getSessionToken('mentor');
		if (!token) return;
		try {
			await fetch(`${API}/api/mentor-bookings/`, {
				method: 'PATCH',
				headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ bookingId, status: action }),
			});
			fetchData();
		} catch {
			// silent
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
			</div>
		);
	}

	// Week label
	const weekStart = weekDates.monday;
	const weekEnd = weekDates.sunday;
	const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

	// Build bookings by day for the current week
	const bookingsByDay: Record<string, Booking[]> = {};
	DAYS.forEach(d => { bookingsByDay[d] = []; });
	bookings.forEach(b => {
		const date = new Date(b.scheduled_date);
		const dayIdx = (date.getDay() + 6) % 7; // 0=Mon
		const dayName = DAYS[dayIdx];
		// Check if booking is in the current week
		if (date >= weekStart && date <= new Date(weekEnd.getTime() + 86400000)) {
			bookingsByDay[dayName]?.push(b);
		}
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div>
					<h1 className="text-2xl font-bold text-(--primary)">Calendar</h1>
					<p className="text-(--secondary) text-sm mt-1">Manage your availability and sessions</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex bg-(--surface) border border-(--border) rounded-lg overflow-hidden">
						<button
							onClick={() => setView('week')}
							className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'week' ? 'bg-accent text-white' : 'text-(--secondary) hover:bg-(--surface-hover)'
								}`}
						>
							Week
						</button>
						<button
							onClick={() => setView('availability')}
							className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'availability' ? 'bg-accent text-white' : 'text-(--secondary) hover:bg-(--surface-hover)'
								}`}
						>
							Availability
						</button>
					</div>
					<Button onClick={() => setShowAddSlot(true)}>+ Add Slot</Button>
				</div>
			</div>

			{/* Add Slot Modal */}
			{showAddSlot && (
				<Card className="p-5 space-y-4 border-accent/30">
					<h3 className="font-semibold text-(--primary)">New Availability Slot</h3>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-1">Day</label>
							<select
								value={newDay}
								onChange={e => setNewDay(e.target.value)}
								className="w-full px-3 py-2 border border-(--border) rounded-lg bg-(--surface) text-sm text-(--primary)"
							>
								{DAYS.map(d => (
									<option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-1">Start Time</label>
							<input
								type="time"
								value={newStart}
								onChange={e => setNewStart(e.target.value)}
								className="w-full px-3 py-2 border border-(--border) rounded-lg bg-(--surface) text-sm text-(--primary)"
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-1">End Time</label>
							<input
								type="time"
								value={newEnd}
								onChange={e => setNewEnd(e.target.value)}
								className="w-full px-3 py-2 border border-(--border) rounded-lg bg-(--surface) text-sm text-(--primary)"
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<Button onClick={handleAddSlot} disabled={slotSaving}>
							{slotSaving ? 'Saving...' : 'Add Slot'}
						</Button>
						<Button variant="secondary" onClick={() => setShowAddSlot(false)}>Cancel</Button>
					</div>
				</Card>
			)}

			{/* Week View */}
			{view === 'week' && (
				<>
					{/* Week Navigation */}
					<div className="flex items-center justify-between">
						<button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-lg hover:bg-(--surface-hover) text-(--secondary)">
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						</button>
						<div className="text-sm font-medium text-(--primary)">
							{weekLabel}
							{weekOffset !== 0 && (
								<button onClick={() => setWeekOffset(0)} className="ml-2 text-xs text-accent hover:underline">Today</button>
							)}
						</div>
						<button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-lg hover:bg-(--surface-hover) text-(--secondary)">
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
						</button>
					</div>

					{/* Calendar Grid */}
					<Card className="overflow-hidden">
						<p className="text-xs text-(--secondary) px-4 py-2 sm:hidden border-b border-(--border)">← Scroll horizontally to view full week →</p>
						<div className="overflow-x-auto">
							<div className="min-w-[700px]">
								{/* Header row */}
								<div className="grid grid-cols-8 border-b border-(--border)">
									<div className="p-3 text-xs font-medium text-(--secondary)" />
									{DAYS.map(d => {
										const date = weekDates[d];
										const isToday = new Date().toDateString() === date.toDateString();
										return (
											<div key={d} className={`p-3 text-center border-l border-(--border) ${isToday ? 'bg-accent/5' : ''}`}>
												<div className="text-xs font-medium text-(--secondary)">{DAY_LABELS[d]}</div>
												<div className={`text-lg font-semibold ${isToday ? 'text-accent' : 'text-(--primary)'}`}>
													{date.getDate()}
												</div>
											</div>
										);
									})}
								</div>

								{/* Time rows */}
								{HOURS.map(hour => (
									<div key={hour} className="grid grid-cols-8 border-b border-(--border) last:border-0 min-h-[60px]">
										<div className="p-2 text-xs text-(--secondary) text-right pr-3 pt-1">
											{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
										</div>
										{DAYS.map(d => {
											// Slots for this day + hour
											const daySlots = slots.filter(s =>
												s.day_of_week === d &&
												parseTime(s.start_time) <= hour &&
												parseTime(s.end_time) > hour
											);
											// Bookings for this day + hour
											const dayBookings = bookingsByDay[d]?.filter(b => {
												const bDate = new Date(b.scheduled_date);
												return bDate.getHours() === hour;
											}) || [];

											return (
												<div key={d} className="border-l border-(--border) p-1 relative">
													{daySlots.map(s => (
														<div key={s.id} className="absolute inset-x-1 top-1 bottom-1 bg-accent/10 border border-accent/20 rounded text-[10px] text-accent px-1 flex items-start">
															Available
														</div>
													))}
													{dayBookings.map(b => (
														<div key={b.id} className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}>
															<div className="font-medium truncate">{b.mentee_user?.name || 'Session'}</div>
														</div>
													))}
												</div>
											);
										})}
									</div>
								))}
							</div>
						</div>
					</Card>
				</>
			)}

			{/* Availability View */}
			{view === 'availability' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{DAYS.map(day => {
						const daySlots = slots.filter(s => s.day_of_week === day);
						return (
							<Card key={day} className="p-4">
								<h3 className="font-semibold text-(--primary) capitalize mb-3">{day}</h3>
								{daySlots.length === 0 ? (
									<p className="text-sm text-(--secondary)">No slots</p>
								) : (
									<div className="space-y-2">
										{daySlots.map(s => (
											<div key={s.id} className="flex items-center justify-between bg-(--surface-hover) rounded-lg px-3 py-2">
												<span className="text-sm font-medium text-(--primary)">
													{formatTime(s.start_time)} – {formatTime(s.end_time)}
												</span>
												<button
													onClick={() => handleDeleteSlot(s.id)}
													className="text-xs text-red-500 hover:text-red-700 transition-colors"
												>
													Remove
												</button>
											</div>
										))}
									</div>
								)}
							</Card>
						);
					})}
				</div>
			)}

			{/* Upcoming Bookings */}
			<Card className="p-5">
				<h2 className="text-lg font-semibold text-(--primary) mb-4">Upcoming Sessions</h2>
				{bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed').length === 0 ? (
					<p className="text-sm text-(--secondary)">No upcoming sessions</p>
				) : (
					<div className="space-y-3">
						{bookings
							.filter(b => b.status !== 'cancelled' && b.status !== 'completed')
							.sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
							.map(b => {
								const date = new Date(b.scheduled_date);
								return (
									<div key={b.id} className="flex items-center justify-between p-3 bg-(--surface-hover) rounded-lg">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
												{(b.mentee_user?.name || '?').charAt(0).toUpperCase()}
											</div>
											<div>
												<div className="text-sm font-medium text-(--primary)">{b.mentee_user?.name || 'Unknown'}</div>
												<div className="text-xs text-(--secondary)">
													{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
													{' at '}
													{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
												</div>
												{b.notes && <div className="text-xs text-(--secondary) mt-0.5 italic">{b.notes}</div>}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[b.status] || ''}`}>
												{b.status}
											</span>
											{b.status === 'pending' && (
												<div className="flex gap-1">
													<button
														onClick={() => handleBookingAction(b.id, 'confirmed')}
														className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
													>
														Accept
													</button>
													<button
														onClick={() => handleBookingAction(b.id, 'cancelled')}
														className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
													>
														Decline
													</button>
												</div>
											)}
										</div>
									</div>
								);
							})}
					</div>
				)}
			</Card>
		</div>
	);
}

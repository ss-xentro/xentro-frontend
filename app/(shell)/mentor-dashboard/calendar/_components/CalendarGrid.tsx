'use client';

import { Card } from '@/components/ui';
import { DAYS, DAY_LABELS, HOURS, parseTime, getWeekDates, STATUS_COLORS, type Slot, type Booking } from '../_lib/constants';

interface CalendarGridProps {
	slots: Slot[];
	bookingsByDay: Record<string, Booking[]>;
	weekOffset: number;
	onWeekChange: (delta: number) => void;
}

export default function CalendarGrid({ slots, bookingsByDay, weekOffset, onWeekChange }: CalendarGridProps) {
	const baseDate = new Date();
	baseDate.setDate(baseDate.getDate() + weekOffset * 7);
	const weekDates = getWeekDates(baseDate);

	const weekStart = weekDates.monday;
	const weekEnd = weekDates.sunday;
	const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} \u2013 ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

	return (
		<>
			{/* Week Navigation */}
			<div className="flex items-center justify-between">
				<button onClick={() => onWeekChange(-1)} className="p-2 rounded-lg hover:bg-(--surface-hover) text-(--secondary)">
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
				</button>
				<div className="text-sm font-medium text-(--primary)">
					{weekLabel}
					{weekOffset !== 0 && (
						<button onClick={() => onWeekChange(-weekOffset)} className="ml-2 text-xs text-accent hover:underline">Today</button>
					)}
				</div>
				<button onClick={() => onWeekChange(1)} className="p-2 rounded-lg hover:bg-(--surface-hover) text-(--secondary)">
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
				</button>
			</div>

			{/* Calendar Grid */}
			<Card className="overflow-hidden">
				<p className="text-xs text-(--secondary) px-4 py-2 sm:hidden border-b border-(--border)">&larr; Scroll horizontally to view full week &rarr;</p>
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
									const daySlots = slots.filter(s =>
										s.day_of_week === d &&
										parseTime(s.start_time) <= hour &&
										parseTime(s.end_time) > hour
									);
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
	);
}

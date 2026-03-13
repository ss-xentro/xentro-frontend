import { Button } from '@/components/ui/Button';
import { useMemo, useState } from 'react';
import { SlotEntry, DAYS_OF_WEEK } from '../_lib/constants';

interface Props {
	slots: SlotEntry[];
	onAdd: (slot: SlotEntry) => void;
	onRemove: (index: number) => void;
	onUpdate: (index: number, field: keyof SlotEntry, value: string) => void;
}

export default function AvailabilitySlotsSection({ slots, onAdd, onRemove, onUpdate }: Props) {
	const [newDay, setNewDay] = useState(DAYS_OF_WEEK[0]);
	const [newStart, setNewStart] = useState('09:00');
	const [newEnd, setNewEnd] = useState('10:00');

	const groupedSlots = useMemo(() => {
		return DAYS_OF_WEEK.map((day) => ({
			day,
			slots: slots
				.map((slot, index) => ({ ...slot, index }))
				.filter((slot) => slot.day === day)
				.sort((a, b) => a.startTime.localeCompare(b.startTime)),
		}));
	}, [slots]);

	const handleAddSlot = () => {
		if (!newStart || !newEnd || newStart >= newEnd) return;
		onAdd({ day: newDay, startTime: newStart, endTime: newEnd });
	};

	return (
		<>
			<div className="flex items-center justify-between mb-5">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-lg bg-(--surface-hover) border border-(--border) flex items-center justify-center">
						<svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-(--primary)">Available Slots</h3>
						<p className="text-sm text-(--secondary)">Use the timetable below and configure exact start/end times per slot.</p>
					</div>
				</div>
				<Button variant="secondary" size="sm" onClick={handleAddSlot} disabled={!newStart || !newEnd || newStart >= newEnd}>
					<svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Add Slot
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-3 bg-(--surface-hover) rounded-lg border border-(--border)">
				<select
					value={newDay}
					onChange={(e) => setNewDay(e.target.value)}
					className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent"
				>
					{DAYS_OF_WEEK.map((day) => (
						<option key={day} value={day}>{day}</option>
					))}
				</select>

				<input
					type="time"
					value={newStart}
					onChange={(e) => setNewStart(e.target.value)}
					className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent"
				/>

				<input
					type="time"
					value={newEnd}
					onChange={(e) => setNewEnd(e.target.value)}
					className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent"
				/>

				<div className="text-xs text-(--secondary) flex items-center md:justify-end">
					{newStart >= newEnd ? 'End time must be after start time.' : 'Add slots day-by-day.'}
				</div>
			</div>

			<div className="space-y-3">
				{groupedSlots.map((dayGroup) => (
					<div key={dayGroup.day} className="rounded-lg border border-(--border) overflow-hidden">
						<div className="px-3 py-2 bg-(--surface-hover) text-sm font-semibold text-(--primary)">{dayGroup.day}</div>
						<div className="divide-y divide-(--border)">
							{dayGroup.slots.length === 0 ? (
								<div className="px-3 py-2 text-xs text-(--secondary)">No slots</div>
							) : (
								dayGroup.slots.map((slot) => (
									<div key={`${slot.index}-${slot.startTime}`} className="px-3 py-2 flex items-center gap-2">
										<input
											type="time"
											value={slot.startTime}
											onChange={(e) => onUpdate(slot.index, 'startTime', e.target.value)}
											className="h-9 px-2 bg-(--surface) border border-(--border) rounded text-sm text-(--primary)"
										/>
										<span className="text-(--secondary) text-sm">to</span>
										<input
											type="time"
											value={slot.endTime}
											onChange={(e) => onUpdate(slot.index, 'endTime', e.target.value)}
											className="h-9 px-2 bg-(--surface) border border-(--border) rounded text-sm text-(--primary)"
										/>
										<button
											onClick={() => onRemove(slot.index)}
											className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-(--secondary) hover:text-red-500 hover:bg-red-50 transition-colors"
											aria-label="Remove slot"
										>
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								))
							)}
						</div>
					</div>
				))}
			</div>

			{slots.length === 0 && (
				<div className="text-center py-8 text-(--secondary)">
					<p className="text-sm">No slots added yet. Click &quot;Add Slot&quot; to set your availability.</p>
				</div>
			)}
		</>
	);
}

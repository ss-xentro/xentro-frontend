import { Button } from '@/components/ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { SlotEntry, DAYS_OF_WEEK, TIME_OPTIONS } from '../_lib/constants';

interface Props {
	slots: SlotEntry[];
	onAdd: (slot: SlotEntry) => void;
	onRemove: (index: number) => void;
	onUpdate: (index: number, field: keyof SlotEntry, value: string) => void;
}

export default function AvailabilitySlotsSection({ slots, onAdd, onRemove, onUpdate }: Props) {
	const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);
	const [newStart, setNewStart] = useState('09:00');
	const [newEnd, setNewEnd] = useState('10:00');
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editStart, setEditStart] = useState('09:00');
	const [editEnd, setEditEnd] = useState('10:00');

	const dayStats = useMemo(() => {
		return DAYS_OF_WEEK.map((day) => ({
			day,
			count: slots.filter((slot) => slot.day === day).length,
		}));
	}, [slots]);

	const daySlots = useMemo(() => {
		return slots
			.map((slot, index) => ({ ...slot, index }))
			.filter((slot) => slot.day === selectedDay)
			.sort((a, b) => a.startTime.localeCompare(b.startTime));
	}, [slots, selectedDay]);

	const getPeriodFromTime = (value: string): 'morning' | 'afternoon' | 'evening' => {
		const hour = Number(value.split(':')[0] || 0);
		if (hour < 12) return 'morning';
		if (hour < 17) return 'afternoon';
		return 'evening';
	};

	const toMinutes = (value: string) => {
		const [hour, minute] = value.split(':').map(Number);
		return hour * 60 + minute;
	};

	const toHHMM = (minutes: number) => {
		const hour = Math.floor(minutes / 60);
		const minute = minutes % 60;
		return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
	};

	const getNextTimeOption = (value: string) => {
		const idx = TIME_OPTIONS.indexOf(value);
		if (idx === -1) return value;
		return TIME_OPTIONS[Math.min(idx + 1, TIME_OPTIONS.length - 1)];
	};

	const getPreviousTimeOption = (value: string) => {
		const idx = TIME_OPTIONS.indexOf(value);
		if (idx === -1) return value;
		return TIME_OPTIONS[Math.max(idx - 1, 0)];
	};

	const splitByPeriodBoundaries = (start: string, end: string) => {
		const startMin = toMinutes(start);
		const endMin = toMinutes(end);
		if (endMin <= startMin) return [] as Array<{ startTime: string; endTime: string }>;

		const boundaries = [12 * 60, 17 * 60];
		const splitPoints = boundaries.filter((point) => point > startMin && point < endMin);
		const result: Array<{ startTime: string; endTime: string }> = [];
		let cursor = startMin;

		for (const point of splitPoints) {
			result.push({ startTime: toHHMM(cursor), endTime: toHHMM(point) });
			cursor = point;
		}

		result.push({ startTime: toHHMM(cursor), endTime: toHHMM(endMin) });
		return result;
	};

	const slotBuckets = useMemo(() => {
		return {
			morning: daySlots.filter((slot) => getPeriodFromTime(slot.startTime) === 'morning'),
			afternoon: daySlots.filter((slot) => getPeriodFromTime(slot.startTime) === 'afternoon'),
			evening: daySlots.filter((slot) => getPeriodFromTime(slot.startTime) === 'evening'),
		};
	}, [daySlots]);

	const totalSlots = slots.length;

	const isValidRange = newStart < newEnd;
	const isEditRangeValid = editStart < editEnd;
	const targetPeriod = getPeriodFromTime(newStart);
	const addSplitSegments = useMemo(() => {
		if (!isValidRange) return [] as Array<{ startTime: string; endTime: string }>;
		return splitByPeriodBoundaries(newStart, newEnd);
	}, [newStart, newEnd, isValidRange]);
	const editSplitSegments = useMemo(() => {
		if (!isEditRangeValid) return [] as Array<{ startTime: string; endTime: string }>;
		return splitByPeriodBoundaries(editStart, editEnd);
	}, [editStart, editEnd, isEditRangeValid]);

	const formatTime = (value: string) => {
		const [hourRaw, minute] = value.split(':').map(Number);
		const suffix = hourRaw >= 12 ? 'PM' : 'AM';
		const hour = hourRaw % 12 || 12;
		return `${hour}:${String(minute).padStart(2, '0')} ${suffix}`;
	};

	const getDurationLabel = (start: string, end: string) => {
		const [startHour, startMinute] = start.split(':').map(Number);
		const [endHour, endMinute] = end.split(':').map(Number);
		const minutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
		if (minutes <= 0) return 'Invalid range';
		if (minutes % 60 === 0) return `${minutes / 60}h`;
		return `${minutes} min`;
	};

	const handleAddSlot = () => {
		if (!newStart || !newEnd || !isValidRange) return;
		const segments = splitByPeriodBoundaries(newStart, newEnd);
		for (const segment of segments) {
			onAdd({ day: selectedDay, startTime: segment.startTime, endTime: segment.endTime });
		}
	};

	const handleNewStartChange = (value: string) => {
		setNewStart(value);
		if (toMinutes(value) >= toMinutes(newEnd)) {
			setNewEnd(getNextTimeOption(value));
		}
	};

	const handleNewEndChange = (value: string) => {
		setNewEnd(value);
		if (toMinutes(value) <= toMinutes(newStart)) {
			setNewStart(getPreviousTimeOption(value));
		}
	};

	const handleEditStartChange = (value: string) => {
		setEditStart(value);
		if (toMinutes(value) >= toMinutes(editEnd)) {
			setEditEnd(getNextTimeOption(value));
		}
	};

	const handleEditEndChange = (value: string) => {
		setEditEnd(value);
		if (toMinutes(value) <= toMinutes(editStart)) {
			setEditStart(getPreviousTimeOption(value));
		}
	};

	useEffect(() => {
		if (editingIndex === null) return;
		if (!slots[editingIndex]) {
			setEditingIndex(null);
			return;
		}
		setEditStart(slots[editingIndex].startTime);
		setEditEnd(slots[editingIndex].endTime);
	}, [editingIndex, slots]);

	const saveEditedSlot = () => {
		if (editingIndex === null || !isEditRangeValid) return;

		const current = slots[editingIndex];
		if (!current) return;

		const segments = splitByPeriodBoundaries(editStart, editEnd);
		if (segments.length === 0) return;

		onUpdate(editingIndex, 'startTime', segments[0].startTime);
		onUpdate(editingIndex, 'endTime', segments[0].endTime);

		if (segments.length > 1) {
			for (let i = 1; i < segments.length; i += 1) {
				onAdd({
					day: current.day,
					startTime: segments[i].startTime,
					endTime: segments[i].endTime,
				});
			}
		}

		setEditingIndex(null);
	};

	const cancelEditedSlot = () => {
		if (editingIndex === null || !slots[editingIndex]) {
			setEditingIndex(null);
			return;
		}
		setEditStart(slots[editingIndex].startTime);
		setEditEnd(slots[editingIndex].endTime);
		setEditingIndex(null);
	};

	const quickAdd = (range: 'morning' | 'afternoon' | 'evening') => {
		if (range === 'morning') {
			setNewStart('09:00');
			setNewEnd('10:00');
			onAdd({ day: selectedDay, startTime: '09:00', endTime: '10:00' });
		} else if (range === 'afternoon') {
			setNewStart('14:00');
			setNewEnd('15:00');
			onAdd({ day: selectedDay, startTime: '14:00', endTime: '15:00' });
		} else {
			setNewStart('18:00');
			setNewEnd('19:00');
			onAdd({ day: selectedDay, startTime: '18:00', endTime: '19:00' });
		}
	};

	const periodLabel = (period: 'morning' | 'afternoon' | 'evening') => {
		if (period === 'morning') return 'Morning';
		if (period === 'afternoon') return 'Afternoon';
		return 'Evening';
	};

	const renderSlotPill = (slot: SlotEntry & { index: number }) => {
		const active = editingIndex === slot.index;

		return (
			<button
				type="button"
				key={`${slot.index}-${slot.startTime}`}
				onClick={() => {
					setEditingIndex(slot.index);
					setEditStart(slot.startTime);
					setEditEnd(slot.endTime);
				}}
				className={`group relative px-3 py-2.5 rounded-lg border text-sm transition-all min-w-[148px] text-left ${active
					? 'bg-(--surface-hover) text-(--primary) border-accent shadow-sm ring-1 ring-accent/40'
					: 'bg-(--surface) text-(--primary) border-(--border) hover:border-accent/40 hover:bg-(--surface-hover)'
					}`}
			>
				<p className="font-medium leading-tight">
					{formatTime(slot.startTime)}
					<span className="mx-1 text-(--secondary)">-&gt;</span>
					{formatTime(slot.endTime)}
				</p>
				<p className="text-[11px] mt-1 text-(--secondary)">
					{getDurationLabel(slot.startTime, slot.endTime)}
				</p>
			</button>
		);
	};

	return (
		<div className="space-y-6 w-full">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-3">
					<div className="w-9 h-9 rounded-lg bg-(--surface-hover) border border-(--border) flex items-center justify-center">
						<svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-(--primary)">Available Slots</h3>
						<p className="text-sm text-(--secondary)">Pick a day, add precise time windows, and fine-tune selected slots from the editor below.</p>
						<div className="mt-3 flex flex-wrap gap-2">
							<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-(--surface-hover) text-(--primary)">
								{totalSlots} total slot{totalSlots !== 1 ? 's' : ''}
							</span>
							<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
								{selectedDay}: {daySlots.length}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
				<div className="xl:col-span-3 rounded-xl border border-(--border) bg-(--surface) p-4 h-fit xl:sticky xl:top-6">
					<div className="mb-3">
						<p className="text-xs uppercase tracking-wide text-(--secondary)">Weekly View</p>
						<p className="text-sm font-semibold text-(--primary)">Select Day</p>
					</div>
					<div className="space-y-2">
						{dayStats.map((item) => {
							const active = item.day === selectedDay;
							return (
								<button
									type="button"
									key={item.day}
									onClick={() => {
										setSelectedDay(item.day);
										cancelEditedSlot();
									}}
									className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${active
										? 'border-accent bg-accent/10 text-accent'
										: 'border-(--border) bg-(--surface) text-(--primary) hover:bg-(--surface-hover)'
										}`}
								>
									<span className="font-medium">{item.day}</span>
									<span className={`inline-flex min-w-6 h-6 items-center justify-center rounded-full px-1 text-xs font-semibold ${active ? 'bg-accent text-white' : 'bg-(--surface-hover) text-(--secondary)'}`}>
										{item.count}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				<div className="xl:col-span-9 rounded-xl border border-(--border) bg-(--surface) p-5 space-y-5">
					<div className="p-3 rounded-xl bg-(--surface-hover) border border-(--border) space-y-3">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<p className="text-sm font-semibold text-(--primary)">Add New Slot</p>
							<p className="text-xs text-(--secondary)">
								Selected day: {selectedDay} • Goes to {periodLabel(targetPeriod)}
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
							<select
								value={selectedDay}
								onChange={(e) => {
									setSelectedDay(e.target.value);
									cancelEditedSlot();
								}}
								className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent"
							>
								{DAYS_OF_WEEK.map((day) => (
									<option key={day} value={day}>{day}</option>
								))}
							</select>
							<select
								value={newStart}
								onChange={(e) => handleNewStartChange(e.target.value)}
								className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent"
							>
								{TIME_OPTIONS.map((time) => (
									<option key={time} value={time} disabled={toMinutes(time) >= toMinutes(newEnd)}>{formatTime(time)}</option>
								))}
							</select>
							<select
								value={newEnd}
								onChange={(e) => handleNewEndChange(e.target.value)}
								className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent"
							>
								{TIME_OPTIONS.map((time) => (
									<option key={time} value={time} disabled={toMinutes(time) <= toMinutes(newStart)}>{formatTime(time)}</option>
								))}
							</select>
							<Button variant="secondary" size="sm" onClick={handleAddSlot} disabled={!isValidRange}>
								Add Slot
							</Button>
						</div>
						{addSplitSegments.length > 1 && (
							<p className="text-xs text-amber-400">
								This range spans multiple periods and will be split into {addSplitSegments.length} slots automatically.
							</p>
						)}
					</div>

					{!isValidRange && (
						<p className="text-xs text-error">End time must be after start time.</p>
					)}

					<div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
						<div className="rounded-xl border border-(--border)">
							<div className="px-3 py-2 border-b border-(--border) flex items-center justify-between">
								<p className="text-sm font-semibold text-(--primary)">Morning</p>
								<button type="button" onClick={() => quickAdd('morning')} className="text-xs text-accent hover:underline">+ Add Slot</button>
							</div>
							<div className="p-3 flex flex-wrap gap-2">
								{slotBuckets.morning.length === 0 ? <p className="text-xs text-(--secondary)">No morning slots</p> : slotBuckets.morning.map(renderSlotPill)}
							</div>
						</div>

						<div className="rounded-xl border border-(--border)">
							<div className="px-3 py-2 border-b border-(--border) flex items-center justify-between">
								<p className="text-sm font-semibold text-(--primary)">Afternoon</p>
								<button type="button" onClick={() => quickAdd('afternoon')} className="text-xs text-accent hover:underline">+ Add Slot</button>
							</div>
							<div className="p-3 flex flex-wrap gap-2">
								{slotBuckets.afternoon.length === 0 ? <p className="text-xs text-(--secondary)">No afternoon slots</p> : slotBuckets.afternoon.map(renderSlotPill)}
							</div>
						</div>

						<div className="rounded-xl border border-(--border)">
							<div className="px-3 py-2 border-b border-(--border) flex items-center justify-between">
								<p className="text-sm font-semibold text-(--primary)">Evening</p>
								<button type="button" onClick={() => quickAdd('evening')} className="text-xs text-accent hover:underline">+ Add Slot</button>
							</div>
							<div className="p-3 flex flex-wrap gap-2">
								{slotBuckets.evening.length === 0 ? <p className="text-xs text-(--secondary)">No evening slots</p> : slotBuckets.evening.map(renderSlotPill)}
							</div>
						</div>
					</div>

					{editingIndex !== null && slots[editingIndex] && (
						<div className="rounded-xl border border-(--border) bg-(--surface-hover) p-3 flex flex-wrap items-center gap-2">
							<p className="text-xs font-medium text-(--secondary) mr-2">Edit selected slot:</p>
							<select
								value={editStart}
								onChange={(e) => handleEditStartChange(e.target.value)}
								className="h-9 px-2 bg-(--surface) border border-(--border) rounded text-sm text-(--primary)"
							>
								{TIME_OPTIONS.map((time) => (
									<option key={time} value={time} disabled={toMinutes(time) >= toMinutes(editEnd)}>{formatTime(time)}</option>
								))}
							</select>
							<span className="text-(--secondary) text-sm">to</span>
							<select
								value={editEnd}
								onChange={(e) => handleEditEndChange(e.target.value)}
								className="h-9 px-2 bg-(--surface) border border-(--border) rounded text-sm text-(--primary)"
							>
								{TIME_OPTIONS.map((time) => (
									<option key={time} value={time} disabled={toMinutes(time) <= toMinutes(editStart)}>{formatTime(time)}</option>
								))}
							</select>
							<Button variant="secondary" size="sm" onClick={cancelEditedSlot}>
								Cancel
							</Button>
							<Button variant="primary" size="sm" onClick={saveEditedSlot} disabled={!isEditRangeValid}>
								Save
							</Button>
							<button
								type="button"
								onClick={() => {
									onRemove(editingIndex);
									setEditingIndex(null);
								}}
								className="ml-auto px-3 h-9 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm"
							>
								Remove
							</button>
						</div>
					)}

					{editingIndex !== null && editSplitSegments.length > 1 && (
						<p className="text-xs text-amber-400">
							This edited range spans multiple periods and will be split into {editSplitSegments.length} slots on save.
						</p>
					)}

					{editingIndex !== null && !isEditRangeValid && (
						<p className="text-xs text-error">End time must be after start time before you can save.</p>
					)}
				</div>
			</div>

			{slots.length === 0 && (
				<div className="text-center py-4 text-(--secondary)">
					<p className="text-sm">No slots added yet. Use the controls above to build your schedule.</p>
				</div>
			)}
		</div>
	);
}

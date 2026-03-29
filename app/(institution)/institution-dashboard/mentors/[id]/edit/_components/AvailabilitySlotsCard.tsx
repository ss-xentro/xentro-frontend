'use client';

import { Card, Button } from '@/components/ui';
import { DAYS_OF_WEEK, TIME_OPTIONS, SlotEntry } from './constants';

interface AvailabilitySlotsCardProps {
	slots: SlotEntry[];
	setSlots: (slots: SlotEntry[]) => void;
}

export function AvailabilitySlotsCard({ slots, setSlots }: AvailabilitySlotsCardProps) {
	const addSlot = () => setSlots([...slots, { day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
	const removeSlot = (i: number) => setSlots(slots.filter((_, idx) => idx !== i));
	const updateSlot = (i: number, field: keyof SlotEntry, value: string) => {
		const updated = [...slots];
		updated[i] = { ...updated[i], [field]: value };
		setSlots(updated);
	};

	return (
		<Card className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold text-(--primary)">Available Slots</h3>
					<p className="text-sm text-(--secondary-light)">Weekly availability for mentoring sessions</p>
				</div>
				<Button variant="secondary" size="sm" onClick={addSlot}>+ Add Slot</Button>
			</div>
			<div className="space-y-3">
				{slots.map((slot, i) => (
					<div key={i} className="flex items-center gap-3 p-3 bg-(--accent-subtle) rounded-lg">
						<select value={slot.day} onChange={(e) => updateSlot(i, 'day', e.target.value)} className="px-3 py-2 text-sm bg-background border border-(--border) rounded-lg focus:outline-none min-w-32">
							{DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
						</select>
						<select value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)} className="px-3 py-2 text-sm bg-background border border-(--border) rounded-lg focus:outline-none">
							{TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
						</select>
						<span className="text-(--secondary-light) text-sm">to</span>
						<select value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)} className="px-3 py-2 text-sm bg-background border border-(--border) rounded-lg focus:outline-none">
							{TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
						</select>
						{slots.length > 1 && (
							<button onClick={() => removeSlot(i)} className="p-2 text-(--secondary) hover:text-red-500 transition-colors" aria-label="Remove time slot">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
							</button>
						)}
					</div>
				))}
			</div>
		</Card>
	);
}

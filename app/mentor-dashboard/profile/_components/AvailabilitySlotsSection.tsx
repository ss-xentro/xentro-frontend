import { Button } from '@/components/ui/Button';
import { SlotEntry, DAYS_OF_WEEK, TIME_OPTIONS } from '../_lib/constants';

interface Props {
	slots: SlotEntry[];
	onAdd: () => void;
	onRemove: (index: number) => void;
	onUpdate: (index: number, field: keyof SlotEntry, value: string) => void;
}

export default function AvailabilitySlotsSection({ slots, onAdd, onRemove, onUpdate }: Props) {
	return (
		<>
			<div className="flex items-center justify-between mb-5">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
						<svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-(--primary)">Available Slots</h3>
						<p className="text-sm text-(--secondary)">Set your weekly availability for mentoring sessions</p>
					</div>
				</div>
				<Button variant="secondary" size="sm" onClick={onAdd}>
					<svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Add Slot
				</Button>
			</div>

			<div className="space-y-3">
				{slots.map((slot, index) => (
					<div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-(--surface-hover) rounded-lg">
						<select
							value={slot.day}
							onChange={(e) => onUpdate(index, 'day', e.target.value)}
							className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light) min-w-[130px]"
						>
							{DAYS_OF_WEEK.map((day) => (
								<option key={day} value={day}>{day}</option>
							))}
						</select>

						<select
							value={slot.startTime}
							onChange={(e) => onUpdate(index, 'startTime', e.target.value)}
							className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light)"
						>
							{TIME_OPTIONS.map((t) => (
								<option key={t} value={t}>{t}</option>
							))}
						</select>

						<span className="text-(--secondary) text-sm">to</span>

						<select
							value={slot.endTime}
							onChange={(e) => onUpdate(index, 'endTime', e.target.value)}
							className="h-10 px-3 bg-(--surface) border border-(--border) rounded-lg text-sm text-(--primary) focus:outline-none focus:border-accent focus:ring-2 focus:ring-(--accent-light)"
						>
							{TIME_OPTIONS.map((t) => (
								<option key={t} value={t}>{t}</option>
							))}
						</select>

						{slots.length > 1 && (
							<button
								onClick={() => onRemove(index)}
								className="w-8 h-8 flex items-center justify-center rounded-lg text-(--secondary) hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
								aria-label="Remove slot"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						)}
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

import { Button, Card, Input, Textarea } from '@/components/ui';
import { ModalMode, EventFormData } from '../_lib/constants';

interface EventFormModalProps {
	mode: ModalMode;
	form: EventFormData;
	saving: boolean;
	onFormChange: (updater: (prev: EventFormData) => EventFormData) => void;
	onSave: () => void;
	onClose: () => void;
}

export default function EventFormModal({ mode, form, saving, onFormChange, onSave, onClose }: EventFormModalProps) {
	if (!mode) return null;

	const set = (field: keyof EventFormData, value: string | boolean) =>
		onFormChange((f) => ({ ...f, [field]: value }));

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<Card className="w-full max-w-lg p-6 space-y-4 mx-4 max-h-[90vh] overflow-y-auto">
				<h2 className="text-xl font-semibold text-(--primary)">
					{mode === 'create' ? 'New Event' : 'Edit Event'}
				</h2>

				<Input label="Event name" placeholder="Demo Day 2025" value={form.name} onChange={(e) => set('name', e.target.value)} required autoFocus />
				<Textarea label="Description" placeholder="What is this event about?" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input label="Type" placeholder="Workshop, Demo Day, Meetup…" value={form.type} onChange={(e) => set('type', e.target.value)} />
					<Input label="Location" placeholder="Venue or URL" value={form.location} onChange={(e) => set('location', e.target.value)} />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input label="Start time" type="datetime-local" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
					<Input label="End time" type="datetime-local" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input label="Price (USD)" type="number" placeholder="0 for free" value={form.price} onChange={(e) => set('price', e.target.value)} />
					<Input label="Available slots" type="number" min="1" placeholder="Total bookable seats" value={form.maxAttendees} onChange={(e) => set('maxAttendees', e.target.value)} />
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input label="Status" placeholder="draft | published | cancelled" value={form.status} onChange={(e) => set('status', e.target.value as EventFormData['status'])} />
					<Input label="Cover image URL" placeholder="https://..." value={form.coverImage} onChange={(e) => set('coverImage', e.target.value)} />
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input label="Cancellation cutoff (hours)" type="number" min="0" value={form.cancellationCutoffHours} onChange={(e) => set('cancellationCutoffHours', e.target.value)} />
					<Input label="Recurrence rule (JSON)" placeholder='{"frequency":"weekly"}' value={form.recurrenceRuleJson} onChange={(e) => set('recurrenceRuleJson', e.target.value)} />
				</div>

				<Textarea label="Gallery (JSON array)" rows={3} value={form.galleryJson} onChange={(e) => set('galleryJson', e.target.value)} />
				<Textarea label="Speaker lineup (JSON array)" rows={3} value={form.speakerLineupJson} onChange={(e) => set('speakerLineupJson', e.target.value)} />
				<Textarea label="Agenda timeline (JSON array)" rows={3} value={form.agendaTimelineJson} onChange={(e) => set('agendaTimelineJson', e.target.value)} />
				<Textarea label="Ticket types (JSON array)" rows={3} value={form.ticketTypesJson} onChange={(e) => set('ticketTypesJson', e.target.value)} />

				<label className="flex items-center gap-2 text-sm text-(--primary) cursor-pointer">
					<input type="checkbox" checked={form.isVirtual} onChange={(e) => set('isVirtual', e.target.checked)} className="rounded border-(--border)" />
					Virtual event
				</label>

				<div className="flex items-center justify-end gap-3 pt-2">
					<Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
					<Button onClick={onSave} disabled={saving || !form.name.trim()}>
						{saving ? 'Saving…' : mode === 'create' ? 'Create Event' : 'Save Changes'}
					</Button>
				</div>
			</Card>
		</div>
	);
}

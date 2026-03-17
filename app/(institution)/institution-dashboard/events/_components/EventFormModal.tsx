import { Button, Card, Input, Textarea } from '@/components/ui';
import { ModalMode, EventFormData } from '../_lib/constants';
import { useState, useRef } from 'react';

interface EventFormModalProps {
	mode: ModalMode;
	form: EventFormData;
	saving: boolean;
	onFormChange: (updater: (prev: EventFormData) => EventFormData) => void;
	onSave: () => void;
	onClose: () => void;
}

const EVENT_TYPES = ['workshop', 'meetup', 'conference', 'demo_day', 'pitch', 'networking', 'webinar', 'other'];
const EVENT_STATUSES = ['draft', 'published', 'cancelled'] as const;

export default function EventFormModal({ mode, form, saving, onFormChange, onSave, onClose }: EventFormModalProps) {
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [speakerEntry, setSpeakerEntry] = useState('');
	const [agendaEntry, setAgendaEntry] = useState('');
	const [ticketEntry, setTicketEntry] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	if (!mode) return null;

	const set = (field: keyof EventFormData, value: string | boolean) =>
		onFormChange((f) => ({ ...f, [field]: value }));

	const splitEntries = (value: string) =>
		value
			.split('\n')
			.map((item) => item.trim())
			.filter(Boolean);

	const addEntry = (field: 'speakerLineupJson' | 'agendaTimelineJson' | 'ticketTypesJson', entry: string, clear: () => void) => {
		const trimmed = entry.trim();
		if (!trimmed) return;
		onFormChange((f) => {
			const current = splitEntries(f[field]);
			return { ...f, [field]: [...current, trimmed].join('\n') };
		});
		clear();
	};

	const removeEntry = (field: 'speakerLineupJson' | 'agendaTimelineJson' | 'ticketTypesJson', index: number) => {
		onFormChange((f) => {
			const current = splitEntries(f[field]);
			current.splice(index, 1);
			return { ...f, [field]: current.join('\n') };
		});
	};

	const formatTypeLabel = (value: string) => value.replace(/[-_]/g, ' ');

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<Card className="w-full max-w-2xl p-6 space-y-4 mx-4 max-h-[90vh] overflow-y-auto bg-white/10 border-white/20">
				<h2 className="text-xl font-semibold text-white">
					{mode === 'create' ? 'Create New Event' : 'Edit Event'}
				</h2>

				{/* Essential Fields */}
				<div className="space-y-4">
					<Input
						label="Event Name"
						placeholder="Demo Day 2025, Workshop, Meetup…"
						value={form.name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('name', e.target.value)}
						required
						autoFocus
						className="bg-white/5 border-white/10 text-white placeholder-gray-500"
					/>

					<Textarea
						label="Description"
						placeholder="Tell people what this event is about…"
						rows={3}
						value={form.description}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('description', e.target.value)}
						className="bg-white/5 border-white/10 text-white placeholder-gray-500"
					/>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-medium text-gray-400 mb-2">Event Type</label>
							<select
								value={form.type}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('type', e.target.value)}
								className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:border-white/40 focus:outline-none"
							>
								<option value="" className="bg-gray-900">Select a type…</option>
								{EVENT_TYPES.map((t) => (
									<option key={t} value={t} className="bg-gray-900 capitalize">
										{formatTypeLabel(t)}
									</option>
								))}
							</select>
						</div>
						<Input
							label="Location"
							placeholder="Virtual or physical venue"
							value={form.location}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('location', e.target.value)}
							className="bg-white/5 border-white/10 text-white placeholder-gray-500"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Start Date & Time"
							type="datetime-local"
							value={form.startTime}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('startTime', e.target.value)}
							className="bg-white/5 border-white/10 text-white"
						/>
						<Input
							label="End Date & Time"
							type="datetime-local"
							value={form.endTime}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('endTime', e.target.value)}
							className="bg-white/5 border-white/10 text-white"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Event Price (USD) - Optional"
							type="number"
							placeholder="Leave empty for free event"
							value={form.price}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('price', e.target.value)}
							className="bg-white/5 border-white/10 text-white placeholder-gray-500"
						/>
						<Input
							label="Available Seats - Optional"
							type="number"
							min="1"
							placeholder="Leave empty for unlimited"
							value={form.maxAttendees}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('maxAttendees', e.target.value)}
							className="bg-white/5 border-white/10 text-white placeholder-gray-500"
						/>
					</div>

					<label className="flex items-center gap-2 text-sm text-white cursor-pointer bg-white/5 p-3 rounded-lg border border-white/10">
						<input
							type="checkbox"
							checked={form.isVirtual}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('isVirtual', e.target.checked)}
							className="rounded border-white/20"
						/>
						This is a virtual event
					</label>
				</div>

				{/* Advanced Options */}
				<div className="border-t border-white/10 pt-4">
					<button
						type="button"
						onClick={() => setShowAdvanced(!showAdvanced)}
						className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
					>
						<svg
							className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
						</svg>
						Advanced Options
					</button>

					{showAdvanced && (
						<div className="mt-4 space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
							<div>
								<label className="block text-xs font-medium text-gray-400 mb-2">Event Status</label>
								<select
									value={form.status}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('status', e.target.value as EventFormData['status'])}
									className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:border-white/40 focus:outline-none"
								>
									{EVENT_STATUSES.map((s) => (
										<option key={s} value={s} className="bg-gray-900 capitalize">
											{s}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-400 mb-2">Cover Image</label>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
									>
										{form.coverImageFile ? '📸 Change Image' : '📸 Upload Image'}
									</button>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											const file = e.target.files?.[0];
											if (file) {
												onFormChange((f) => ({ ...f, coverImageFile: file }));
											}
										}}
									/>
								</div>
								{form.coverImageFile && (
									<p className="text-xs text-green-300 mt-1">✓ {form.coverImageFile.name}</p>
								)}
							</div>

							<Input
								label="Cancellation Cutoff (hours)"
								type="number"
								min="0"
								value={form.cancellationCutoffHours}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('cancellationCutoffHours', e.target.value)}
								className="bg-white/5 border-white/10 text-white placeholder-gray-500"
							/>

							<details className="border-t border-white/10 pt-4">
								<summary className="cursor-pointer text-sm text-gray-300 hover:text-white flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
									</svg>
									More Options (Speakers, Agenda, Tickets)
								</summary>
								<div className="mt-4 space-y-4 pt-4 border-t border-white/10">
									<div className="space-y-2">
										<label className="block text-xs font-medium text-gray-400">Speakers</label>
										<div className="flex gap-2">
											<Input
												placeholder="Enter speaker name"
												value={speakerEntry}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpeakerEntry(e.target.value)}
												className="bg-white/5 border-white/10 text-white placeholder-gray-500"
											/>
											<Button
												type="button"
												onClick={() => addEntry('speakerLineupJson', speakerEntry, () => setSpeakerEntry(''))}
												className="bg-blue-600 hover:bg-blue-700"
											>
												Add
											</Button>
										</div>
										<div className="flex flex-wrap gap-2">
											{splitEntries(form.speakerLineupJson).map((item, idx) => (
												<button
													key={`${item}-${idx}`}
													type="button"
													onClick={() => removeEntry('speakerLineupJson', idx)}
													className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-gray-200 hover:text-white"
												>
													{item} x
												</button>
											))}
										</div>
									</div>

									<div className="space-y-2">
										<label className="block text-xs font-medium text-gray-400">Agenda</label>
										<div className="flex gap-2">
											<Input
												placeholder="Enter agenda item"
												value={agendaEntry}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgendaEntry(e.target.value)}
												className="bg-white/5 border-white/10 text-white placeholder-gray-500"
											/>
											<Button
												type="button"
												onClick={() => addEntry('agendaTimelineJson', agendaEntry, () => setAgendaEntry(''))}
												className="bg-blue-600 hover:bg-blue-700"
											>
												Add
											</Button>
										</div>
										<div className="flex flex-wrap gap-2">
											{splitEntries(form.agendaTimelineJson).map((item, idx) => (
												<button
													key={`${item}-${idx}`}
													type="button"
													onClick={() => removeEntry('agendaTimelineJson', idx)}
													className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-gray-200 hover:text-white"
												>
													{item} x
												</button>
											))}
										</div>
									</div>

									<div className="space-y-2">
										<label className="block text-xs font-medium text-gray-400">Ticket Types</label>
										<div className="flex gap-2">
											<Input
												placeholder="Enter ticket type"
												value={ticketEntry}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketEntry(e.target.value)}
												className="bg-white/5 border-white/10 text-white placeholder-gray-500"
											/>
											<Button
												type="button"
												onClick={() => addEntry('ticketTypesJson', ticketEntry, () => setTicketEntry(''))}
												className="bg-blue-600 hover:bg-blue-700"
											>
												Add
											</Button>
										</div>
										<div className="flex flex-wrap gap-2">
											{splitEntries(form.ticketTypesJson).map((item, idx) => (
												<button
													key={`${item}-${idx}`}
													type="button"
													onClick={() => removeEntry('ticketTypesJson', idx)}
													className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-gray-200 hover:text-white"
												>
													{item} x
												</button>
											))}
										</div>
									</div>
								</div>
							</details>
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2 justify-end border-t border-white/10 pt-4">
					<Button variant="ghost" onClick={onClose} disabled={saving}>
						Cancel
					</Button>
					<Button onClick={onSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
						{saving ? 'Saving…' : 'Save Event'}
					</Button>
				</div>
			</Card>
		</div>
	);
}

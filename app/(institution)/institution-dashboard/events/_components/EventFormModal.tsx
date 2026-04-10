import { Button, Card, Input, Textarea, Modal } from '@/components/ui';
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
		<Modal isOpen={!!mode} onClose={onClose} variant="dark" title={mode === 'create' ? 'Create New Event' : 'Edit Event'} className="max-w-2xl max-h-[90vh] overflow-y-auto">
			{/* Essential Fields */}
			<div className="space-y-4">
				<Input
					label="Event Name"
					placeholder="Demo Day 2025, Workshop, Meetup…"
					value={form.name}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('name', e.target.value)}
					required
					autoFocus
					className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
				/>

				<Textarea
					label="Description"
					placeholder="Tell people what this event is about…"
					rows={3}
					value={form.description}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('description', e.target.value)}
					className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
				/>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-xs font-medium text-(--secondary) mb-2">Event Type</label>
						<select
							value={form.type}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('type', e.target.value)}
							className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
						>
							<option value="" className="bg-(--surface)">Select a type…</option>
							{EVENT_TYPES.map((t) => (
								<option key={t} value={t} className="bg-(--surface) capitalize">
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
						className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Domain"
						placeholder="ai_ml, fintech, healthtech..."
						value={form.domain}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('domain', e.target.value)}
						className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
					/>
					<div>
						<label className="block text-xs font-medium text-(--secondary) mb-2">Mode</label>
						<select
							value={form.mode}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('mode', e.target.value)}
							className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
						>
							<option value="online" className="bg-(--surface)">Online</option>
							<option value="offline" className="bg-(--surface)">Offline</option>
							<option value="hybrid" className="bg-(--surface)">Hybrid</option>
						</select>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<Input label="City" value={form.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('city', e.target.value)} className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)" />
					<Input label="State" value={form.state} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('state', e.target.value)} className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)" />
					<Input label="Country" value={form.country} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('country', e.target.value)} className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)" />
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Start Date & Time"
						type="datetime-local"
						value={form.startTime}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('startTime', e.target.value)}
						className="bg-(--accent-subtle) border-(--border) text-(--primary)"
					/>
					<Input
						label="End Date & Time"
						type="datetime-local"
						value={form.endTime}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('endTime', e.target.value)}
						className="bg-(--accent-subtle) border-(--border) text-(--primary)"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Event Price (USD) - Optional"
						type="number"
						placeholder="Leave empty for free event"
						value={form.price}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('price', e.target.value)}
						className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
					/>
					<Input
						label="Available Seats - Optional"
						type="number"
						min="1"
						placeholder="Leave empty for unlimited"
						value={form.maxAttendees}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('maxAttendees', e.target.value)}
						className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-xs font-medium text-(--secondary) mb-2">Pricing Type</label>
						<select
							value={form.pricingType}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('pricingType', e.target.value)}
							className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
						>
							<option value="free" className="bg-(--surface)">Free</option>
							<option value="paid" className="bg-(--surface)">Paid</option>
							<option value="freemium" className="bg-(--surface)">Freemium</option>
							<option value="sponsored" className="bg-(--surface)">Sponsored</option>
						</select>
					</div>
					<div>
						<label className="block text-xs font-medium text-(--secondary) mb-2">Organizer Type</label>
						<select
							value={form.organizerType}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('organizerType', e.target.value)}
							className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
						>
							<option value="institution" className="bg-(--surface)">Institution</option>
							<option value="incubator_accelerator" className="bg-(--surface)">Incubator / Accelerator</option>
							<option value="corporate" className="bg-(--surface)">Corporate</option>
							<option value="government" className="bg-(--surface)">Government</option>
							<option value="independent_mentor" className="bg-(--surface)">Independent Mentor</option>
							<option value="xentro" className="bg-(--surface)">Xentro Hosted</option>
						</select>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Textarea
						label="Audience Types (one per line)"
						rows={3}
						value={form.audienceTypes}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('audienceTypes', e.target.value)}
						className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
					/>
					<Textarea
						label="Startup Stages (one per line)"
						rows={3}
						value={form.startupStages}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('startupStages', e.target.value)}
						className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Textarea
						label="Benefits / Outcomes (one per line)"
						rows={3}
						value={form.benefits}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('benefits', e.target.value)}
						className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
					/>
					<div className="space-y-4">
						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-2">Difficulty</label>
							<select value={form.difficultyLevel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('difficultyLevel', e.target.value)} className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none">
								<option value="beginner" className="bg-(--surface)">Beginner</option>
								<option value="intermediate" className="bg-(--surface)">Intermediate</option>
								<option value="advanced" className="bg-(--surface)">Advanced</option>
							</select>
						</div>
						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-2">Application Requirement</label>
							<select value={form.applicationRequirement} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('applicationRequirement', e.target.value)} className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none">
								<option value="open_entry" className="bg-(--surface)">Open Entry</option>
								<option value="application_required" className="bg-(--surface)">Application Required</option>
								<option value="invite_only" className="bg-(--surface)">Invite Only</option>
							</select>
						</div>
						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-2">Availability</label>
							<select value={form.availabilityStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('availabilityStatus', e.target.value)} className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none">
								<option value="open" className="bg-(--surface)">Open</option>
								<option value="limited" className="bg-(--surface)">Limited Seats</option>
								<option value="waitlist" className="bg-(--surface)">Waitlist</option>
							</select>
						</div>
					</div>
				</div>

				<label className="flex items-center gap-2 text-sm text-(--primary) cursor-pointer bg-(--accent-subtle) p-3 rounded-lg border border-(--border)">
					<input
						type="checkbox"
						checked={form.isVirtual}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('isVirtual', e.target.checked)}
						className="rounded border-(--border-hover)"
					/>
					This is a virtual event
				</label>
			</div>

			{/* Advanced Options */}
			<div className="border-t border-(--border) pt-4">
				<button
					type="button"
					onClick={() => setShowAdvanced(!showAdvanced)}
					className="flex items-center gap-2 text-sm text-(--primary-light) hover:text-(--primary) transition-colors"
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
					<div className="mt-4 space-y-4 p-4 bg-(--accent-subtle) rounded-lg border border-(--border)">
						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-2">Event Status</label>
							<select
								value={form.status}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('status', e.target.value as EventFormData['status'])}
								className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
							>
								{EVENT_STATUSES.map((s) => (
									<option key={s} value={s} className="bg-(--surface) capitalize">
										{s}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-xs font-medium text-(--secondary) mb-2">Cover Image</label>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="flex-1 px-3 py-2 bg-brand hover:bg-(--brand-hover) text-white text-sm rounded-lg transition-colors"
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
							className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
						/>

						<details className="border-t border-(--border) pt-4">
							<summary className="cursor-pointer text-sm text-(--primary-light) hover:text-(--primary) flex items-center gap-2">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
								</svg>
								More Options (Speakers, Agenda, Tickets)
							</summary>
							<div className="mt-4 space-y-4 pt-4 border-t border-(--border)">
								<div className="space-y-2">
									<label className="block text-xs font-medium text-(--secondary)">Speakers</label>
									<div className="flex gap-2">
										<Input
											placeholder="Enter speaker name"
											value={speakerEntry}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpeakerEntry(e.target.value)}
											className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
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
												className="px-2 py-1 text-xs bg-(--accent-light) border border-(--border-hover) rounded text-(--primary-light) hover:text-(--primary)"
											>
												{item} x
											</button>
										))}
									</div>
								</div>

								<div className="space-y-2">
									<label className="block text-xs font-medium text-(--secondary)">Agenda</label>
									<div className="flex gap-2">
										<Input
											placeholder="Enter agenda item"
											value={agendaEntry}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgendaEntry(e.target.value)}
											className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
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
												className="px-2 py-1 text-xs bg-(--accent-light) border border-(--border-hover) rounded text-(--primary-light) hover:text-(--primary)"
											>
												{item} x
											</button>
										))}
									</div>
								</div>

								<div className="space-y-2">
									<label className="block text-xs font-medium text-(--secondary)">Ticket Types</label>
									<div className="flex gap-2">
										<Input
											placeholder="Enter ticket type"
											value={ticketEntry}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketEntry(e.target.value)}
											className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-(--secondary)"
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
												className="px-2 py-1 text-xs bg-(--accent-light) border border-(--border-hover) rounded text-(--primary-light) hover:text-(--primary)"
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

			<div className="flex gap-2 justify-end border-t border-(--border) pt-4">
				<Button variant="ghost" onClick={onClose} disabled={saving}>
					Cancel
				</Button>
				<Button onClick={onSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
					{saving ? 'Saving…' : 'Save Event'}
				</Button>
			</div>
		</Modal>
	);
}

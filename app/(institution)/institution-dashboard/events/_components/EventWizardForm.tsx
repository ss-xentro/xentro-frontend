import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { toast } from 'sonner';
import { EventFormData } from '../_lib/constants';

const EVENT_TYPES = ['workshop', 'meetup', 'conference', 'demo_day', 'pitch', 'networking', 'webinar', 'other'];
const EVENT_STATUSES = ['draft', 'published', 'cancelled'] as const;
const STEP_TITLES = ['Basics', 'Scheduling', 'Publish'];

interface EventWizardFormProps {
	initialForm: EventFormData;
	autosaveKey: string;
	submitLabel: string;
	savingLabel: string;
	onCancel: () => void;
	onSubmit: (form: EventFormData) => Promise<void>;
}

function formatTypeLabel(value: string) {
	return value.replace(/[-_]/g, ' ');
}

function validateStep(step: number, form: EventFormData): string | null {
	if (step === 0) {
		if (!form.name.trim()) return 'Event name is required.';
		if (!form.type.trim()) return 'Event type is required.';
		return null;
	}

	if (step === 1) {
		if (!form.startTime || !form.endTime) return 'Start and end date/time are required.';
		if (new Date(form.endTime).getTime() <= new Date(form.startTime).getTime()) {
			return 'End time must be after start time.';
		}
		if (form.maxAttendees && Number(form.maxAttendees) <= 0) {
			return 'Available seats must be greater than 0 when provided.';
		}
	}

	return null;
}

function validateBeforeSubmit(form: EventFormData): string | null {
	for (const step of [0, 1]) {
		const error = validateStep(step, form);
		if (error) return error;
	}
	return null;
}

export default function EventWizardForm({
	initialForm,
	autosaveKey,
	submitLabel,
	savingLabel,
	onCancel,
	onSubmit,
}: EventWizardFormProps) {
	const [step, setStep] = useState(0);
	const [form, setForm] = useState<EventFormData>(initialForm);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const fallbackForm = { ...initialForm };

		try {
			const raw = localStorage.getItem(autosaveKey);
			if (!raw) {
				setForm(fallbackForm);
				setStep(0);
				return;
			}

			const parsed = JSON.parse(raw) as {
				form?: Partial<EventFormData>;
				step?: number;
				savedAt?: string;
			};

			const restoredForm = { ...fallbackForm, ...(parsed.form || {}) };
			const restoredStep = typeof parsed.step === 'number' ? Math.max(0, Math.min(parsed.step, STEP_TITLES.length - 1)) : 0;

			setForm(restoredForm);
			setStep(restoredStep);

			if (parsed.savedAt) {
				const when = new Date(parsed.savedAt).toLocaleString();
				toast.info(`Restored autosaved draft from ${when}.`);
			} else {
				toast.info('Restored autosaved draft.');
			}
		} catch {
			setForm(fallbackForm);
			setStep(0);
		}
	}, [autosaveKey, initialForm]);

	useEffect(() => {
		const payload = {
			form,
			step,
			savedAt: new Date().toISOString(),
		};

		try {
			localStorage.setItem(autosaveKey, JSON.stringify(payload));
		} catch {
			// Ignore localStorage write failures (private mode/quota exceeded).
		}
	}, [autosaveKey, form, step]);

	const progress = useMemo(() => ((step + 1) / STEP_TITLES.length) * 100, [step]);

	const setField = (field: keyof EventFormData, value: string | boolean) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const next = () => {
		const message = validateStep(step, form);
		if (message) {
			toast.error(message);
			return;
		}

		setStep((prev) => Math.min(prev + 1, STEP_TITLES.length - 1));
	};

	const previous = () => {
		setStep((prev) => Math.max(prev - 1, 0));
	};

	const submit = async () => {
		const message = validateBeforeSubmit(form);
		if (message) {
			toast.error(message);
			if (!form.name.trim() || !form.type.trim()) {
				setStep(0);
			} else {
				setStep(1);
			}
			return;
		}

		setSaving(true);

		try {
			await onSubmit(form);
			localStorage.removeItem(autosaveKey);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Unable to save event.');
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<Card className="p-5 bg-(--accent-subtle) border-(--border)">
				<div className="flex items-center justify-between text-xs text-(--primary-light) mb-3">
					<span>Step {step + 1} of {STEP_TITLES.length}</span>
					<span>{STEP_TITLES[step]}</span>
				</div>
				<div className="h-2 w-full rounded-full bg-(--accent-light) overflow-hidden">
					<div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }} />
				</div>
			</Card>


			<Card className="p-6 bg-(--accent-subtle) border-(--border) space-y-6">
				{step === 0 && (
					<div className="space-y-5">
						<Input
							label="Event Name"
							placeholder="Demo Day 2026"
							value={form.name}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('name', e.target.value)}
							required
							autoFocus
							className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
						/>

						<Textarea
							label="Description"
							placeholder="Tell people what the event is about"
							rows={4}
							value={form.description}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('description', e.target.value)}
							className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
						/>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Event Type</label>
								<select
									value={form.type}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('type', e.target.value)}
									className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
								>
									{EVENT_TYPES.map((item) => (
										<option key={item} value={item} className="bg-(--surface) capitalize">
											{formatTypeLabel(item)}
										</option>
									))}
								</select>
							</div>

							<Input
								label="Location"
								placeholder="Venue name or Online"
								value={form.location}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('location', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<Input
								label="Domain"
								placeholder="fintech, healthtech, ai_ml"
								value={form.domain}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('domain', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
							/>
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Mode</label>
								<select
									value={form.mode}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('mode', e.target.value)}
									className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
								>
									<option value="online" className="bg-(--surface)">Online</option>
									<option value="offline" className="bg-(--surface)">Offline</option>
									<option value="hybrid" className="bg-(--surface)">Hybrid</option>
								</select>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							<Input label="City" value={form.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('city', e.target.value)} className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500" />
							<Input label="State" value={form.state} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('state', e.target.value)} className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500" />
							<Input label="Country" value={form.country} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('country', e.target.value)} className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500" />
						</div>
					</div>
				)}

				{step === 1 && (
					<div className="space-y-5">
						<div className="grid gap-4 md:grid-cols-2">
							<Input
								label="Start Date and Time"
								type="datetime-local"
								value={form.startTime}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('startTime', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary)"
							/>
							<Input
								label="End Date and Time"
								type="datetime-local"
								value={form.endTime}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('endTime', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary)"
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<Input
								label="Event Price (USD)"
								type="number"
								placeholder="Leave empty for free"
								value={form.price}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('price', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
							/>
							<Input
								label="Available Seats"
								type="number"
								min="1"
								placeholder="Leave empty for unlimited"
								value={form.maxAttendees}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('maxAttendees', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Pricing Type</label>
								<select
									value={form.pricingType}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('pricingType', e.target.value)}
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
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('organizerType', e.target.value)}
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

						<div className="grid gap-4 md:grid-cols-2">
							<Textarea
								label="Audience Types (one per line)"
								rows={4}
								value={form.audienceTypes}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('audienceTypes', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
							/>
							<Textarea
								label="Startup Stages (one per line)"
								rows={4}
								value={form.startupStages}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('startupStages', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
							/>
						</div>

						<Textarea
							label="Benefits and Outcomes (one per line)"
							rows={4}
							value={form.benefits}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('benefits', e.target.value)}
							className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
						/>
					</div>
				)}

				{step === 2 && (
					<div className="space-y-5">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Difficulty Level</label>
								<select
									value={form.difficultyLevel}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('difficultyLevel', e.target.value)}
									className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
								>
									<option value="beginner" className="bg-(--surface)">Beginner</option>
									<option value="intermediate" className="bg-(--surface)">Intermediate</option>
									<option value="advanced" className="bg-(--surface)">Advanced</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Application Requirement</label>
								<select
									value={form.applicationRequirement}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('applicationRequirement', e.target.value)}
									className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
								>
									<option value="open_entry" className="bg-(--surface)">Open Entry</option>
									<option value="application_required" className="bg-(--surface)">Application Required</option>
									<option value="invite_only" className="bg-(--surface)">Invite Only</option>
								</select>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Availability</label>
								<select
									value={form.availabilityStatus}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('availabilityStatus', e.target.value)}
									className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
								>
									<option value="open" className="bg-(--surface)">Open</option>
									<option value="limited" className="bg-(--surface)">Limited Seats</option>
									<option value="waitlist" className="bg-(--surface)">Waitlist</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-(--secondary) mb-2">Status</label>
								<select
									value={form.status}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('status', e.target.value as EventFormData['status'])}
									className="w-full px-3 py-2 bg-(--accent-subtle) border border-(--border) text-(--primary) rounded-lg focus:border-(--border-focus) focus:outline-none"
								>
									{EVENT_STATUSES.map((item) => (
										<option key={item} value={item} className="bg-(--surface) capitalize">
											{item}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<Textarea
								label="Speaker Names (one per line)"
								rows={4}
								value={form.speakerLineupJson}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('speakerLineupJson', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
							/>
							<Textarea
								label="Agenda Items (one per line)"
								rows={4}
								value={form.agendaTimelineJson}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('agendaTimelineJson', e.target.value)}
								className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
							/>
						</div>

						<Textarea
							label="Ticket Types (one per line)"
							rows={3}
							value={form.ticketTypesJson}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('ticketTypesJson', e.target.value)}
							className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
						/>

						<Input
							label="Cancellation Cutoff (hours)"
							type="number"
							min="0"
							value={form.cancellationCutoffHours}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('cancellationCutoffHours', e.target.value)}
							className="bg-(--accent-subtle) border-(--border) text-(--primary) placeholder-gray-500"
						/>
					</div>
				)}

				<div className="flex items-center justify-between border-t border-(--border) pt-5">
					<Button variant="ghost" onClick={step === 0 ? onCancel : previous} disabled={saving}>
						{step === 0 ? 'Cancel' : 'Previous'}
					</Button>

					{step < STEP_TITLES.length - 1 ? (
						<Button onClick={next}>Next Step</Button>
					) : (
						<Button onClick={submit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
							{saving ? savingLabel : submitLabel}
						</Button>
					)}
				</div>
			</Card>
		</>
	);
}

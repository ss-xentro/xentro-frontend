'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';

type EventItem = {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	type: string | null;
	audienceTypes?: string[];
	startupStages?: string[];
	domain?: string | null;
	mode?: string | null;
	city?: string | null;
	state?: string | null;
	country?: string | null;
	pricingType?: string | null;
	organizerType?: string | null;
	benefits?: string[];
	difficultyLevel?: string | null;
	applicationRequirement?: string | null;
	availabilityStatus?: string | null;
	averageRating?: number | null;
	startTime: string | null;
	endTime: string | null;
	isVirtual: boolean;
	maxAttendees: number | null;
	attendeeCount: number;
	organizerName: string | null;
	approved: boolean;
	status?: 'draft' | 'published' | 'cancelled';
	coverImage?: string | null;
	gallery?: string[];
	speakerLineup?: unknown[];
	agendaTimeline?: unknown[];
	recurrenceRule?: Record<string, unknown> | null;
	ticketTypes?: unknown[];
	cancellationCutoffHours?: number;
};

type EventForm = {
	name: string;
	description: string;
	location: string;
	type: string;
	audienceTypes: string;
	startupStages: string;
	domain: string;
	mode: string;
	city: string;
	state: string;
	country: string;
	pricingType: string;
	organizerType: string;
	benefits: string;
	difficultyLevel: string;
	applicationRequirement: string;
	availabilityStatus: string;
	averageRating: string;
	startTime: string;
	endTime: string;
	price: string;
	isVirtual: boolean;
	maxAttendees: string;
	status: 'draft' | 'published' | 'cancelled';
	coverImage: string;
	galleryJson: string;
	speakerLineupJson: string;
	agendaTimelineJson: string;
	recurrenceRuleJson: string;
	ticketTypesJson: string;
	cancellationCutoffHours: string;
};

const EMPTY_FORM: EventForm = {
	name: '',
	description: '',
	location: '',
	type: '',
	audienceTypes: '',
	startupStages: '',
	domain: '',
	mode: 'offline',
	city: '',
	state: '',
	country: '',
	pricingType: 'free',
	organizerType: 'xentro',
	benefits: '',
	difficultyLevel: 'beginner',
	applicationRequirement: 'open_entry',
	availabilityStatus: 'open',
	averageRating: '',
	startTime: '',
	endTime: '',
	price: '',
	isVirtual: false,
	maxAttendees: '',
	status: 'published',
	coverImage: '',
	galleryJson: '[]',
	speakerLineupJson: '[]',
	agendaTimelineJson: '[]',
	recurrenceRuleJson: '',
	ticketTypesJson: '[]',
	cancellationCutoffHours: '2',
};

function toForm(event: EventItem): EventForm {
	return {
		name: event.name,
		description: event.description || '',
		location: event.location || '',
		type: event.type || '',
		audienceTypes: (event.audienceTypes || []).join('\n'),
		startupStages: (event.startupStages || []).join('\n'),
		domain: event.domain || '',
		mode: event.mode || 'offline',
		city: event.city || '',
		state: event.state || '',
		country: event.country || '',
		pricingType: event.pricingType || 'free',
		organizerType: event.organizerType || 'xentro',
		benefits: (event.benefits || []).join('\n'),
		difficultyLevel: event.difficultyLevel || 'beginner',
		applicationRequirement: event.applicationRequirement || 'open_entry',
		availabilityStatus: event.availabilityStatus || 'open',
		averageRating: event.averageRating != null ? String(event.averageRating) : '',
		startTime: event.startTime ? event.startTime.slice(0, 16) : '',
		endTime: event.endTime ? event.endTime.slice(0, 16) : '',
		price: '',
		isVirtual: event.isVirtual,
		maxAttendees: event.maxAttendees != null ? String(event.maxAttendees) : '',
		status: event.status || 'published',
		coverImage: event.coverImage || '',
		galleryJson: JSON.stringify(event.gallery || [], null, 2),
		speakerLineupJson: JSON.stringify(event.speakerLineup || [], null, 2),
		agendaTimelineJson: JSON.stringify(event.agendaTimeline || [], null, 2),
		recurrenceRuleJson: event.recurrenceRule ? JSON.stringify(event.recurrenceRule, null, 2) : '',
		ticketTypesJson: JSON.stringify(event.ticketTypes || [], null, 2),
		cancellationCutoffHours: String(event.cancellationCutoffHours ?? 2),
	};
}

export default function AdminEventsPage() {
	const [events, setEvents] = useState<EventItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState<EventForm>(EMPTY_FORM);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);

	const fetchEvents = useCallback(async () => {
		const token = getSessionToken('admin');
		if (!token) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/api/events/', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to load events');
			const data = await res.json();
			setEvents(data.events || data.data || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load events');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchEvents(); }, [fetchEvents]);

	const openCreate = () => {
		setEditingId(null);
		setForm(EMPTY_FORM);
		setShowModal(true);
	};

	const openEdit = (event: EventItem) => {
		setEditingId(event.id);
		setForm(toForm(event));
		setShowModal(true);
	};

	const saveEvent = async () => {
		const token = getSessionToken('admin');
		if (!token) return;
		if (!form.name.trim()) {
			setError('Event name is required');
			return;
		}
		if (!form.maxAttendees || Number(form.maxAttendees) <= 0) {
			setError('Available slots are required when creating an event.');
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const parseLines = (value: string) => value.split('\n').map((x) => x.trim()).filter(Boolean);
			const parseJsonOrThrow = (label: string, value: string, fallback: unknown) => {
				const trimmed = value.trim();
				if (!trimmed) return fallback;
				try {
					return JSON.parse(trimmed);
				} catch {
					throw new Error(`${label} must be valid JSON`);
				}
			};

			const body = {
				name: form.name,
				description: form.description || null,
				location: form.location || null,
				type: form.type || null,
				audience_types: parseLines(form.audienceTypes),
				startup_stages: parseLines(form.startupStages),
				domain: form.domain || null,
				mode: form.mode || null,
				city: form.city || null,
				state: form.state || null,
				country: form.country || null,
				pricing_type: form.pricingType || null,
				organizer_type: form.organizerType || null,
				benefits: parseLines(form.benefits),
				difficulty_level: form.difficultyLevel || null,
				application_requirement: form.applicationRequirement || null,
				availability_status: form.availabilityStatus || null,
				average_rating: form.averageRating ? Number(form.averageRating) : null,
				start_time: form.startTime || null,
				end_time: form.endTime || null,
				price: form.price ? Number(form.price) : null,
				is_virtual: form.isVirtual,
				max_attendees: Number(form.maxAttendees),
				status: form.status,
				cover_image: form.coverImage || null,
				cancellation_cutoff_hours: form.cancellationCutoffHours ? Number(form.cancellationCutoffHours) : 2,
				gallery: parseJsonOrThrow('Gallery', form.galleryJson, []),
				speaker_lineup: parseJsonOrThrow('Speaker lineup', form.speakerLineupJson, []),
				agenda_timeline: parseJsonOrThrow('Agenda timeline', form.agendaTimelineJson, []),
				recurrence_rule: parseJsonOrThrow('Recurrence rule', form.recurrenceRuleJson, null),
				ticket_types: parseJsonOrThrow('Ticket types', form.ticketTypesJson, []),
			};
			const url = editingId ? `/api/events/${editingId}/` : '/api/events/';
			const method = editingId ? 'PATCH' : 'POST';
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload.message || 'Failed to save event');
			}
			setShowModal(false);
			setEditingId(null);
			setForm(EMPTY_FORM);
			await fetchEvents();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save event');
		} finally {
			setSaving(false);
		}
	};

	const deleteEvent = async (id: string) => {
		const token = getSessionToken('admin');
		if (!token) return;
		if (!window.confirm('Delete this event?')) return;
		try {
			const res = await fetch(`/api/events/${id}/`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to delete event');
			setEvents((prev) => prev.filter((ev) => ev.id !== id));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete event');
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Events</h1>
					<p className="text-sm text-gray-600">Manage Xentro and institution events, slots, and details.</p>
				</div>
				<button
					type="button"
					onClick={openCreate}
					className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
				>
					+ New Event
				</button>
			</div>

			{error && (
				<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			)}

			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-44 rounded-xl bg-gray-100 animate-pulse" />
					))}
				</div>
			) : events.length === 0 ? (
				<Card className="p-8 text-center">
					<p className="text-gray-600">No events yet.</p>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{events.map((event) => (
						<Card key={event.id} className="p-5 space-y-3">
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="font-semibold text-gray-900">{event.name}</h3>
									<p className="text-xs text-gray-500 mt-1">by {event.organizerName || 'Xentro'}</p>
								</div>
								<span className={`text-xs px-2 py-1 rounded ${event.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
									{event.approved ? 'Approved' : 'Pending'}
								</span>
							</div>
							<p className="text-sm text-gray-600 line-clamp-2">{event.description || 'No description'}</p>
							<div className="text-xs text-gray-600 space-y-1">
								<p>Slots: {event.attendeeCount} booked / {event.maxAttendees ?? 'unlimited'}</p>
								<p>{event.isVirtual ? 'Online event' : (event.location || 'Offline event')}</p>
							</div>
							<div className="flex items-center gap-3 border-t border-gray-200 pt-3">
								<button className="text-sm text-blue-600 hover:underline" onClick={() => openEdit(event)}>Edit</button>
								<button className="text-sm text-red-600 hover:underline" onClick={() => deleteEvent(event.id)}>Delete</button>
							</div>
						</Card>
					))}
				</div>
			)}

			{showModal && (
				<div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
					<Card className="w-full max-w-xl p-6 space-y-4">
						<h2 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit Event' : 'New Event'}</h2>
						<div className="grid grid-cols-1 gap-4">
							<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Event name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
							<textarea className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[92px]" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
								<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Domain" value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} />
								<select className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}>
									<option value="online">Online</option>
									<option value="offline">Offline</option>
									<option value="hybrid">Hybrid</option>
								</select>
								<select className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.pricingType} onChange={(e) => setForm((f) => ({ ...f, pricingType: e.target.value }))}>
									<option value="free">Free</option>
									<option value="paid">Paid</option>
									<option value="freemium">Freemium</option>
									<option value="sponsored">Sponsored</option>
								</select>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
								<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
								<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
							</div>
							<textarea className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[72px]" placeholder="Audience types (one per line)" value={form.audienceTypes} onChange={(e) => setForm((f) => ({ ...f, audienceTypes: e.target.value }))} />
							<textarea className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[72px]" placeholder="Startup stages (one per line)" value={form.startupStages} onChange={(e) => setForm((f) => ({ ...f, startupStages: e.target.value }))} />
							<textarea className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[72px]" placeholder="Benefits / outcomes (one per line)" value={form.benefits} onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))} />
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<select className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.difficultyLevel} onChange={(e) => setForm((f) => ({ ...f, difficultyLevel: e.target.value }))}>
									<option value="beginner">Beginner</option>
									<option value="intermediate">Intermediate</option>
									<option value="advanced">Advanced</option>
								</select>
								<select className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.applicationRequirement} onChange={(e) => setForm((f) => ({ ...f, applicationRequirement: e.target.value }))}>
									<option value="open_entry">Open Entry</option>
									<option value="application_required">Application Required</option>
									<option value="invite_only">Invite Only</option>
								</select>
								<select className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.availabilityStatus} onChange={(e) => setForm((f) => ({ ...f, availabilityStatus: e.target.value }))}>
									<option value="open">Open</option>
									<option value="limited">Limited Seats</option>
									<option value="waitlist">Waitlist</option>
								</select>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<input type="datetime-local" className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
								<input type="datetime-local" className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<input type="number" min="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
								<input type="number" min="1" className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Available slots" value={form.maxAttendees} onChange={(e) => setForm((f) => ({ ...f, maxAttendees: e.target.value }))} />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Status: draft/published/cancelled" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EventForm['status'] }))} />
								<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<select className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.organizerType} onChange={(e) => setForm((f) => ({ ...f, organizerType: e.target.value }))}>
									<option value="institution">Institution</option>
									<option value="incubator_accelerator">Incubator / Accelerator</option>
									<option value="corporate">Corporate</option>
									<option value="government">Government</option>
									<option value="independent_mentor">Independent Mentor</option>
									<option value="xentro">Xentro Hosted</option>
								</select>
								<input type="number" min="0" max="5" step="0.1" className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Average rating (0-5)" value={form.averageRating} onChange={(e) => setForm((f) => ({ ...f, averageRating: e.target.value }))} />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<input type="number" min="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Cancellation cutoff hours" value={form.cancellationCutoffHours} onChange={(e) => setForm((f) => ({ ...f, cancellationCutoffHours: e.target.value }))} />
								<input className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder='Recurrence JSON e.g. {"frequency":"weekly"}' value={form.recurrenceRuleJson} onChange={(e) => setForm((f) => ({ ...f, recurrenceRuleJson: e.target.value }))} />
							</div>
							<textarea className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px]" placeholder="Gallery JSON array" value={form.galleryJson} onChange={(e) => setForm((f) => ({ ...f, galleryJson: e.target.value }))} />
							<textarea className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px]" placeholder="Speaker lineup JSON array" value={form.speakerLineupJson} onChange={(e) => setForm((f) => ({ ...f, speakerLineupJson: e.target.value }))} />
							<textarea className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px]" placeholder="Agenda timeline JSON array" value={form.agendaTimelineJson} onChange={(e) => setForm((f) => ({ ...f, agendaTimelineJson: e.target.value }))} />
							<textarea className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px]" placeholder="Ticket types JSON array" value={form.ticketTypesJson} onChange={(e) => setForm((f) => ({ ...f, ticketTypesJson: e.target.value }))} />
							<label className="text-sm text-gray-700 flex items-center gap-2">
								<input type="checkbox" checked={form.isVirtual} onChange={(e) => setForm((f) => ({ ...f, isVirtual: e.target.checked }))} />
								Online event
							</label>
						</div>
						<div className="flex items-center justify-end gap-3 pt-2">
							<Button variant="ghost" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
							<Button onClick={saveEvent} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Event'}</Button>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
}

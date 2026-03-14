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
	startTime: string | null;
	endTime: string | null;
	isVirtual: boolean;
	maxAttendees: number | null;
	attendeeCount: number;
	organizerName: string | null;
	approved: boolean;
};

type EventForm = {
	name: string;
	description: string;
	location: string;
	type: string;
	startTime: string;
	endTime: string;
	price: string;
	isVirtual: boolean;
	maxAttendees: string;
};

const EMPTY_FORM: EventForm = {
	name: '',
	description: '',
	location: '',
	type: '',
	startTime: '',
	endTime: '',
	price: '',
	isVirtual: false,
	maxAttendees: '',
};

function toForm(event: EventItem): EventForm {
	return {
		name: event.name,
		description: event.description || '',
		location: event.location || '',
		type: event.type || '',
		startTime: event.startTime ? event.startTime.slice(0, 16) : '',
		endTime: event.endTime ? event.endTime.slice(0, 16) : '',
		price: '',
		isVirtual: event.isVirtual,
		maxAttendees: event.maxAttendees != null ? String(event.maxAttendees) : '',
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
			const body = {
				name: form.name,
				description: form.description || null,
				location: form.location || null,
				type: form.type || null,
				start_time: form.startTime || null,
				end_time: form.endTime || null,
				price: form.price ? Number(form.price) : null,
				is_virtual: form.isVirtual,
				max_attendees: Number(form.maxAttendees),
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
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<input type="datetime-local" className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
								<input type="datetime-local" className="border border-gray-300 rounded-md px-3 py-2 text-sm" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<input type="number" min="0" className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
								<input type="number" min="1" className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Available slots" value={form.maxAttendees} onChange={(e) => setForm((f) => ({ ...f, maxAttendees: e.target.value }))} />
							</div>
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

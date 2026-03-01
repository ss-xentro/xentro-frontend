'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { cn } from '@/lib/utils';

interface Event {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	type: string | null;
	startTime: string | null;
	endTime: string | null;
	price: number | null;
	isVirtual: boolean;
	maxAttendees: number | null;
	attendeeCount: number;
	approved: boolean;
	createdAt: string;
}

type ModalMode = 'create' | 'edit' | null;

export default function InstitutionEventsPage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modalMode, setModalMode] = useState<ModalMode>(null);
	const [editingEvent, setEditingEvent] = useState<Event | null>(null);
	const [saving, setSaving] = useState(false);

	const [form, setForm] = useState({
		name: '',
		description: '',
		location: '',
		type: '',
		startTime: '',
		endTime: '',
		price: '',
		isVirtual: false,
		maxAttendees: '',
	});

	const fetchEvents = useCallback(async () => {
		const token = getSessionToken();
		if (!token) return;

		setLoading(true);
		try {
			const res = await fetch('/api/events/', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to fetch events');
			const data = await res.json();
			setEvents(data.events || data.data || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load events');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchEvents();
	}, [fetchEvents]);

	const resetForm = () => {
		setForm({
			name: '',
			description: '',
			location: '',
			type: '',
			startTime: '',
			endTime: '',
			price: '',
			isVirtual: false,
			maxAttendees: '',
		});
	};

	const openCreate = () => {
		resetForm();
		setEditingEvent(null);
		setModalMode('create');
	};

	const openEdit = (event: Event) => {
		setEditingEvent(event);
		setForm({
			name: event.name,
			description: event.description || '',
			location: event.location || '',
			type: event.type || '',
			startTime: event.startTime ? event.startTime.slice(0, 16) : '',
			endTime: event.endTime ? event.endTime.slice(0, 16) : '',
			price: event.price != null ? String(event.price) : '',
			isVirtual: event.isVirtual,
			maxAttendees: event.maxAttendees != null ? String(event.maxAttendees) : '',
		});
		setModalMode('edit');
	};

	const handleSave = async () => {
		const token = getSessionToken();
		if (!token || !form.name.trim()) return;

		setSaving(true);
		try {
			const body: Record<string, unknown> = {
				name: form.name,
				description: form.description || null,
				location: form.location || null,
				type: form.type || null,
				start_time: form.startTime || null,
				end_time: form.endTime || null,
				price: form.price ? Number(form.price) : null,
				is_virtual: form.isVirtual,
				max_attendees: form.maxAttendees ? Number(form.maxAttendees) : null,
			};

			const url = modalMode === 'edit' && editingEvent
				? `/api/events/${editingEvent.id}/`
				: '/api/events/';
			const method = modalMode === 'edit' ? 'PATCH' : 'POST';

			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || data.detail || 'Save failed');
			}

			setModalMode(null);
			fetchEvents();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Save failed');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		const token = getSessionToken();
		if (!token) return;
		if (!confirm('Delete this event?')) return;

		try {
			const res = await fetch(`/api/events/${id}/`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Delete failed');
			setEvents((prev) => prev.filter((e) => e.id !== id));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Delete failed');
		}
	};

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-(--primary)">Events</h1>
					<p className="text-sm text-(--secondary)">
						Create and manage events for your institution community.
					</p>
				</div>
				<Button onClick={openCreate}>+ New Event</Button>
			</div>

			{error && (
				<div className="rounded-lg px-4 py-3 text-sm border border-red-200 bg-red-50 text-red-700">
					{error}
					<button onClick={() => setError(null)} className="ml-2 underline">
						Dismiss
					</button>
				</div>
			)}

			{loading ? (
				<div className="grid gap-4 md:grid-cols-2">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-40 rounded-xl bg-(--surface-hover) animate-pulse" />
					))}
				</div>
			) : events.length === 0 ? (
				<Card className="p-12 text-center">
					<p className="text-lg font-medium text-(--primary)">No events yet</p>
					<p className="text-sm text-(--secondary) mt-1">
						Create your first event to engage your community.
					</p>
					<Button className="mt-4" onClick={openCreate}>
						Create Event
					</Button>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{events.map((event) => (
						<Card
							key={event.id}
							className="p-5 space-y-3 hover:shadow-md transition-shadow"
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-(--primary) truncate">
										{event.name}
									</h3>
									{event.type && (
										<span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent">
											{event.type}
										</span>
									)}
								</div>
								<div className="flex items-center gap-1.5">
									<span
										className={cn(
											'px-2 py-0.5 text-xs rounded-full font-medium',
											event.approved
												? 'bg-green-100 text-green-700'
												: 'bg-yellow-100 text-yellow-700'
										)}
									>
										{event.approved ? 'Approved' : 'Pending'}
									</span>
								</div>
							</div>

							{event.description && (
								<p className="text-sm text-(--secondary) line-clamp-2">
									{event.description}
								</p>
							)}

							<div className="grid grid-cols-2 gap-2 text-xs text-(--secondary)">
								<div>
									<span className="font-medium">Start:</span>{' '}
									{formatDate(event.startTime)}
								</div>
								<div>
									<span className="font-medium">End:</span>{' '}
									{formatDate(event.endTime)}
								</div>
								<div>
									<span className="font-medium">Location:</span>{' '}
									{event.location || (event.isVirtual ? 'Virtual' : '—')}
								</div>
								<div>
									<span className="font-medium">Attendees:</span>{' '}
									{event.attendeeCount}
									{event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
								</div>
							</div>

							<div className="flex items-center gap-2 pt-1 border-t border-(--border)">
								<button
									onClick={() => openEdit(event)}
									className="text-xs text-accent hover:underline"
								>
									Edit
								</button>
								<button
									onClick={() => handleDelete(event.id)}
									className="text-xs text-red-500 hover:underline"
								>
									Delete
								</button>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Create/Edit Modal */}
			{modalMode && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<Card className="w-full max-w-lg p-6 space-y-4 mx-4 max-h-[90vh] overflow-y-auto">
						<h2 className="text-xl font-semibold text-(--primary)">
							{modalMode === 'create' ? 'New Event' : 'Edit Event'}
						</h2>

						<Input
							label="Event name"
							placeholder="Demo Day 2025"
							value={form.name}
							onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
							required
							autoFocus
						/>
						<Textarea
							label="Description"
							placeholder="What is this event about?"
							rows={3}
							value={form.description}
							onChange={(e) =>
								setForm((f) => ({ ...f, description: e.target.value }))
							}
						/>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Input
								label="Type"
								placeholder="Workshop, Demo Day, Meetup…"
								value={form.type}
								onChange={(e) =>
									setForm((f) => ({ ...f, type: e.target.value }))
								}
							/>
							<Input
								label="Location"
								placeholder="Venue or URL"
								value={form.location}
								onChange={(e) =>
									setForm((f) => ({ ...f, location: e.target.value }))
								}
							/>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Input
								label="Start time"
								type="datetime-local"
								value={form.startTime}
								onChange={(e) =>
									setForm((f) => ({ ...f, startTime: e.target.value }))
								}
							/>
							<Input
								label="End time"
								type="datetime-local"
								value={form.endTime}
								onChange={(e) =>
									setForm((f) => ({ ...f, endTime: e.target.value }))
								}
							/>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Input
								label="Price (USD)"
								type="number"
								placeholder="0 for free"
								value={form.price}
								onChange={(e) =>
									setForm((f) => ({ ...f, price: e.target.value }))
								}
							/>
							<Input
								label="Max attendees"
								type="number"
								placeholder="Unlimited"
								value={form.maxAttendees}
								onChange={(e) =>
									setForm((f) => ({ ...f, maxAttendees: e.target.value }))
								}
							/>
						</div>
						<label className="flex items-center gap-2 text-sm text-(--primary) cursor-pointer">
							<input
								type="checkbox"
								checked={form.isVirtual}
								onChange={(e) =>
									setForm((f) => ({ ...f, isVirtual: e.target.checked }))
								}
								className="rounded border-(--border)"
							/>
							Virtual event
						</label>

						<div className="flex items-center justify-end gap-3 pt-2">
							<Button
								variant="ghost"
								onClick={() => setModalMode(null)}
								disabled={saving}
							>
								Cancel
							</Button>
							<Button
								onClick={handleSave}
								disabled={saving || !form.name.trim()}
							>
								{saving
									? 'Saving…'
									: modalMode === 'create'
										? 'Create Event'
										: 'Save Changes'}
							</Button>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
}

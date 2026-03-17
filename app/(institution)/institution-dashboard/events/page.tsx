'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, FeedbackBanner, EmptyState } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';
import { EventItem, ModalMode, EventFormData, EMPTY_FORM, eventToForm } from './_lib/constants';
import EventCard from './_components/EventCard';
import EventFormModal from './_components/EventFormModal';

export default function InstitutionEventsPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<EventFormData>(EMPTY_FORM);

    const fetchEvents = useCallback(async () => {
        const token = getSessionToken();
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch('/api/events/', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to fetch events');
            const data = await res.json();
            setEvents(data.events || data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load events');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const openCreate = () => { setForm(EMPTY_FORM); setEditingEvent(null); setModalMode('create'); };

    const openEdit = (event: EventItem) => {
        setEditingEvent(event);
        setForm(eventToForm(event));
        setModalMode('edit');
    };

    const handleSave = async () => {
        const token = getSessionToken();
        if (!token || !form.name.trim()) return;
        if (modalMode === 'create' && (!form.maxAttendees || Number(form.maxAttendees) <= 0)) {
            setError('Available slots are required when creating an event.');
            return;
        }
        setSaving(true);
        try {
            const parseLines = (value: string) =>
                value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean);

            const speakerLineup = parseLines(form.speakerLineupJson).map((name) => ({ name }));
            const agendaTimeline = parseLines(form.agendaTimelineJson).map((activity) => ({ activity }));
            const ticketTypes = parseLines(form.ticketTypesJson).map((name) => ({ name }));

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
                status: form.status,
                cover_image: form.coverImage || null,
                cancellation_cutoff_hours: form.cancellationCutoffHours ? Number(form.cancellationCutoffHours) : 2,
                speaker_lineup: speakerLineup,
                agenda_timeline: agendaTimeline,
                ticket_types: ticketTypes,
            };
            const url = modalMode === 'edit' && editingEvent ? `/api/events/${editingEvent.id}/` : '/api/events/';
            const method = modalMode === 'edit' ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
            const res = await fetch(`/api/events/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Delete failed');
            setEvents((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed');
        }
    };

    return (
        <DashboardSidebar>
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Events</h1>
                        <p className="text-sm text-gray-400">Create and manage events for your institution community.</p>
                    </div>
                    <Button onClick={openCreate}>+ New Event</Button>
                </div>

                {error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-40 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <EmptyState title="No events yet" description="Create your first event to engage your community." ctaLabel="Create Event" onCtaClick={openCreate} />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} onEdit={openEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                )}

                <EventFormModal
                    mode={modalMode}
                    form={form}
                    saving={saving}
                    onFormChange={setForm}
                    onSave={handleSave}
                    onClose={() => setModalMode(null)}
                />
            </div>
        </DashboardSidebar>
    );
}

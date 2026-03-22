'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, FeedbackBanner, EmptyState } from '@/components/ui';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { getSessionToken } from '@/lib/auth-utils';
import { EventItem } from './_lib/constants';
import EventCard from './_components/EventCard';

function normalizeEventListResponse(payload: unknown): EventItem[] {
    if (Array.isArray(payload)) return payload as EventItem[];
    if (!payload || typeof payload !== 'object') return [];

    const record = payload as Record<string, unknown>;
    const candidates = [record.events, record.data, record.results];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            return candidate as EventItem[];
        }
    }

    return [];
}

export default function InstitutionEventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        const token = getSessionToken();
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch('/api/events/', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to fetch events');
            const data = await res.json();
            setEvents(normalizeEventListResponse(data));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load events');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const goToCreatePage = () => {
        router.push('/institution-dashboard/add-event');
    };

    const openEdit = (event: EventItem) => {
        router.push(`/institution-dashboard/events/${event.id}/edit`);
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
                    <Button onClick={goToCreatePage}>+ New Event</Button>
                </div>

                {error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-40 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <EmptyState title="No events yet" description="Create your first event to engage your community." ctaLabel="Create Event" onCtaClick={goToCreatePage} />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} onEdit={openEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                )}

            </div>
        </DashboardSidebar>
    );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSessionToken } from '@/lib/auth-utils';
import { ConnectionRequest, Booking, ConnectionFilter } from './_lib/constants';
import ConnectionsList from './_components/ConnectionsList';
import BookingsList from './_components/BookingsList';

export default function MyMentorsPage() {
    const [connections, setConnections] = useState<ConnectionRequest[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'connections' | 'bookings'>('connections');
    const [filter, setFilter] = useState<ConnectionFilter>('all');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        const token = getSessionToken();
        if (!token) return;
        try {
            setLoading(true);
            const [connRes, bookRes] = await Promise.all([
                fetch('/api/mentor-connections/', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/mentor-bookings/', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (connRes.ok) { const json = await connRes.json(); setConnections(json.data ?? []); }
            if (bookRes.ok) { const json = await bookRes.json(); setBookings(json.data ?? []); }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function cancelBooking(bookingId: string) {
        const token = getSessionToken();
        if (!token) return;
        setCancellingId(bookingId);
        try {
            const res = await fetch('/api/mentor-bookings/', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bookingId, status: 'cancelled' }),
            });
            if (res.ok) setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)));
        } catch (err) {
            console.error(err);
        } finally {
            setCancellingId(null);
        }
    }

    const pendingCount = connections.filter((c) => c.status === 'pending').length;
    const acceptedCount = connections.filter((c) => c.status === 'accepted').length;
    const upcomingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--primary)">My Mentors</h1>
                    <p className="text-sm text-(--secondary) mt-1">
                        {acceptedCount > 0 ? `${acceptedCount} connected mentor${acceptedCount > 1 ? 's' : ''}` : 'Manage your mentor connections and session bookings'}
                    </p>
                </div>
                <Link href="/explore/mentors" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Mentors
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-(--surface) border border-(--border) rounded-xl p-1">
                {(['connections', 'bookings'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-(--background) text-(--primary) shadow-sm' : 'text-(--secondary) hover:text-(--primary)'}`}
                    >
                        {t === 'connections' ? 'Connections' : 'Bookings'}
                        {t === 'connections' && pendingCount > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-amber-500 text-white rounded-full">{pendingCount}</span>
                        )}
                        {t === 'bookings' && upcomingBookings.length > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-accent text-white rounded-full">{upcomingBookings.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-(--surface) border border-(--border) rounded-xl animate-pulse" />
                    ))}
                </div>
            )}

            {!loading && tab === 'connections' && (
                <ConnectionsList connections={connections} filter={filter} onFilterChange={setFilter} />
            )}

            {!loading && tab === 'bookings' && (
                <BookingsList bookings={bookings} cancellingId={cancellingId} onCancel={cancelBooking} />
            )}
        </div>
    );
}

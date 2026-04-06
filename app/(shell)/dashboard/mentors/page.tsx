'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApiQuery, useApiMutation } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';
import { ConnectionRequest, Booking, ConnectionFilter } from './_lib/constants';
import ConnectionsList from './_components/ConnectionsList';
import BookingsList from './_components/BookingsList';

export default function MyMentorsPage() {
    const [tab, setTab] = useState<'connections' | 'bookings'>('connections');
    const [filter, setFilter] = useState<ConnectionFilter>('all');

    const { data: connRaw, isLoading: connLoading } = useApiQuery<{ data: ConnectionRequest[] }>(
        queryKeys.connections.list(),
        '/api/mentor-connections/',
    );
    const { data: bookRaw, isLoading: bookLoading } = useApiQuery<{ data: Booking[] }>(
        queryKeys.bookings.list(),
        '/api/mentor-bookings/',
    );

    const connections = connRaw?.data ?? [];
    const bookings = bookRaw?.data ?? [];
    const loading = connLoading || bookLoading;

    const cancelMutation = useApiMutation<unknown, { bookingId: string; status: string }>({
        method: 'patch',
        path: '/api/mentor-bookings/',
        invalidateKeys: [queryKeys.bookings.all],
    });

    async function cancelBooking(bookingId: string) {
        cancelMutation.mutate({ bookingId, status: 'cancelled' });
    }

    const cancellingId = cancelMutation.isPending ? (cancelMutation.variables as { bookingId: string } | undefined)?.bookingId ?? null : null;

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
                <Link href="/explore/mentors" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-(--primary) text-(--background) hover:bg-(--primary-light) transition-colors">
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
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-(--surface-hover) text-(--primary) shadow-sm' : 'text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover)'}`}
                    >
                        {t === 'connections' ? 'Connections' : 'Bookings'}
                        {t === 'connections' && pendingCount > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-amber-500 text-white rounded-full">{pendingCount}</span>
                        )}
                        {t === 'bookings' && upcomingBookings.length > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-(--primary) text-(--background) rounded-full">{upcomingBookings.length}</span>
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

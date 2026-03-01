'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSessionToken } from '@/lib/auth-utils';

type Booking = {
    id: string;
    menteeName: string | null;
    menteeEmail: string | null;
    scheduledDate: string;
    slotDay: string | null;
    slotStart: string | null;
    slotEnd: string | null;
    status: string;
};

export default function MenteesPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getSessionToken('mentor');
        if (!token) return;

        fetch('/api/mentor-bookings', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => setBookings(data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Group unique mentees
    const menteeMap = new Map<string, { name: string; email: string; sessions: number; lastSession: string }>();
    for (const b of bookings) {
        const key = b.menteeEmail ?? b.menteeName ?? 'unknown';
        const existing = menteeMap.get(key);
        if (existing) {
            existing.sessions++;
            if (b.scheduledDate > existing.lastSession) existing.lastSession = b.scheduledDate;
        } else {
            menteeMap.set(key, {
                name: b.menteeName ?? 'Unknown',
                email: b.menteeEmail ?? '',
                sessions: 1,
                lastSession: b.scheduledDate,
            });
        }
    }

    const mentees = Array.from(menteeMap.values()).sort((a, b) => b.sessions - a.sessions);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-(--primary)">Mentees</h1>
                <p className="text-sm text-(--secondary) mt-1">People you&apos;ve mentored through booked sessions</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                </div>
            ) : mentees.length === 0 ? (
                <Card className="p-8 text-center bg-(--surface)">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-lg font-semibold text-(--primary)">No mentees yet</h3>
                    <p className="text-sm text-(--secondary) mt-1">When someone books a session with you, they&apos;ll appear here.</p>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {mentees.map((m, i) => (
                        <Card key={i} className="p-4 bg-(--surface) flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                                    {m.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-(--primary)">{m.name}</p>
                                    <p className="text-xs text-(--secondary)">{m.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-(--primary)">{m.sessions} session{m.sessions > 1 ? 's' : ''}</p>
                                <p className="text-xs text-(--secondary)">Last: {new Date(m.lastSession).toLocaleDateString()}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

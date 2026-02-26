'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

type Slot = {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
};

type Booking = {
    id: string;
    menteeName: string | null;
    menteeEmail: string | null;
    scheduledDate: string;
    slotDay: string | null;
    slotStart: string | null;
    slotEnd: string | null;
    status: string;
    notes: string | null;
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
};

export default function SessionsPage() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'upcoming' | 'slots'>('upcoming');
    const [savingSlots, setSavingSlots] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState<string | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('mentor_token') : null;

    useEffect(() => {
        if (!token) return;

        Promise.all([
            fetch('/api/mentor-bookings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`/api/mentor-slots?mentorId=${getMentorId()}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]).then(([bookingsRes, slotsRes]) => {
            setBookings(bookingsRes.data || []);
            const slotsData = slotsRes.data || [];
            setSlots(slotsData);
            // Pre-select existing slots
            const existing = new Set<string>();
            for (const s of slotsData) {
                existing.add(`${s.dayOfWeek}-${s.startTime}`);
            }
            setSelectedSlots(existing);
        }).catch(console.error).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getMentorId(): string {
        try {
            if (!token) return '';
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || '';
        } catch { return ''; }
    }

    function toggleSlot(day: string, time: string) {
        const key = `${day}-${time}`;
        setSelectedSlots(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    async function saveSlots() {
        if (!token) return;
        setSavingSlots(true);
        setMessage(null);

        const newSlots = Array.from(selectedSlots).map(key => {
            const [day, startTime] = key.split('-');
            const startHour = parseInt(startTime.split(':')[0]);
            const endTime = `${String(startHour + 1).padStart(2, '0')}:00`;
            return { dayOfWeek: day, startTime, endTime };
        });

        try {
            // Delete existing slots first, then create new ones
            for (const slot of slots) {
                await fetch('/api/mentor-slots', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ slotId: slot.id }),
                });
            }

            if (newSlots.length > 0) {
                const res = await fetch('/api/mentor-slots', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ slots: newSlots }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setSlots(data.data || []);
            } else {
                setSlots([]);
            }

            setMessage('Availability saved!');
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSavingSlots(false);
        }
    }

    async function updateBooking(bookingId: string, status: string) {
        if (!token) return;
        try {
            const res = await fetch('/api/mentor-bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bookingId, status }),
            });
            if (res.ok) {
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
            }
        } catch (err) {
            console.error(err);
        }
    }

    const upcoming = bookings
        .filter(b => b.status !== 'cancelled')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-(--primary)">Sessions</h1>
                <p className="text-sm text-(--secondary) mt-1">Manage your sessions and availability</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 bg-(--surface-hover) p-1 rounded-xl w-fit">
                <button
                    onClick={() => setTab('upcoming')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'upcoming' ? 'bg-white shadow-sm text-(--primary)' : 'text-(--secondary) hover:text-(--primary)'}`}
                >
                    Upcoming ({upcoming.length})
                </button>
                <button
                    onClick={() => setTab('slots')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'slots' ? 'bg-white shadow-sm text-(--primary)' : 'text-(--secondary) hover:text-(--primary)'}`}
                >
                    Availability
                </button>
            </div>

            {tab === 'upcoming' ? (
                <div className="space-y-3">
                    {upcoming.length === 0 ? (
                        <Card className="p-8 text-center bg-(--surface)">
                            <div className="text-4xl mb-3">📅</div>
                            <h3 className="text-lg font-semibold text-(--primary)">No upcoming sessions</h3>
                            <p className="text-sm text-(--secondary) mt-1">Set your availability in the Availability tab to start getting bookings.</p>
                        </Card>
                    ) : (
                        upcoming.map(b => (
                            <Card key={b.id} className="p-4 bg-(--surface)">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <p className="font-medium text-(--primary)">
                                            {b.menteeName || 'Unknown mentee'}
                                        </p>
                                        <p className="text-xs text-(--secondary)">{b.menteeEmail}</p>
                                        <div className="flex items-center gap-3 text-sm text-(--secondary)">
                                            <span>📅 {new Date(b.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            {b.slotStart && <span>🕐 {b.slotStart} — {b.slotEnd}</span>}
                                        </div>
                                        {b.notes && <p className="text-xs text-(--secondary) italic mt-1">&ldquo;{b.notes}&rdquo;</p>}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {b.status}
                                        </span>
                                        {b.status === 'pending' && (
                                            <>
                                                <Button onClick={() => updateBooking(b.id, 'confirmed')} className="text-xs px-3 py-1">
                                                    Confirm
                                                </Button>
                                                <Button variant="ghost" onClick={() => updateBooking(b.id, 'cancelled')} className="text-xs px-3 py-1 text-red-600">
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {b.status === 'confirmed' && (
                                            <Button onClick={() => updateBooking(b.id, 'completed')} className="text-xs px-3 py-1">
                                                Complete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-(--secondary)">Click to toggle time slots. Selected slots are shown in accent color.</p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="w-20 p-2 text-left text-xs text-(--secondary) font-medium">Time</th>
                                    {DAYS.map(d => (
                                        <th key={d} className="p-2 text-center text-xs text-(--secondary) font-medium capitalize">{d.slice(0, 3)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {TIME_SLOTS.map(time => (
                                    <tr key={time}>
                                        <td className="p-2 text-xs text-(--secondary) font-mono">{time}</td>
                                        {DAYS.map(day => {
                                            const key = `${day}-${time}`;
                                            const selected = selectedSlots.has(key);
                                            return (
                                                <td key={day} className="p-1">
                                                    <button
                                                        onClick={() => toggleSlot(day, time)}
                                                        className={`w-full h-9 rounded-lg border transition-all duration-150 text-xs font-medium ${selected
                                                            ? 'bg-accent/15 border-accent text-accent hover:bg-accent/25'
                                                            : 'bg-(--surface) border-(--border) text-(--secondary) hover:bg-(--surface-hover) hover:border-(--secondary)'
                                                            }`}
                                                    >
                                                        {selected ? '✓' : ''}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-(--secondary)">{selectedSlots.size} slot{selectedSlots.size !== 1 ? 's' : ''} selected</p>
                        <Button onClick={saveSlots} disabled={savingSlots}>
                            {savingSlots ? 'Saving…' : 'Save Availability'}
                        </Button>
                    </div>
                    {message && <p className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                </div>
            )}
        </div>
    );
}

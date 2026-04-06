'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSessionToken } from '@/lib/auth-utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { toast } from 'sonner';

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
    pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    confirmed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
    completed: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
};

export default function SessionsPage() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'upcoming' | 'slots'>('upcoming');
    const [savingSlots, setSavingSlots] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

    const token = typeof window !== 'undefined' ? getSessionToken('mentor') : null;

    useEffect(() => {
        if (!token) return;

        // Use allSettled so a slots fetch failure does not discard bookings data
        Promise.allSettled([
            fetch('/api/mentor-bookings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch('/api/mentor-slots', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]).then(([bookingsResult, slotsResult]) => {
            if (bookingsResult.status === 'fulfilled') {
                setBookings(bookingsResult.value.data || []);
            } else {
                console.error('Bookings fetch failed:', bookingsResult.reason);
            }
            if (slotsResult.status === 'fulfilled') {
                const slotsData = slotsResult.value.data || [];
                setSlots(slotsData);
                // Pre-select existing slots
                const existing = new Set<string>();
                for (const s of slotsData) {
                    existing.add(`${s.dayOfWeek}-${s.startTime}`);
                }
                setSelectedSlots(existing);
            } else {
                console.error('Slots fetch failed:', slotsResult.reason);
            }
        }).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function checkForOverlaps(slotList: Array<{ dayOfWeek: string; startTime: string; endTime: string }>): string | null {
        const byDay: Record<string, Array<{ start: number; end: number; label: string }>> = {};
        for (const s of slotList) {
            const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
            const start = toMins(s.startTime);
            const end = toMins(s.endTime);
            if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = [];
            byDay[s.dayOfWeek].push({ start, end, label: `${s.startTime}–${s.endTime}` });
        }
        for (const [day, daySlots] of Object.entries(byDay)) {
            for (let i = 0; i < daySlots.length; i++) {
                for (let j = i + 1; j < daySlots.length; j++) {
                    const a = daySlots[i];
                    const b = daySlots[j];
                    if (a.start < b.end && b.start < a.end) {
                        return `Overlap on ${day}: ${a.label} conflicts with ${b.label}`;
                    }
                }
            }
        }
        return null;
    }

    function toggleSlot(day: string, time: string) {
        const key = `${day}-${time}`;
        // Removing is always allowed
        if (selectedSlots.has(key)) {
            setSelectedSlots(prev => { const next = new Set(prev); next.delete(key); return next; });
            return;
        }
        // Check whether adding this slot would overlap with any already-selected slot on the same day
        const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
        const newStart = toMins(time);
        const newEnd = newStart + 60;
        for (const selKey of selectedSlots) {
            const dashIdx = selKey.indexOf('-');
            const selDay = selKey.slice(0, dashIdx);
            const selTime = selKey.slice(dashIdx + 1);
            if (selDay !== day) continue;
            // Use real end_time from DB slot if available, otherwise assume 1-hour grid slot
            const dbSlot = slots.find(s => s.dayOfWeek === selDay && s.startTime === selTime);
            const selStart = toMins(selTime);
            const selEnd = dbSlot ? toMins(dbSlot.endTime) : selStart + 60;
            if (newStart < selEnd && selStart < newEnd) {
                const endLabel = `${String(Math.floor(newEnd / 60)).padStart(2, '0')}:00`;
                const selEndLabel = dbSlot ? dbSlot.endTime : `${String(Math.floor(selEnd / 60)).padStart(2, '0')}:00`;
                toast.warning(`Cannot add ${time}–${endLabel} on ${day}: overlaps with existing slot ${selTime}–${selEndLabel}`);
                return;
            }
        }
        setSelectedSlots(prev => { const next = new Set(prev); next.add(key); return next; });
    }

    async function saveSlots() {
        if (!token) return;
        setSavingSlots(true);

        const newSlots = Array.from(selectedSlots).map(key => {
            const [day, startTime] = key.split('-');
            const startHour = parseInt(startTime.split(':')[0]);
            const endTime = `${String(startHour + 1).padStart(2, '0')}:00`;
            return { dayOfWeek: day, startTime, endTime };
        });

        const overlapError = checkForOverlaps(newSlots);
        if (overlapError) {
            toast.error(overlapError);
            setSavingSlots(false);
            return;
        }

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

            toast.success('Availability saved!');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
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
                const label = status === 'confirmed' ? 'Session confirmed!' : status === 'cancelled' ? 'Session cancelled' : status === 'completed' ? 'Session marked complete' : 'Booking updated';
                toast.success(label);
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || 'Failed to update booking');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update booking');
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
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'upcoming' ? 'bg-(--surface) shadow-sm text-(--primary)' : 'text-(--secondary) hover:text-(--primary)'}`}
                >
                    Upcoming ({upcoming.length})
                </button>
                <button
                    onClick={() => setTab('slots')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'slots' ? 'bg-(--surface) shadow-sm text-(--primary)' : 'text-(--secondary) hover:text-(--primary)'}`}
                >
                    Availability
                </button>
            </div>

            {tab === 'upcoming' ? (
                <div className="space-y-3">
                    {upcoming.length === 0 ? (
                        <Card className="p-8 text-center bg-(--surface)">
                            <AppIcon name="calendar" className="w-10 h-10 text-(--secondary) mx-auto mb-3" />
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
                                            <span className="flex items-center gap-1"><AppIcon name="calendar" className="w-3.5 h-3.5" /> {new Date(b.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            {b.slotStart && <span className="flex items-center gap-1"><AppIcon name="clock" className="w-3.5 h-3.5" /> {b.slotStart} — {b.slotEnd}</span>}
                                        </div>
                                        {b.notes && <p className="text-xs text-(--secondary) italic mt-1">&ldquo;{b.notes}&rdquo;</p>}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[b.status] || 'bg-(--surface-hover) text-(--secondary) border border-(--border)'}`}>
                                            {b.status}
                                        </span>
                                        {b.status === 'pending' && (
                                            <>
                                                <Button onClick={() => updateBooking(b.id, 'confirmed')} className="text-xs px-3 py-1">
                                                    Confirm
                                                </Button>
                                                <Button variant="ghost" onClick={() => updateBooking(b.id, 'cancelled')} className="text-xs px-3 py-1 text-error">
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
                        <table className="w-full min-w-[640px] border-collapse text-sm">
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
                                                        {selected ? <AppIcon name="check" className="w-4 h-4 mx-auto" /> : ''}
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
                </div>
            )}
        </div>
    );
}

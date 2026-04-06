'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSessionToken } from '@/lib/auth-utils';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_SHORT: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
    thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

function formatTime12(t: string): string {
    const [hStr, mStr] = t.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
}

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

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
    pending: { bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-400', icon: 'clock' },
    confirmed: { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', icon: 'check-circle-2' },
    cancelled: { bg: 'bg-red-500/10 border border-red-500/20', text: 'text-red-400', icon: 'x-circle' },
    completed: { bg: 'bg-blue-500/10 border border-blue-500/20', text: 'text-blue-400', icon: 'award' },
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
        if (selectedSlots.has(key)) {
            setSelectedSlots(prev => { const next = new Set(prev); next.delete(key); return next; });
            return;
        }
        const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
        const newStart = toMins(time);
        const newEnd = newStart + 60;
        for (const selKey of selectedSlots) {
            const dashIdx = selKey.indexOf('-');
            const selDay = selKey.slice(0, dashIdx);
            const selTime = selKey.slice(dashIdx + 1);
            if (selDay !== day) continue;
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

    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-60">
                <AppIcon name="loader-2" className="w-6 h-6 animate-spin text-(--secondary)" />
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
                    className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
                        tab === 'upcoming' ? 'bg-(--surface) shadow-sm text-(--primary)' : 'text-(--secondary) hover:text-(--primary)',
                    )}
                >
                    Upcoming
                    {pendingCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-5 h-5 text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5">
                            {pendingCount}
                        </span>
                    )}
                    {upcoming.length > 0 && pendingCount === 0 && (
                        <span className="text-xs text-(--secondary)">({upcoming.length})</span>
                    )}
                </button>
                <button
                    onClick={() => setTab('slots')}
                    className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
                        tab === 'slots' ? 'bg-(--surface) shadow-sm text-(--primary)' : 'text-(--secondary) hover:text-(--primary)',
                    )}
                >
                    Availability
                    <span className="text-xs text-(--secondary)">({selectedSlots.size})</span>
                </button>
            </div>

            {tab === 'upcoming' ? (
                <div className="space-y-3">
                    {upcoming.length === 0 ? (
                        <Card className="p-8 text-center bg-(--surface)">
                            <div className="w-14 h-14 rounded-full bg-(--accent-subtle) flex items-center justify-center mx-auto mb-3">
                                <AppIcon name="calendar" className="w-7 h-7 text-(--secondary) opacity-40" />
                            </div>
                            <h3 className="text-base font-semibold text-(--primary)">No upcoming sessions</h3>
                            <p className="text-sm text-(--secondary) mt-1 max-w-sm mx-auto">
                                Set your availability in the Availability tab to start getting bookings from mentees.
                            </p>
                        </Card>
                    ) : (
                        upcoming.map(b => {
                            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                            const sched = new Date(b.scheduledDate);
                            const isPast = sched < new Date();

                            return (
                                <Card key={b.id} className={cn('p-0 bg-(--surface) overflow-hidden', isPast && b.status === 'confirmed' && 'ring-1 ring-amber-500/20')}>
                                    <div className="flex">
                                        {/* Date sidebar */}
                                        <div className="w-20 shrink-0 flex flex-col items-center justify-center py-4 bg-(--accent-subtle) border-r border-(--border)">
                                            <span className="text-xs font-medium text-(--secondary) uppercase">
                                                {sched.toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-2xl font-bold text-(--primary) leading-tight">
                                                {sched.getDate()}
                                            </span>
                                            <span className="text-[10px] text-(--secondary-light)">
                                                {sched.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-4 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 space-y-1">
                                                    <p className="font-semibold text-(--primary) truncate">
                                                        {b.menteeName || 'Unknown mentee'}
                                                    </p>
                                                    {b.menteeEmail && (
                                                        <p className="text-xs text-(--secondary) truncate">{b.menteeEmail}</p>
                                                    )}
                                                    {b.slotStart && (
                                                        <p className="text-xs text-(--secondary) flex items-center gap-1.5">
                                                            <AppIcon name="clock" className="w-3 h-3" />
                                                            {formatTime12(b.slotStart)} – {formatTime12(b.slotEnd || '')}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className={cn(
                                                    'shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full capitalize',
                                                    cfg.bg, cfg.text,
                                                )}>
                                                    <AppIcon name={cfg.icon} className="w-3 h-3" />
                                                    {b.status}
                                                </span>
                                            </div>

                                            {b.notes && (
                                                <p className="text-xs text-(--secondary) mt-2 py-2 px-3 rounded-lg bg-(--accent-subtle) border border-(--border) italic line-clamp-2">
                                                    &ldquo;{b.notes}&rdquo;
                                                </p>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-3">
                                                {b.status === 'pending' && (
                                                    <>
                                                        <Button onClick={() => updateBooking(b.id, 'confirmed')} className="text-xs px-3.5 py-1.5 gap-1.5">
                                                            <AppIcon name="check" className="w-3.5 h-3.5" />
                                                            Confirm
                                                        </Button>
                                                        <Button variant="ghost" onClick={() => updateBooking(b.id, 'cancelled')} className="text-xs px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                            Decline
                                                        </Button>
                                                    </>
                                                )}
                                                {b.status === 'confirmed' && (
                                                    <Button onClick={() => updateBooking(b.id, 'completed')} className="text-xs px-3.5 py-1.5 gap-1.5">
                                                        <AppIcon name="check-check" className="w-3.5 h-3.5" />
                                                        Mark Complete
                                                    </Button>
                                                )}
                                                {isPast && b.status === 'confirmed' && (
                                                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                        Past due
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="space-y-5">
                    <p className="text-sm text-(--secondary)">
                        Click cells to toggle available time slots. Mentees will see these when booking.
                    </p>

                    {/* Desktop: Table Grid */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="w-20 p-2 text-left text-xs text-(--secondary) font-medium">Time</th>
                                    {DAYS.map(d => (
                                        <th key={d} className="p-2 text-center text-xs text-(--secondary) font-medium">{DAY_SHORT[d]}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {TIME_SLOTS.map(time => (
                                    <tr key={time}>
                                        <td className="p-2 text-xs text-(--secondary) font-mono">{formatTime12(time)}</td>
                                        {DAYS.map(day => {
                                            const key = `${day}-${time}`;
                                            const selected = selectedSlots.has(key);
                                            return (
                                                <td key={day} className="p-1">
                                                    <button
                                                        onClick={() => toggleSlot(day, time)}
                                                        className={cn(
                                                            'w-full h-9 rounded-lg border transition-all duration-150 text-xs font-medium',
                                                            selected
                                                                ? 'bg-accent/15 border-accent text-accent hover:bg-accent/25'
                                                                : 'bg-(--surface) border-(--border) text-(--secondary) hover:bg-(--surface-hover) hover:border-(--secondary)',
                                                        )}
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

                    {/* Mobile: Card Layout */}
                    <div className="md:hidden space-y-3">
                        {DAYS.map(day => {
                            const daySelected = TIME_SLOTS.filter(t => selectedSlots.has(`${day}-${t}`));
                            return (
                                <div key={day} className="bg-(--surface) border border-(--border) rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-(--primary) capitalize">{day}</h3>
                                        {daySelected.length > 0 && (
                                            <span className="text-xs text-accent font-medium">
                                                {daySelected.length} slot{daySelected.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {TIME_SLOTS.map(time => {
                                            const key = `${day}-${time}`;
                                            const selected = selectedSlots.has(key);
                                            return (
                                                <button
                                                    key={time}
                                                    onClick={() => toggleSlot(day, time)}
                                                    className={cn(
                                                        'py-2 rounded-lg border text-xs font-medium transition-all',
                                                        selected
                                                            ? 'bg-accent/15 border-accent text-accent'
                                                            : 'bg-(--accent-subtle) border-(--border) text-(--secondary)',
                                                    )}
                                                >
                                                    {formatTime12(time).replace(' ', '\n').split('\n')[0]}
                                                    <span className="text-[9px] ml-0.5">{time.startsWith('1') && parseInt(time) >= 12 ? 'PM' : 'AM'}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <p className="text-sm text-(--secondary)">
                            <span className="font-semibold text-(--primary)">{selectedSlots.size}</span> slot{selectedSlots.size !== 1 ? 's' : ''} selected
                        </p>
                        <Button onClick={saveSlots} disabled={savingSlots} className="gap-2">
                            {savingSlots ? (
                                <>
                                    <AppIcon name="loader-2" className="w-4 h-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <AppIcon name="save" className="w-4 h-4" />
                                    Save Availability
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

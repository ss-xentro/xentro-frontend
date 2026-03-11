'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/components/ui';
import { getSessionToken } from '@/lib/auth-utils';
import { API, DAYS, type Slot, type Booking, formatTime, getWeekDates } from './_lib/constants';
import CalendarGrid from './_components/CalendarGrid';
import UpcomingSessions from './_components/UpcomingSessions';

export default function MentorCalendarPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<'week' | 'availability'>('week');

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newDay, setNewDay] = useState<string>('monday');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [slotSaving, setSlotSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const token = getSessionToken('mentor');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        fetch(`${API}/api/mentor-slots/`, { headers }),
        fetch(`${API}/api/mentor-bookings/`, { headers }),
      ]);
      const slotsJson = await slotsRes.json();
      const bookingsJson = await bookingsRes.json();
      setSlots(slotsJson.data || []);
      setBookings(bookingsJson.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddSlot = async () => {
    const token = getSessionToken('mentor');
    if (!token) return;
    setSlotSaving(true);
    try {
      const res = await fetch(`${API}/api/mentor-slots/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_of_week: newDay, start_time: newStart, end_time: newEnd }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || 'Failed to add slot');
        return;
      }
      setShowAddSlot(false);
      fetchData();
    } catch {
      alert('Failed to add slot');
    } finally {
      setSlotSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const token = getSessionToken('mentor');
    if (!token) return;
    if (!confirm('Delete this availability slot?')) return;
    try {
      await fetch(`${API}/api/mentor-slots/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      });
      fetchData();
    } catch {
      // silent
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    const token = getSessionToken('mentor');
    if (!token) return;
    try {
      await fetch(`${API}/api/mentor-bookings/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: action }),
      });
      fetchData();
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  // Build bookings by day for the current week
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(baseDate);
  const weekStart = weekDates.monday;
  const weekEnd = weekDates.sunday;

  const bookingsByDay: Record<string, Booking[]> = {};
  DAYS.forEach(d => { bookingsByDay[d] = []; });
  bookings.forEach(b => {
    const date = new Date(b.scheduled_date);
    const dayIdx = (date.getDay() + 6) % 7;
    const dayName = DAYS[dayIdx];
    if (date >= weekStart && date <= new Date(weekEnd.getTime() + 86400000)) {
      bookingsByDay[dayName]?.push(b);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--primary)">Calendar</h1>
          <p className="text-(--secondary) text-sm mt-1">Manage your availability and sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-(--surface) border border-(--border) rounded-lg overflow-hidden">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'week' ? 'bg-accent text-white' : 'text-(--secondary) hover:bg-(--surface-hover)'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('availability')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'availability' ? 'bg-accent text-white' : 'text-(--secondary) hover:bg-(--surface-hover)'}`}
            >
              Availability
            </button>
          </div>
          <Button onClick={() => setShowAddSlot(true)}>+ Add Slot</Button>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddSlot && (
        <Card className="p-5 space-y-4 border-accent/30">
          <h3 className="font-semibold text-(--primary)">New Availability Slot</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-(--secondary) mb-1">Day</label>
              <select
                value={newDay}
                onChange={e => setNewDay(e.target.value)}
                className="w-full px-3 py-2 border border-(--border) rounded-lg bg-(--surface) text-sm text-(--primary)"
              >
                {DAYS.map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-(--secondary) mb-1">Start Time</label>
              <input
                type="time"
                value={newStart}
                onChange={e => setNewStart(e.target.value)}
                className="w-full px-3 py-2 border border-(--border) rounded-lg bg-(--surface) text-sm text-(--primary)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-(--secondary) mb-1">End Time</label>
              <input
                type="time"
                value={newEnd}
                onChange={e => setNewEnd(e.target.value)}
                className="w-full px-3 py-2 border border-(--border) rounded-lg bg-(--surface) text-sm text-(--primary)"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddSlot} disabled={slotSaving}>
              {slotSaving ? 'Saving...' : 'Add Slot'}
            </Button>
            <Button variant="secondary" onClick={() => setShowAddSlot(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Week View */}
      {view === 'week' && (
        <CalendarGrid
          slots={slots}
          bookingsByDay={bookingsByDay}
          weekOffset={weekOffset}
          onWeekChange={(delta) => setWeekOffset(w => w + delta)}
        />
      )}

      {/* Availability View */}
      {view === 'availability' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const daySlots = slots.filter(s => s.day_of_week === day);
            return (
              <Card key={day} className="p-4">
                <h3 className="font-semibold text-(--primary) capitalize mb-3">{day}</h3>
                {daySlots.length === 0 ? (
                  <p className="text-sm text-(--secondary)">No slots</p>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-(--surface-hover) rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-(--primary)">
                          {formatTime(s.start_time)} – {formatTime(s.end_time)}
                        </span>
                        <button
                          onClick={() => handleDeleteSlot(s.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <UpcomingSessions bookings={bookings} onAction={handleBookingAction} />
    </div>
  );
}

import { db } from '@/db/client';
import { mentorSlots, mentorBookings, users } from '@/db/schemas';
import { eq, and } from 'drizzle-orm';

class MentorBookingRepository {
    // ── Slots ──
    async getSlotsByMentor(mentorUserId: string) {
        return db.select().from(mentorSlots).where(eq(mentorSlots.mentorUserId, mentorUserId));
    }

    async getActiveSlotsByMentor(mentorUserId: string) {
        return db.select().from(mentorSlots)
            .where(and(eq(mentorSlots.mentorUserId, mentorUserId), eq(mentorSlots.isActive, true)));
    }

    async createSlot(params: { mentorUserId: string; dayOfWeek: string; startTime: string; endTime: string }) {
        const [slot] = await db.insert(mentorSlots).values(params).returning();
        return slot;
    }

    async createManySlots(slots: { mentorUserId: string; dayOfWeek: string; startTime: string; endTime: string }[]) {
        if (!slots.length) return [];
        return db.insert(mentorSlots).values(slots).returning();
    }

    async deleteSlot(slotId: string, mentorUserId: string) {
        return db.delete(mentorSlots).where(and(eq(mentorSlots.id, slotId), eq(mentorSlots.mentorUserId, mentorUserId)));
    }

    async toggleSlot(slotId: string, mentorUserId: string, isActive: boolean) {
        const [updated] = await db.update(mentorSlots)
            .set({ isActive })
            .where(and(eq(mentorSlots.id, slotId), eq(mentorSlots.mentorUserId, mentorUserId)))
            .returning();
        return updated;
    }

    // ── Bookings ──
    async getBookingsByMentor(mentorUserId: string) {
        return db.select({
            id: mentorBookings.id,
            slotId: mentorBookings.slotId,
            mentorUserId: mentorBookings.mentorUserId,
            menteeUserId: mentorBookings.menteeUserId,
            scheduledDate: mentorBookings.scheduledDate,
            status: mentorBookings.status,
            notes: mentorBookings.notes,
            createdAt: mentorBookings.createdAt,
            menteeName: users.name,
            menteeEmail: users.email,
            slotDay: mentorSlots.dayOfWeek,
            slotStart: mentorSlots.startTime,
            slotEnd: mentorSlots.endTime,
        })
            .from(mentorBookings)
            .leftJoin(users, eq(users.id, mentorBookings.menteeUserId))
            .leftJoin(mentorSlots, eq(mentorSlots.id, mentorBookings.slotId))
            .where(eq(mentorBookings.mentorUserId, mentorUserId));
    }

    async getBookingsByMentee(menteeUserId: string) {
        return db.select({
            id: mentorBookings.id,
            slotId: mentorBookings.slotId,
            mentorUserId: mentorBookings.mentorUserId,
            menteeUserId: mentorBookings.menteeUserId,
            scheduledDate: mentorBookings.scheduledDate,
            status: mentorBookings.status,
            notes: mentorBookings.notes,
            createdAt: mentorBookings.createdAt,
            mentorName: users.name,
            mentorEmail: users.email,
            slotDay: mentorSlots.dayOfWeek,
            slotStart: mentorSlots.startTime,
            slotEnd: mentorSlots.endTime,
        })
            .from(mentorBookings)
            .leftJoin(users, eq(users.id, mentorBookings.mentorUserId))
            .leftJoin(mentorSlots, eq(mentorSlots.id, mentorBookings.slotId))
            .where(eq(mentorBookings.menteeUserId, menteeUserId));
    }

    async createBooking(params: { slotId: string; mentorUserId: string; menteeUserId: string; scheduledDate: Date; notes?: string }) {
        const [booking] = await db.insert(mentorBookings).values({
            slotId: params.slotId,
            mentorUserId: params.mentorUserId,
            menteeUserId: params.menteeUserId,
            scheduledDate: params.scheduledDate,
            notes: params.notes ?? null,
            status: 'pending',
        }).returning();
        return booking;
    }

    async updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
        const [updated] = await db.update(mentorBookings)
            .set({ status })
            .where(eq(mentorBookings.id, bookingId))
            .returning();
        return updated;
    }
}

export const mentorBookingRepository = new MentorBookingRepository();

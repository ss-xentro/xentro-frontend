import { NextRequest, NextResponse } from 'next/server';
import { mentorBookingRepository } from '@/server/repositories/mentor-booking.repository';
import { verifyJwt } from '@/server/services/auth';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const payload = await verifyJwt(authHeader.slice(7));
        const userId = payload.sub as string;
        const role = payload.role as string;

        const bookings = role === 'mentor'
            ? await mentorBookingRepository.getBookingsByMentor(userId)
            : await mentorBookingRepository.getBookingsByMentee(userId);

        return NextResponse.json({ data: bookings });
    } catch (error) {
        console.error('Failed to get bookings', error);
        return NextResponse.json({ message: 'Failed to get bookings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const payload = await verifyJwt(authHeader.slice(7));
        const menteeUserId = payload.sub as string;

        const body = await request.json();
        const { slotId, mentorUserId, scheduledDate, notes } = body;

        if (!slotId || !mentorUserId || !scheduledDate) {
            return NextResponse.json({ message: 'slotId, mentorUserId, and scheduledDate are required' }, { status: 400 });
        }

        const booking = await mentorBookingRepository.createBooking({
            slotId,
            mentorUserId,
            menteeUserId,
            scheduledDate: new Date(scheduledDate),
            notes,
        });

        return NextResponse.json({ data: booking }, { status: 201 });
    } catch (error) {
        console.error('Failed to create booking', error);
        return NextResponse.json({ message: 'Failed to create booking' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        await verifyJwt(authHeader.slice(7));

        const body = await request.json();
        const { bookingId, status } = body;

        if (!bookingId || !status) {
            return NextResponse.json({ message: 'bookingId and status are required' }, { status: 400 });
        }

        const updated = await mentorBookingRepository.updateBookingStatus(bookingId, status);
        return NextResponse.json({ data: updated });
    } catch (error) {
        console.error('Failed to update booking', error);
        return NextResponse.json({ message: 'Failed to update booking' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { mentorBookingRepository } from '@/server/repositories/mentor-booking.repository';
import { verifyJwt } from '@/server/services/auth';

export async function GET(request: NextRequest) {
    try {
        const mentorId = request.nextUrl.searchParams.get('mentorId');
        if (!mentorId) {
            return NextResponse.json({ message: 'mentorId query param required' }, { status: 400 });
        }
        const slots = await mentorBookingRepository.getActiveSlotsByMentor(mentorId);
        return NextResponse.json({ data: slots });
    } catch (error) {
        console.error('Failed to get slots', error);
        return NextResponse.json({ message: 'Failed to get slots' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const payload = await verifyJwt(authHeader.slice(7));
        const mentorUserId = payload.sub as string;

        const body = await request.json();
        const { slots } = body; // array of { dayOfWeek, startTime, endTime }

        if (!Array.isArray(slots) || !slots.length) {
            return NextResponse.json({ message: 'slots array is required' }, { status: 400 });
        }

        const created = await mentorBookingRepository.createManySlots(
            slots.map((s: { dayOfWeek: string; startTime: string; endTime: string }) => ({
                mentorUserId,
                dayOfWeek: s.dayOfWeek.toLowerCase(),
                startTime: s.startTime,
                endTime: s.endTime,
            }))
        );

        return NextResponse.json({ data: created }, { status: 201 });
    } catch (error) {
        console.error('Failed to create slots', error);
        return NextResponse.json({ message: 'Failed to create slots' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const payload = await verifyJwt(authHeader.slice(7));
        const mentorUserId = payload.sub as string;

        const { slotId } = await request.json();
        if (!slotId) {
            return NextResponse.json({ message: 'slotId is required' }, { status: 400 });
        }

        await mentorBookingRepository.deleteSlot(slotId, mentorUserId);
        return NextResponse.json({ message: 'Slot deleted' });
    } catch (error) {
        console.error('Failed to delete slot', error);
        return NextResponse.json({ message: 'Failed to delete slot' }, { status: 500 });
    }
}

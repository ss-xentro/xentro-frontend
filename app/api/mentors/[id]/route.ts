import { NextRequest, NextResponse } from 'next/server';
import { getMentorProfile, approveMentor, rejectMentor } from '@/server/services/mentor';
import { requireAuth } from '@/server/services/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await getMentorProfile(params.id);
    if (!profile) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: profile }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch mentor', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(request.headers, ['admin', 'approver']);
    const body = await request.json();
    const { action, reason, loginUrl } = body ?? {};

    if (action === 'approve') {
      const profile = await approveMentor({ mentorUserId: params.id, approvedBy: 'admin', loginUrl: loginUrl ?? '/mentor-login' });
      return NextResponse.json({ data: profile }, { status: 200 });
    }

    if (action === 'reject') {
      const profile = await rejectMentor({ mentorUserId: params.id, reason });
      return NextResponse.json({ data: profile }, { status: 200 });
    }

    return NextResponse.json({ message: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update mentor', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

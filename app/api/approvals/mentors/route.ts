import { NextResponse } from 'next/server';
import { approveMentor, rejectMentor } from '@/server/services/mentor';
import { requireAuth } from '@/server/services/auth';

export async function POST(request: Request) {
  try {
    await requireAuth(request.headers, ['admin', 'approver']);
    const body = await request.json();
    const { mentorUserId, decision, reason, loginUrl } = body ?? {};
    if (!mentorUserId || !decision) {
      return NextResponse.json({ message: 'mentorUserId and decision are required' }, { status: 400 });
    }

    if (decision === 'approve') {
      const profile = await approveMentor({ mentorUserId, approvedBy: 'approver', loginUrl: loginUrl ?? '/mentor-login' });
      return NextResponse.json({ data: profile }, { status: 200 });
    }

    if (decision === 'reject') {
      const profile = await rejectMentor({ mentorUserId, reason });
      return NextResponse.json({ data: profile }, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid decision' }, { status: 400 });
  } catch (error) {
    console.error('Failed to process mentor approval', error);
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

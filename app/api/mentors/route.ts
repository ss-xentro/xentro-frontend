import { NextRequest, NextResponse } from 'next/server';
import { submitMentorApplication } from '@/server/services/mentor';
import { mentorRepository } from '@/server/repositories/mentor.repository';
import { requireAuth } from '@/server/services/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request.headers, ['admin', 'approver']);
    const pending = await mentorRepository.listPending();
    return NextResponse.json({ data: pending });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, expertise, rate, occupation, packages, achievements, availability } = body ?? {};

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    const result = await submitMentorApplication({
      name,
      email,
      password,
      expertise,
      rate: rate != null ? Number(rate) : null,
      occupation,
      packages,
      achievements,
      availability,
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit mentor application', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ message }, { status: 400 });
  }
}

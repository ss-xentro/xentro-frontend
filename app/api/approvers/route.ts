import { NextResponse } from 'next/server';
import { approverRepository } from '@/server/repositories/approver.repository';
import { requireAuth } from '@/server/services/auth';

export async function POST(request: Request) {
  try {
    await requireAuth(request.headers, ['admin']);
    const body = await request.json();
    const { name, email, mobile } = body ?? {};
    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    const record = await approverRepository.create({ name, email, mobile });
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error('Failed to create approver', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ message }, { status: 400 });
  }
}

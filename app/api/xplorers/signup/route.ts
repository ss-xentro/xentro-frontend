import { NextResponse } from 'next/server';
import { signupXplorer } from '@/server/services/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, interests } = body ?? {};

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    const result = await signupXplorer({ name, email, password, interests });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('Failed to sign up xplorer', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ message }, { status: 400 });
  }
}

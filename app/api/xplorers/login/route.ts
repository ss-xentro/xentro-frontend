import { NextResponse } from 'next/server';
import { loginXplorerWithPassword } from '@/server/services/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const result = await loginXplorerWithPassword({ email, password });
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Failed to login xplorer', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ message }, { status: 400 });
  }
}

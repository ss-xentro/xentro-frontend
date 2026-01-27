import { NextResponse } from 'next/server';
import { loginXplorerWithGoogle } from '@/server/services/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken } = body ?? {};
    if (!idToken) {
      return NextResponse.json({ message: 'idToken is required' }, { status: 400 });
    }

    const result = await loginXplorerWithGoogle(idToken);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Google login failed', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ message }, { status: 400 });
  }
}

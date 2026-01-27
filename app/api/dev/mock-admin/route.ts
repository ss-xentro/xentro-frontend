import { NextResponse } from 'next/server';
import { signJwt } from '@/server/services/auth';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Not allowed in production' }, { status: 403 });
  }
  const token = await signJwt({ sub: 'dev-admin', email: 'admin@xentro.io', role: 'admin' });
  return NextResponse.json({ token });
}

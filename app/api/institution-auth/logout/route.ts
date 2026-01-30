import { NextRequest, NextResponse } from 'next/server';
import { sessionCache } from '@/server/services/sessionCache';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('institution_token')?.value;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : cookieToken;

    if (token) {
      // Remove from cache
      sessionCache.delete(token);
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    // Clear cookie
    response.cookies.set('institution_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}

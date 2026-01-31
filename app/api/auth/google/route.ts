/**
 * POST /api/auth/google
 * 
 * Login or signup with Google OAuth
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginWithGoogle } from '@/server/services/unified-auth';
import { logActivity } from '@/server/services/activity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'Google ID token is required' },
        { status: 400 }
      );
    }

    const result = await loginWithGoogle(idToken);

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { error: result.error || 'Google login failed' },
        { status: 400 }
      );
    }

    await logActivity({
      userId: result.user.id,
      action: 'user_login',
      details: { provider: 'google' },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Set cookie
    const response = NextResponse.json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatar: result.user.avatar,
        unlockedContexts: result.user.unlockedContexts,
      },
      token: result.token,
    });

    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google login failed';
    
    console.error('Google login error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

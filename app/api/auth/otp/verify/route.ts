/**
 * POST /api/auth/otp/verify
 * 
 * Verify OTP and login
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginWithOtp } from '@/server/services/unified-auth';
import { logActivity } from '@/server/services/activity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Valid 6-digit OTP is required' },
        { status: 400 }
      );
    }

    const result = await loginWithOtp({
      email: email.toLowerCase().trim(),
      otp,
    });

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { error: result.error || 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    await logActivity({
      userId: result.user.id,
      action: 'user_login',
      details: { provider: 'otp' },
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
    const message = error instanceof Error ? error.message : 'OTP verification failed';
    
    if (message.includes('Invalid') || message.includes('expired')) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    console.error('OTP verify error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

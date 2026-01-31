/**
 * POST /api/auth/signup
 * 
 * Create a new user account (all users start as Explorer)
 */

import { NextRequest, NextResponse } from 'next/server';
import { signupWithCredentials } from '@/server/services/unified-auth';
import { logActivity } from '@/server/services/activity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const result = await signupWithCredentials({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { error: result.error || 'Signup failed' },
        { status: 400 }
      );
    }

    await logActivity({
      userId: result.user.id,
      action: 'user_signup',
      details: { provider: 'credentials' },
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
    const message = error instanceof Error ? error.message : 'Signup failed';
    
    if (message.includes('already exists') || message.includes('unique')) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

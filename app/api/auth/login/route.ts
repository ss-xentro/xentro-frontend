/**
 * POST /api/auth/login
 * 
 * Login with email and password
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginWithCredentials } from '@/server/services/unified-auth';
import { logActivity } from '@/server/services/activity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const result = await loginWithCredentials({
      email: email.toLowerCase().trim(),
      password,
    });

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json(
        { error: result.error || 'Invalid email or password' },
        { status: 401 }
      );
    }

    await logActivity({
      userId: result.user.id,
      action: 'user_login',
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
    const message = error instanceof Error ? error.message : 'Login failed';
    
    if (message.includes('Invalid credentials') || message.includes('not found')) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

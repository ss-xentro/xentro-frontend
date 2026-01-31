/**
 * POST /api/auth/context/switch
 * 
 * Switch active context (dashboard view)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromAuth } from '@/server/middleware/rbac';
import { switchContext } from '@/server/services/unified-auth';
import { logActivity } from '@/server/services/activity';
import type { UserContext } from '@/lib/unified-types';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);

    const body = await request.json();
    const { context, entityId } = body;

    if (!context || typeof context !== 'string') {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      );
    }

    // Validate context type
    const validContexts: UserContext[] = ['explorer', 'startup', 'mentor', 'institute', 'admin'];
    if (!validContexts.includes(context as UserContext)) {
      return NextResponse.json(
        { error: 'Invalid context' },
        { status: 400 }
      );
    }

    // Entity ID is required for startup and institute contexts
    if ((context === 'startup' || context === 'institute') && !entityId) {
      return NextResponse.json(
        { error: 'Entity ID is required for startup and institute contexts' },
        { status: 400 }
      );
    }

    // auth.success is guaranteed after requireAuth (throws on error)
    if (!auth.success) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const result = await switchContext(
      user.userId,
      auth.user, // Pass the full JWT payload
      context as UserContext,
      entityId || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 403 }
      );
    }

    await logActivity({
      userId: user.userId,
      action: 'context_switched',
      details: { from: user.context, to: context, entityId },
    });

    // Set new context token in cookie
    const response = NextResponse.json({
      success: true,
      context: context,
      contextToken: result.token,
      entity: result.contextInfo,
    });

    if (result.token) {
      response.cookies.set('context_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 4, // 4 hours
        path: '/',
      });
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to switch context';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (message.includes('not unlocked') || message.includes('Access denied')) {
      return NextResponse.json(
        { error: 'You do not have access to this context' },
        { status: 403 }
      );
    }

    console.error('Context switch error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

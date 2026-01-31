/**
 * GET /api/auth/me
 * 
 * Get current user profile
 * 
 * POST /api/auth/me
 * 
 * Update current user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromAuth } from '@/server/middleware/rbac';
import { db } from '@/db/client';
import * as schema from '@/db/schemas/unified';
import { eq } from 'drizzle-orm';
import { getUserContexts } from '@/server/services/unified-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);

    // Get full user profile with contexts
    const [dbUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.userId))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get available contexts with details
    const contexts = await getUserContexts(user.userId);

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        avatar: dbUser.avatar,
        phone: dbUser.phone,
        unlockedContexts: dbUser.unlockedContexts,
        activeContext: dbUser.activeContext,
        createdAt: dbUser.createdAt,
      },
      contexts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Get user error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);

    const body = await request.json();
    const { name, phone, avatar } = body;

    const updates: Partial<{
      name: string;
      phone: string | null;
      avatar: string | null;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updates.name = name.trim();
    }

    if (phone !== undefined) {
      updates.phone = typeof phone === 'string' ? phone.trim() : null;
    }

    if (avatar !== undefined) {
      updates.avatar = typeof avatar === 'string' ? avatar : null;
    }

    const [updated] = await db
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, user.userId))
      .returning();

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
        phone: updated.phone,
        unlockedContexts: updated.unlockedContexts,
        activeContext: updated.activeContext,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Update user error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

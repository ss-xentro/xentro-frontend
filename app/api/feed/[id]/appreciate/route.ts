/**
 * POST /api/feed/[id]/appreciate
 * 
 * Appreciate (like) a feed item
 * 
 * DELETE /api/feed/[id]/appreciate
 * 
 * Remove appreciation
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromAuth } from '@/server/middleware/rbac';
import { recordInteraction, removeAppreciation } from '@/server/services/feed';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);
    const { id } = await params;

    const interaction = await recordInteraction({
      feedItemId: id,
      userId: user.userId,
      type: 'appreciate',
    });

    if (!interaction) {
      return NextResponse.json(
        { error: 'Already appreciated' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, interaction });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to appreciate';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Appreciate error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);
    const { id } = await params;

    const removed = await removeAppreciation({
      feedItemId: id,
      userId: user.userId,
    });

    if (!removed) {
      return NextResponse.json(
        { error: 'Not appreciated' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove appreciation';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Remove appreciation error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

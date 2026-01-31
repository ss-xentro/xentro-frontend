/**
 * POST /api/feed/[id]/mentor-tip
 * 
 * Send a mentor tip on a feed item (mentor only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMentor, getUserFromAuth } from '@/server/middleware/rbac';
import { recordInteraction, getFeedItemById } from '@/server/services/feed';
import { sendNotification } from '@/server/services/notifications';
import { db } from '@/db/client';
import * as schema from '@/db/schemas/unified';
import { eq } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireMentor(request.headers);
    const user = getUserFromAuth(auth);
    const { id } = await params;

    const body = await request.json();
    const { note, amount } = body;

    if (!note || typeof note !== 'string' || note.trim().length < 10) {
      return NextResponse.json(
        { error: 'Tip note must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Get feed item to find the creator
    const feedItem = await getFeedItemById(id);
    if (!feedItem) {
      return NextResponse.json(
        { error: 'Feed item not found' },
        { status: 404 }
      );
    }

    const interaction = await recordInteraction({
      feedItemId: id,
      userId: user.userId,
      type: 'mentor_tip',
      tipAmount: amount || 0,
      tipNote: note.trim(),
    });

    // Get mentor info for notification
    const [mentor] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.userId))
      .limit(1);

    // Notify the feed item creator
    if (feedItem.createdBy && feedItem.createdBy !== user.userId) {
      await sendNotification({
        userId: feedItem.createdBy,
        type: 'mentor_tip_received',
        title: 'You received a mentor tip! 💡',
        message: `${mentor?.name || 'A mentor'} shared advice: "${note.slice(0, 100)}${note.length > 100 ? '...' : ''}"`,
        entityType: 'feed_item',
        entityId: id,
      });
    }

    return NextResponse.json({ success: true, interaction });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send tip';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Only mentors can send tips' },
        { status: 403 }
      );
    }

    console.error('Mentor tip error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

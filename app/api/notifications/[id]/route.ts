/**
 * POST /api/notifications/[id]/read
 * 
 * Mark a notification as read
 * 
 * DELETE /api/notifications/[id]
 * 
 * Delete a notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromAuth } from '@/server/middleware/rbac';
import { markNotificationRead, deleteNotification } from '@/server/services/notifications';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);
    const { id } = await params;

    const success = await markNotificationRead(id, user.userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark notification read';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Mark read error:', error);
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

    const success = await deleteNotification(id, user.userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete notification';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Delete notification error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

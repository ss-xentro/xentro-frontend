/**
 * POST /api/notifications/read-all
 * 
 * Mark all notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromAuth } from '@/server/middleware/rbac';
import { markAllNotificationsRead } from '@/server/services/notifications';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);

    const count = await markAllNotificationsRead(user.userId);

    return NextResponse.json({ success: true, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark notifications read';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Mark all read error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

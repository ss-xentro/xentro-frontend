/**
 * GET /api/notifications
 * 
 * Get user notifications
 * 
 * POST /api/notifications/read-all
 * 
 * Mark all notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromAuth } from '@/server/middleware/rbac';
import { getUserNotifications, markAllNotificationsRead } from '@/server/services/notifications';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getUserNotifications(user.userId, {
      unreadOnly,
      limit: Math.min(limit, 100),
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get notifications';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

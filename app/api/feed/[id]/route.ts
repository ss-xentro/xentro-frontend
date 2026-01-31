/**
 * GET /api/feed/[id]
 * 
 * Get feed item by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFeedItemById, recordInteraction } from '@/server/services/feed';
import { verifyJwt } from '@/server/services/unified-auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const item = await getFeedItemById(id);

    if (!item) {
      return NextResponse.json(
        { error: 'Feed item not found' },
        { status: 404 }
      );
    }

    // Record view if user is authenticated
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payload = await verifyJwt(token);
        const userId = payload.sub as string;

        // Record view asynchronously (don't wait)
        recordInteraction({
          feedItemId: id,
          userId,
          type: 'viewed',
        }).catch(console.error);
      } catch {
        // Ignore auth errors
      }
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Get feed item error:', error);
    return NextResponse.json(
      { error: 'Failed to get feed item' },
      { status: 500 }
    );
  }
}

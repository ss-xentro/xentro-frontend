/**
 * GET /api/feed
 * 
 * Get personalized feed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFeed } from '@/server/services/feed';
import { verifyJwt } from '@/server/services/unified-auth';
import type { UserContext } from '@/lib/unified-types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional auth - feed works for anonymous users too
    let userId: string | undefined;
    let context: UserContext | undefined;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payload = await verifyJwt(token);
        userId = payload.sub as string;
        // context is only available on ContextJwtPayload
        if ('context' in payload) {
          context = payload.context as UserContext;
        }
      } catch {
        // Ignore auth errors for public feed
      }
    }

    // Parse query params
    const sectors = searchParams.get('sectors')?.split(',').filter(Boolean);
    const stages = searchParams.get('stages')?.split(',').filter(Boolean);
    const sourceTypes = searchParams.get('sourceTypes')?.split(',').filter(Boolean);
    const search = searchParams.get('search') || undefined;
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sort = (searchParams.get('sort') || 'recent') as 'rank' | 'recent' | 'trending';

    const result = await getFeed({
      userId,
      context,
      sectors,
      stages,
      sourceTypes,
      search,
      cursor,
      limit: Math.min(limit, 50), // Max 50 items per request
      sort,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json(
      { error: 'Failed to get feed' },
      { status: 500 }
    );
  }
}

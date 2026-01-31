/**
 * GET /api/admin/forms
 * 
 * Get forms for admin review
 * 
 * (Admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminLevel } from '@/server/middleware/rbac';
import { getFormsForReview } from '@/server/services/forms';
import type { FormType, FormStatus } from '@/lib/unified-types';

export async function GET(request: NextRequest) {
  try {
    // Require at least moderator level
    await requireAdminLevel(request.headers, 'L1');

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as FormType | null;
    const status = (searchParams.get('status') || 'submitted') as FormStatus;

    const forms = await getFormsForReview(
      type || undefined,
      status
    );

    return NextResponse.json({ forms });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get forms';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.error('Get admin forms error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

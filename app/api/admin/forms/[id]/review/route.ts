/**
 * POST /api/admin/forms/[id]/review
 * 
 * Review a form (approve/reject/request changes)
 * 
 * (Admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminLevel, getUserFromAuth } from '@/server/middleware/rbac';
import { reviewForm } from '@/server/services/forms';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    // Require at least moderator level
    const auth = await requireAdminLevel(request.headers, 'L1');
    const user = getUserFromAuth(auth);
    const { id } = await params;

    const body = await request.json();
    const { action, notes } = body;

    // Validate action
    const validActions = ['approve', 'reject', 'request_changes'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: approve, reject, or request_changes' },
        { status: 400 }
      );
    }

    // Notes required for reject/request_changes
    if ((action === 'reject' || action === 'request_changes') && !notes) {
      return NextResponse.json(
        { error: 'Notes are required when rejecting or requesting changes' },
        { status: 400 }
      );
    }

    const result = await reviewForm({
      formId: id,
      reviewerId: user.userId,
      action,
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to review form' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to review form';
    
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

    console.error('Review form error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

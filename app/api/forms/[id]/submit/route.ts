/**
 * POST /api/forms/[id]/submit
 * 
 * Submit a draft form for review
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromAuth } from '@/server/middleware/rbac';
import { submitForm } from '@/server/services/forms';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);
    const { id } = await params;

    const result = await submitForm({
      formId: id,
      userId: user.userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to submit form' },
        { status: 400 }
      );
    }

    return NextResponse.json({ form: result.form });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit form';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Submit form error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

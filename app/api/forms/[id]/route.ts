/**
 * GET /api/forms/[id]
 * 
 * Get form by ID
 * 
 * PUT /api/forms/[id]
 * 
 * Update a draft form
 * 
 * DELETE /api/forms/[id]
 * 
 * Withdraw a form
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromAuth } from '@/server/middleware/rbac';
import { getFormById, updateForm, withdrawForm } from '@/server/services/forms';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);
    const { id } = await params;

    const form = await getFormById(id);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Only allow access to own forms or if admin
    if (form.submittedBy !== user.userId && user.context !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ form });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get form';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Get form error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);
    const { id } = await params;

    const body = await request.json();
    const { data, attachments } = body;

    const form = await updateForm({
      formId: id,
      userId: user.userId,
      data,
      attachments,
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or cannot be updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({ form });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update form';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Update form error:', error);
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

    const result = await withdrawForm({
      formId: id,
      userId: user.userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to withdraw form' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to withdraw form';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Withdraw form error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

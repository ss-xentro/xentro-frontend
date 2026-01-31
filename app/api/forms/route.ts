/**
 * GET /api/forms
 * 
 * Get user's forms
 * 
 * POST /api/forms
 * 
 * Create a new form (starts as draft)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getUserFromAuth } from '@/server/middleware/rbac';
import { createForm, getUserForms } from '@/server/services/forms';
import type { FormType, FormStatus } from '@/lib/unified-types';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as FormType | null;
    const status = searchParams.get('status') as FormStatus | null;

    const forms = await getUserForms(
      user.userId,
      type || undefined,
      status || undefined
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

    console.error('Get forms error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request.headers);
    const user = getUserFromAuth(auth);

    const body = await request.json();
    const { type, data, attachments } = body;

    // Validate form type
    const validTypes: FormType[] = [
      'startup_create',
      'mentor_apply',
      'institute_create',
      'event_create',
      'program_create',
      'startup_update',
      'mentor_update',
      'institute_update',
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid form type' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      );
    }

    const form = await createForm({
      type,
      submittedBy: user.userId,
      data,
      attachments,
    });

    return NextResponse.json({ form }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create form';
    
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Create form error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

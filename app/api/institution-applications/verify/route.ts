import { NextRequest, NextResponse } from 'next/server';
import { institutionApplicationController } from '@/server/controllers/institutionApplication.controller';
import { HttpError } from '@/server/controllers/http-error';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const updated = await institutionApplicationController.verify(token);
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') ?? '';
    const next = searchParams.get('next');
    const updated = await institutionApplicationController.verify(token);

    const accept = request.headers.get('accept') || '';
    const wantsHtml = accept.includes('text/html');

    // When the magic link is clicked from email (browser navigation), redirect to the wizard.
    // When called via fetch (wizard step), return JSON to keep existing flow working.
    if (wantsHtml) {
      const redirectTarget = next || '/institution-dashboard';
      const url = new URL(redirectTarget, request.url);
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof HttpError) {
    console.error('Institution verification HttpError', { status: error.status, message: error.message });
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  const fallback = error instanceof Error ? error.message : 'Unexpected error';
  console.error('Institution verification unexpected error', error);
  return NextResponse.json({ message: fallback }, { status: 500 });
}

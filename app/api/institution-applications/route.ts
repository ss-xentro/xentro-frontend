import { NextRequest, NextResponse } from 'next/server';
import { institutionApplicationController } from '@/server/controllers/institutionApplication.controller';
import { HttpError } from '@/server/controllers/http-error';

export async function GET() {
  try {
    const data = await institutionApplicationController.listAll();
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = await institutionApplicationController.submit({
      name: body.name,
      email: body.email,
      type: body.type,
      tagline: body.tagline ?? null,
      city: body.city ?? null,
      country: body.country ?? null,
      website: body.website ?? null,
      description: body.description ?? null,
    });
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof HttpError) {
    console.error('Institution application HttpError', { status: error.status, message: error.message });
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  const fallback = error instanceof Error ? error.message : 'Unexpected error';
  console.error('Institution application unexpected error', error);
  return NextResponse.json({ message: fallback }, { status: 500 });
}

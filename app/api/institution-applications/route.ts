import { NextRequest, NextResponse } from 'next/server';
import { institutionApplicationController } from '@/server/controllers/institutionApplication.controller';
import { HttpError } from '@/server/controllers/http-error';
import { verifyToken } from '@/server/services/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from request
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('institution_token')?.value;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : cookieToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Verify token and get email
    const payload = await verifyToken(token);
    if (!payload || payload.type !== 'institution' || !payload.email) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Only return applications for this email
    const data = await institutionApplicationController.listByEmail(String(payload.email));
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

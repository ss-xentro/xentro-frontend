import { NextRequest, NextResponse } from 'next/server';
import { institutionController } from '@/server/controllers/institution.controller';
import { HttpError } from '@/server/controllers/http-error';
import { verifyToken } from '@/server/services/auth';

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = await institutionController.getById(id);
    return NextResponse.json(payload);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await institutionController.update(id, {
      name: body.name,
      type: body.type,
      tagline: body.tagline ?? null,
      city: body.city ?? null,
      country: body.country ?? null,
      countryCode: body.countryCode ?? null,
      operatingMode: body.operatingMode ?? null,
      location: body.location ?? null,
      startupsSupported: body.startupsSupported != null ? Number(body.startupsSupported) : undefined,
      studentsMentored: body.studentsMentored != null ? Number(body.studentsMentored) : undefined,
      fundingFacilitated: body.fundingFacilitated != null ? String(body.fundingFacilitated) : undefined,
      fundingCurrency: body.fundingCurrency,
      logo: body.logo ?? null,
      website: body.website ?? null,
      linkedin: body.linkedin ?? null,
      description: body.description ?? null,
      status: body.status,
      verified: body.verified,
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // Verify institution auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload || payload.type !== 'institution' || payload.institutionId !== id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updated = await institutionController.update(id, {
      name: body.name,
      type: body.type,
      tagline: body.tagline ?? null,
      city: body.city ?? null,
      country: body.country ?? null,
      operatingMode: body.operatingMode ?? null,
      website: body.website ?? null,
      linkedin: body.linkedin ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      description: body.description ?? null,
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await institutionController.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error('Failed to fetch institution', error);
  return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
}

import { NextRequest, NextResponse } from 'next/server';
import { institutionController } from '@/server/controllers/institution.controller';
import { HttpError } from '@/server/controllers/http-error';

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
      fundingFacilitated: body.fundingFacilitated != null ? Number(body.fundingFacilitated) : undefined,
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

function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error('Failed to fetch institution', error);
  return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
}

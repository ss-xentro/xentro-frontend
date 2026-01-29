import { NextResponse } from 'next/server';
import { institutionController } from '@/server/controllers/institution.controller';
import { HttpError } from '@/server/controllers/http-error';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');
    const data = scope === 'all'
      ? await institutionController.listAll()
      : await institutionController.listPublished();
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.name || !body?.type || !body?.email) {
      throw new HttpError(400, 'Name, type, and email are required');
    }

    const record = await institutionController.create({
      name: body.name,
      type: body.type,
      email: body.email,
      phone: body.phone ?? null,
      tagline: body.tagline ?? null,
      city: body.city ?? null,
      country: body.country ?? null,
      countryCode: body.countryCode ?? null,
      operatingMode: body.operatingMode ?? null,
      location: body.location ?? null,
      startupsSupported: Number(body.startupsSupported ?? 0),
      studentsMentored: Number(body.studentsMentored ?? 0),
      fundingFacilitated: String(body.fundingFacilitated ?? 0),
      fundingCurrency: body.fundingCurrency ?? 'USD',
      logo: body.logo ?? null,
      website: body.website ?? null,
      linkedin: body.linkedin ?? null,
      description: body.description ?? null,
      sdgFocus: body.sdgFocus ?? null,
      sectorFocus: body.sectorFocus ?? null,
      legalDocuments: body.legalDocuments ?? null,
      status: body.status ?? 'published',
      verified: Boolean(body.verified ?? false),
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error('Failed to fetch institutions', error);
  return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
}

import { NextRequest, NextResponse } from 'next/server';
import { institutionApplicationController } from '@/server/controllers/institutionApplication.controller';
import { HttpError } from '@/server/controllers/http-error';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action, remark } = body;
    if (!['approved', 'rejected'].includes(action)) {
      throw new HttpError(400, 'action must be approved or rejected');
    }
    const result = await institutionApplicationController.updateStatus(id, action, remark ?? null);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await institutionApplicationController.updateDetails(id, {
      name: body.name,
      type: body.type,
      tagline: body.tagline ?? null,
      city: body.city ?? null,
      country: body.country ?? null,
      countryCode: body.countryCode ?? null,
      operatingMode: body.operatingMode ?? null,
      website: body.website ?? null,
      linkedin: body.linkedin ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      description: body.description ?? null,
      logo: body.logo ?? null,
      sdgFocus: body.sdgFocus ?? null,
      sectorFocus: body.sectorFocus ?? null,
      legalDocuments: body.legalDocuments ?? null,
      startupsSupported: body.startupsSupported ?? 0,
      studentsMentored: body.studentsMentored ?? 0,
      fundingFacilitated: body.fundingFacilitated ?? '0',
      fundingCurrency: body.fundingCurrency ?? 'USD',
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // This endpoint is for final submission with validation
    const updated = await institutionApplicationController.submitForApproval(id, {
      name: body.name,
      type: body.type,
      tagline: body.tagline ?? null,
      city: body.city ?? null,
      country: body.country ?? null,
      countryCode: body.countryCode ?? null,
      operatingMode: body.operatingMode ?? null,
      website: body.website ?? null,
      linkedin: body.linkedin ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      description: body.description ?? null,
      logo: body.logo ?? null,
      sdgFocus: body.sdgFocus ?? null,
      sectorFocus: body.sectorFocus ?? null,
      legalDocuments: body.legalDocuments ?? null,
      startupsSupported: body.startupsSupported ?? 0,
      studentsMentored: body.studentsMentored ?? 0,
      fundingFacilitated: body.fundingFacilitated ?? '0',
      fundingCurrency: body.fundingCurrency ?? 'USD',
    });
    return NextResponse.json({ data: updated, message: 'Application submitted for approval successfully' });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  console.error('Institution application update error', error);
  return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
}

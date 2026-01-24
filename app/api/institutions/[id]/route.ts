import { NextRequest, NextResponse } from 'next/server';
import { institutionController } from '@/server/controllers/institution.controller';
import { HttpError } from '@/server/controllers/http-error';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await institutionController.getById(params.id);
    return NextResponse.json(payload);
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

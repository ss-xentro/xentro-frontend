import { NextRequest, NextResponse } from 'next/server';
import { startupController } from '@/server/controllers/startup.controller';
import { HttpError } from '@/server/controllers/http-error';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    
    // Check if this is a public view (should track profile views)
    const isPublicView = request.headers.get('x-public-view') === 'true';
    
    const startup = await startupController.getBySlugOrId(identifier, isPublicView);
    
    return NextResponse.json({ startup });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error('Fetch startup error:', error);
    return NextResponse.json({ message: 'Failed to fetch startup' }, { status: 500 });
  }
}

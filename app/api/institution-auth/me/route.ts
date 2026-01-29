import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/server/services/auth';
import { db } from '@/db/client';
import { institutions } from '@/db/schemas';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload || payload.type !== 'institution') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const institution = await db.query.institutions.findFirst({
      where: eq(institutions.id, payload.institutionId as string),
    });

    if (!institution) {
      return NextResponse.json({ message: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json({ institution });
  } catch (error) {
    console.error('Get institution error:', error);
    return NextResponse.json({ message: 'Failed to fetch institution' }, { status: 500 });
  }
}

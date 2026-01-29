import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { programs } from '@/db/schemas';
import { verifyToken } from '@/server/services/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                   request.cookies.get('institution_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const institutionId = typeof decoded.institutionId === 'string' ? decoded.institutionId : '';
    if (!institutionId) {
      return NextResponse.json(
        { message: 'Institution not found in token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type, description, duration, startDate, endDate, isActive } = body;

    if (!name || !type) {
      return NextResponse.json(
        { message: 'Name and type are required' },
        { status: 400 }
      );
    }

    const [program] = await db
      .insert(programs)
      .values({
        institutionId,
        name,
        type,
        description: description || null,
        duration: duration || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json({ data: program }, { status: 201 });
  } catch (error) {
    console.error('Create program error:', error);
    return NextResponse.json(
      { message: 'Failed to create program' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                   request.cookies.get('institution_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const institutionId = typeof decoded.institutionId === 'string' ? decoded.institutionId : '';
    if (!institutionId) {
      return NextResponse.json(
        { message: 'Institution not found in token' },
        { status: 401 }
      );
    }

    const programsList = await db.query.programs.findMany({
      where: eq(programs.institutionId, institutionId),
      orderBy: (programs, { desc }) => [desc(programs.startDate)],
    });

    return NextResponse.json({ data: programsList });
  } catch (error) {
    console.error('Fetch programs error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

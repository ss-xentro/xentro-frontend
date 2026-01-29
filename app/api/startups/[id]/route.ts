import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startups, users, teamMembers } from '@/db/schemas';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/server/services/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const startup = await db.query.startups.findFirst({
      where: and(eq(startups.id, id), eq(startups.institutionId, institutionId)),
    });

    if (!startup) {
      return NextResponse.json(
        { message: 'Startup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: startup });
  } catch (error) {
    console.error('Fetch startup error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch startup' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { name, stage, location, oneLiner } = body;

    const [updatedStartup] = await db
      .update(startups)
      .set({
        name: name || undefined,
        stage: stage || null,
        location: location || null,
        oneLiner: oneLiner || null,
      })
      .where(and(eq(startups.id, id), eq(startups.institutionId, institutionId)))
      .returning();

    if (!updatedStartup) {
      return NextResponse.json(
        { message: 'Startup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedStartup });
  } catch (error) {
    console.error('Update startup error:', error);
    return NextResponse.json(
      { message: 'Failed to update startup' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const [deletedStartup] = await db
      .delete(startups)
      .where(and(eq(startups.id, id), eq(startups.institutionId, institutionId)))
      .returning();

    if (!deletedStartup) {
      return NextResponse.json(
        { message: 'Startup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Startup deleted successfully' });
  } catch (error) {
    console.error('Delete startup error:', error);
    return NextResponse.json(
      { message: 'Failed to delete startup' },
      { status: 500 }
    );
  }
}

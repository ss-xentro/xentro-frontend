import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { projects } from '@/db/schemas';
import { verifyToken } from '@/server/services/auth';
import { eq, and } from 'drizzle-orm';
import { projectEvents } from '@/lib/pusher-server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const project = await db.query.projects.findFirst({
            where: eq(projects.id, id),
        });

        if (!project) {
            return NextResponse.json(
                { message: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: project });
    } catch (error) {
        console.error('Get project error:', error);
        return NextResponse.json(
            { message: 'Failed to get project' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();
        const { name, status, description, startDate, endDate } = body;

        const [updated] = await db
            .update(projects)
            .set({
                ...(name !== undefined && { name }),
                ...(status !== undefined && { status }),
                ...(description !== undefined && { description }),
                ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                updatedAt: new Date(),
            })
            .where(and(eq(projects.id, id), eq(projects.institutionId, institutionId)))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { message: 'Project not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: updated });
    } catch (error) {
        console.error('Update project error:', error);
        return NextResponse.json(
            { message: 'Failed to update project' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        const [deleted] = await db
            .delete(projects)
            .where(and(eq(projects.id, id), eq(projects.institutionId, institutionId)))
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { message: 'Project not found or unauthorized' },
                { status: 404 }
            );
        }

        // Broadcast real-time event
        await projectEvents.deleted(institutionId, id);

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        return NextResponse.json(
            { message: 'Failed to delete project' },
            { status: 500 }
        );
    }
}


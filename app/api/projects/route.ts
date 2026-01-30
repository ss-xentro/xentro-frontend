import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { projects } from '@/db/schemas';
import { verifyToken } from '@/server/services/auth';
import { eq } from 'drizzle-orm';
import { projectEvents } from '@/lib/pusher-server';

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

        const projectsList = await db.query.projects.findMany({
            where: eq(projects.institutionId, institutionId),
            orderBy: (projects, { desc }) => [desc(projects.createdAt)],
        });

        return NextResponse.json({ data: projectsList });
    } catch (error) {
        console.error('Fetch projects error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

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
        const { name, status, description, startDate, endDate } = body;

        if (!name) {
            return NextResponse.json(
                { message: 'Project name is required' },
                { status: 400 }
            );
        }

        const [project] = await db
            .insert(projects)
            .values({
                institutionId,
                name,
                status: status || 'planning',
                description: description || null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            })
            .returning();

        // Broadcast real-time event
        await projectEvents.created(institutionId, project);

        return NextResponse.json({ data: project }, { status: 201 });
    } catch (error) {
        console.error('Create project error:', error);
        return NextResponse.json(
            { message: 'Failed to create project' },
            { status: 500 }
        );
    }
}


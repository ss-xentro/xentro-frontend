import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startups, startupFounders, startupActivityLogs } from '@/db/schemas';
import { eq, desc } from 'drizzle-orm';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { message: 'Startup ID is required' },
                { status: 400 }
            );
        }

        const [startup] = await db
            .select()
            .from(startups)
            .where(eq(startups.id, id))
            .limit(1);

        if (!startup) {
            return NextResponse.json(
                { message: 'Startup not found' },
                { status: 404 }
            );
        }

        // Get founders
        const founders = await db
            .select()
            .from(startupFounders)
            .where(eq(startupFounders.startupId, id));

        // Get activity logs
        const activityLogs = await db
            .select()
            .from(startupActivityLogs)
            .where(eq(startupActivityLogs.startupId, id))
            .orderBy(desc(startupActivityLogs.createdAt))
            .limit(50);

        return NextResponse.json({
            data: {
                ...startup,
                founders,
                activityLogs,
            },
        });
    } catch (error) {
        console.error('Get startup error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch startup' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { message: 'Startup ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Get existing startup
        const [existingStartup] = await db
            .select()
            .from(startups)
            .where(eq(startups.id, id))
            .limit(1);

        if (!existingStartup) {
            return NextResponse.json(
                { message: 'Startup not found' },
                { status: 404 }
            );
        }

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        const changes: Record<string, { from: unknown; to: unknown }> = {};

        const allowedFields = [
            'name', 'tagline', 'logo', 'pitch', 'foundedDate', 'stage',
            'status', 'fundingRound', 'fundsRaised', 'fundingCurrency',
            'investors', 'primaryContactEmail', 'location'
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                const newValue = field === 'foundedDate' && body[field]
                    ? new Date(body[field])
                    : body[field];
                const oldValue = existingStartup[field as keyof typeof existingStartup];

                if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                    updateData[field] = newValue;
                    changes[field] = { from: oldValue, to: newValue };
                }
            }
        }

        // Update startup if there are changes
        if (Object.keys(changes).length > 0) {
            await db
                .update(startups)
                .set(updateData)
                .where(eq(startups.id, id));

            // Log activity
            await db.insert(startupActivityLogs).values({
                startupId: id,
                userId: existingStartup.ownerId,
                action: 'updated',
                details: { changes },
            });
        }

        // Get updated startup
        const [updatedStartup] = await db
            .select()
            .from(startups)
            .where(eq(startups.id, id))
            .limit(1);

        return NextResponse.json({
            data: updatedStartup,
            message: 'Startup updated successfully',
        });
    } catch (error) {
        console.error('Update startup error:', error);
        return NextResponse.json(
            { message: 'Failed to update startup' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { message: 'Startup ID is required' },
                { status: 400 }
            );
        }

        const [startup] = await db
            .select()
            .from(startups)
            .where(eq(startups.id, id))
            .limit(1);

        if (!startup) {
            return NextResponse.json(
                { message: 'Startup not found' },
                { status: 404 }
            );
        }

        // Delete startup (cascades to founders, activity logs, etc.)
        await db.delete(startups).where(eq(startups.id, id));

        return NextResponse.json({
            message: 'Startup deleted successfully',
        });
    } catch (error) {
        console.error('Delete startup error:', error);
        return NextResponse.json(
            { message: 'Failed to delete startup' },
            { status: 500 }
        );
    }
}

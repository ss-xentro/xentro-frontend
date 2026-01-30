import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startups, startupFounders, startupActivityLogs } from '@/db/schemas';
import { eq, desc, and } from 'drizzle-orm';
import { verifyToken } from '@/server/services/auth'; // Using existing auth service helpers

export async function GET(request: NextRequest) {
    try {
        // Get token from header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];

        // Verify token
        let payload;
        try {
            payload = await verifyToken(token);
        } catch (e) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const userId = String(payload.sub);

        // Find startup for this user
        // We check startupFounders to see which startup they belong to
        // If token has startupId, prefer that, but verify access

        const [founderRecord] = await db
            .select()
            .from(startupFounders)
            .where(eq(startupFounders.userId, userId))
            .limit(1);

        if (!founderRecord) {
            return NextResponse.json({ message: 'No startup found for this user' }, { status: 404 });
        }

        const startupId = founderRecord.startupId;

        // Get startup details
        const [startup] = await db
            .select()
            .from(startups)
            .where(eq(startups.id, startupId))
            .limit(1);

        // Get recent activity
        const activityLogs = await db
            .select()
            .from(startupActivityLogs)
            .where(eq(startupActivityLogs.startupId, startupId))
            .orderBy(desc(startupActivityLogs.createdAt))
            .limit(10);

        return NextResponse.json({
            data: {
                startup,
                founderRole: founderRecord.role,
                recentActivity: activityLogs,
            }
        });

    } catch (error) {
        console.error('Get my-startup error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch startup data' },
            { status: 500 }
        );
    }
}

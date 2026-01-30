import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startupActivityLogs, startupFounders, users } from '@/db/schemas';
import { eq, desc } from 'drizzle-orm';
import { verifyToken } from '@/server/services/auth';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const token = authHeader.split(' ')[1];
        let payload;
        try { payload = await verifyToken(token); } catch (e) { return NextResponse.json({ message: 'Invalid token' }, { status: 401 }); }

        const userId = String(payload.sub);
        const [founderRecord] = await db.select().from(startupFounders).where(eq(startupFounders.userId, userId)).limit(1);
        if (!founderRecord) return NextResponse.json({ message: 'No startup found' }, { status: 404 });
        const startupId = founderRecord.startupId;

        // Fetch logs with user details who performed action
        // Note: Drizzle raw query or join needed.
        // We'll fetch logs and join user name manually or via relation if defined.
        // For now simple fetch.

        const logs = await db
            .select({
                id: startupActivityLogs.id,
                action: startupActivityLogs.action,
                details: startupActivityLogs.details,
                createdAt: startupActivityLogs.createdAt,
                userName: users.name, // Join manually? DB client.ts doesn't setup relations automatically unless defined.
                // Let's do a simple join or just fetch userId and resolve.
            })
            .from(startupActivityLogs)
            .leftJoin(users, eq(startupActivityLogs.userId, users.id))
            .where(eq(startupActivityLogs.startupId, startupId))
            .orderBy(desc(startupActivityLogs.createdAt))
            .limit(50); // Limit 50 for now

        return NextResponse.json({ data: logs });
    } catch (error) {
        console.error('Fetch activity error:', error);
        return NextResponse.json({ message: 'Failed to fetch activity' }, { status: 500 });
    }
}

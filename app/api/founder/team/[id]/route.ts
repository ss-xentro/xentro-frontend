import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startupFounders, startupActivityLogs } from '@/db/schemas';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/server/services/auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const token = authHeader.split(' ')[1];
        let payload;
        try { payload = await verifyToken(token); } catch (e) { return NextResponse.json({ message: 'Invalid token' }, { status: 401 }); }

        const userId = String(payload.sub);
        const [founderRecord] = await db.select().from(startupFounders).where(eq(startupFounders.userId, userId)).limit(1);
        if (!founderRecord) return NextResponse.json({ message: 'No startup found' }, { status: 404 });
        const startupId = founderRecord.startupId;

        if (founderRecord.role !== 'ceo' && founderRecord.role !== 'founder') {
            return NextResponse.json({ message: 'Only CEO or Founder can remove members' }, { status: 403 });
        }

        // Determine target ID (this is the ID in startupFounders table, NOT userId)
        const targetId = id;

        // Check if target exists and belongs to startup
        const [target] = await db.select().from(startupFounders).where(and(eq(startupFounders.id, targetId), eq(startupFounders.startupId, startupId))).limit(1);

        if (!target) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }

        if (target.isPrimary) {
            return NextResponse.json({ message: 'Cannot remove primary contact' }, { status: 400 });
        }

        // Remove
        await db.delete(startupFounders).where(eq(startupFounders.id, targetId));

        // Log
        await db.insert(startupActivityLogs).values({
            startupId,
            userId,
            action: 'founder_removed',
            details: { removed_name: target.name, removed_email: target.email }
        });

        return NextResponse.json({ message: 'Member removed successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to remove member' }, { status: 500 });
    }
}

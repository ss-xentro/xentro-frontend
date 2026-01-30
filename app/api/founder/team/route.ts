import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { users, startupFounders, startupActivityLogs } from '@/db/schemas'; // Assuming schemas exported
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/server/services/auth';
import { sendEmail } from '@/server/services/email';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const token = authHeader.split(' ')[1];

        // Verify & Get Context
        // We can extract this context logic into a helper 'getFounderContext(request)' later to stay DRY
        let payload;
        try { payload = await verifyToken(token); } catch (e) { return NextResponse.json({ message: 'Invalid token' }, { status: 401 }); }

        const userId = String(payload.sub);
        const [founderRecord] = await db.select().from(startupFounders).where(eq(startupFounders.userId, userId)).limit(1);

        if (!founderRecord) return NextResponse.json({ message: 'No startup found' }, { status: 404 });
        const startupId = founderRecord.startupId;

        // Fetch team
        const team = await db
            .select({
                id: startupFounders.id,
                userId: startupFounders.userId,
                name: startupFounders.name,
                email: startupFounders.email,
                role: startupFounders.role,
                isPrimary: startupFounders.isPrimary,
                joinedAt: startupFounders.createdAt,
            })
            .from(startupFounders)
            .where(eq(startupFounders.startupId, startupId));

        return NextResponse.json({ data: team });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch team' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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

        // Body
        const body = await request.json();
        const { email, name, role } = body;

        if (!email || !name || !role) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const lowerEmail = email.toLowerCase();

        // Check if user exists
        let [targetUser] = await db.select().from(users).where(eq(users.email, lowerEmail)).limit(1);

        // If not, create user account
        if (!targetUser) {
            [targetUser] = await db.insert(users).values({
                email: lowerEmail,
                name: name,
                accountType: 'startup',
                // No password needed for OTP flow
            }).returning();
        }

        // Check if already in startup
        const [existingMember] = await db
            .select()
            .from(startupFounders)
            .where(and(
                eq(startupFounders.startupId, startupId),
                eq(startupFounders.userId, targetUser.id)
            ))
            .limit(1);

        if (existingMember) {
            return NextResponse.json({ message: 'User is already a member of this startup' }, { status: 400 });
        }

        // Add to startup
        await db.insert(startupFounders).values({
            startupId,
            userId: targetUser.id,
            name: name, // Use provided name for the founder record display preference, or sync with user? Schema has name in both.
            email: lowerEmail,
            role: role,
            isPrimary: false,
        });

        // Activity Log
        await db.insert(startupActivityLogs).values({
            startupId,
            userId: userId, // Performed by
            action: 'founder_added',
            details: { added_email: lowerEmail, role },
        });

        // Notify new member
        await sendEmail({
            to: lowerEmail,
            subject: 'You have been added to a startup on XENTRO',
            text: `Hello ${name},\n\nYou have been added to the team. Log in with your email to access the dashboard.`,
            html: `<p>Hello ${name},</p><p>You have been added to the team. Log in with your email to access the dashboard.</p>`
        });

        return NextResponse.json({ message: 'Team member added successfully' });

    } catch (error) {
        console.error('Add team member error:', error);
        return NextResponse.json({ message: 'Failed to add team member' }, { status: 500 });
    }
}

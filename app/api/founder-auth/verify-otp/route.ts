import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startupSessions, users } from '@/db/schemas';
import { eq, and, gt } from 'drizzle-orm';
import { signToken } from '@/server/services/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, otp } = body;

        if (!sessionId || !otp) {
            return NextResponse.json(
                { message: 'Session ID and OTP are required' },
                { status: 400 }
            );
        }

        // Verify session
        const [session] = await db
            .select()
            .from(startupSessions)
            .where(and(
                eq(startupSessions.id, sessionId),
                eq(startupSessions.otp, otp),
                gt(startupSessions.expiresAt, new Date())
            ))
            .limit(1);

        if (!session) {
            return NextResponse.json(
                { message: 'Invalid or expired OTP' },
                { status: 401 }
            );
        }

        if (session.verified) {
            return NextResponse.json(
                { message: 'OTP already used' },
                { status: 400 }
            );
        }

        // Mark verified
        await db
            .update(startupSessions)
            .set({ verified: true })
            .where(eq(startupSessions.id, sessionId));

        // Get user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, session.email))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Generate JWT
        const token = await signToken({
            sub: user.id,
            email: session.email,
            role: 'startup',
            // Include startupId if available to simplify client context
            startupId: session.startupId,
        });

        return NextResponse.json({
            token,
            startupId: session.startupId,
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { message: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}

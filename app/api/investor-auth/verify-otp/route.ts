import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { otpSessions, users } from '@/db/schemas';
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

        // Verify session from universal OTP table
        const [session] = await db
            .select()
            .from(otpSessions)
            .where(and(
                eq(otpSessions.id, sessionId),
                eq(otpSessions.otp, otp),
                eq(otpSessions.purpose, 'login'),
                gt(otpSessions.expiresAt, new Date())
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
            .update(otpSessions)
            .set({ verified: true })
            .where(eq(otpSessions.id, sessionId));

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
            role: 'investor',
        });

        return NextResponse.json({
            token,
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Investor verify OTP error:', error);
        return NextResponse.json(
            { message: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}

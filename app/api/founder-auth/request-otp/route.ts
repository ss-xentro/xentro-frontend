import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startupSessions, users, startupFounders } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { sendFounderOTP } from '@/server/services/email';

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const lowerEmail = email.toLowerCase();

        // Check if user exists and is a founder
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, lowerEmail))
            .limit(1);

        if (!user || user.accountType !== 'startup') {
            return NextResponse.json(
                { message: 'No founder account found with this email.' },
                { status: 404 }
            );
        }

        // Find associated startup
        const [founderRecord] = await db
            .select()
            .from(startupFounders)
            .where(eq(startupFounders.userId, user.id))
            .limit(1);

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create session
        const [session] = await db
            .insert(startupSessions)
            .values({
                email: lowerEmail,
                otp,
                startupId: founderRecord?.startupId || null,
                expiresAt,
                verified: false,
            })
            .returning();

        // Send OTP via email
        await sendFounderOTP({
            email: lowerEmail,
            name: user.name,
            otp,
        });

        return NextResponse.json({
            sessionId: session.id,
            message: 'OTP sent to your email',
        });
    } catch (error) {
        console.error('Request OTP error:', error);
        return NextResponse.json(
            { message: 'Failed to send OTP. Please try again.' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { institutionSessions, institutionApplications } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { sendInstitutionOTP } from '@/server/services/email';

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

    // Check if there's a verified institution application with this email
    // We use application table because institutions need to complete onboarding first
    const application = await db.query.institutionApplications.findFirst({
      where: eq(institutionApplications.email, email.toLowerCase()),
    });

    if (!application) {
      return NextResponse.json(
        { message: 'No institution found with this email. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    if (!application.verified) {
      return NextResponse.json(
        { message: 'Please verify your email first by clicking the link sent to your inbox.' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('[Request OTP] Generated OTP:', otp, 'for email:', email.toLowerCase());

    // Create session - only set institutionId if application was approved
    const [session] = await db
      .insert(institutionSessions)
      .values({
        email: email.toLowerCase(),
        otp,
        institutionId: application.institutionId || null, // null if not approved yet
        expiresAt,
        verified: false,
      })
      .returning();

    console.log('[Request OTP] Session created:', session.id, 'expires at:', expiresAt);

    // Send OTP via email
    await sendInstitutionOTP({
      email: email.toLowerCase(),
      name: application.name,
      otp,
    });

    console.log('[Request OTP] OTP email sent successfully');

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

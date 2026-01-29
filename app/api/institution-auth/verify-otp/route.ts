import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { institutionSessions, institutionApplications } from '@/db/schemas';
import { eq, and, gt } from 'drizzle-orm';
import { signToken } from '@/server/services/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, otp } = body;

    console.log('[Verify OTP] Request received:', { sessionId, otp });

    if (!sessionId || !otp) {
      console.log('[Verify OTP] Missing sessionId or otp');
      return NextResponse.json(
        { message: 'Session ID and OTP are required' },
        { status: 400 }
      );
    }

    // Find session
    const session = await db.query.institutionSessions.findFirst({
      where: and(
        eq(institutionSessions.id, sessionId),
        eq(institutionSessions.otp, otp),
        gt(institutionSessions.expiresAt, new Date())
      ),
    });

    console.log('[Verify OTP] Session found:', session ? 'Yes' : 'No');

    if (!session) {
      // Check if session exists at all
      const anySession = await db.query.institutionSessions.findFirst({
        where: eq(institutionSessions.id, sessionId),
      });
      
      if (!anySession) {
        console.log('[Verify OTP] Session ID not found in database');
      } else {
        console.log('[Verify OTP] Session found but OTP mismatch or expired', {
          storedOtp: anySession.otp,
          providedOtp: otp,
          expiresAt: anySession.expiresAt,
          now: new Date(),
          expired: anySession.expiresAt <= new Date(),
        });
      }
      
      return NextResponse.json(
        { message: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    if (session.verified) {
      console.log('[Verify OTP] OTP already used');
      return NextResponse.json(
        { message: 'OTP already used' },
        { status: 400 }
      );
    }

    // Mark session as verified
    await db
      .update(institutionSessions)
      .set({ verified: true })
      .where(eq(institutionSessions.id, sessionId));

    console.log('[Verify OTP] Session marked as verified');

    // Look up the application to get the institutionId (which may be set after approval)
    const application = await db.query.institutionApplications.findFirst({
      where: eq(institutionApplications.email, session.email),
    });
    
    if (!application) {
      console.log('[Verify OTP] Application not found for email:', session.email);
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Use the application's institutionId if it exists (set after approval), otherwise use application ID
    const institutionIdForToken = application.institutionId || application.id;
    
    console.log('[Verify OTP] Token will use:', {
      applicationId: application.id,
      approvedInstitutionId: application.institutionId,
      tokenId: institutionIdForToken,
      isApproved: !!application.institutionId,
    });

    // Generate JWT token
    console.log('[Verify OTP] Generating JWT token');
    const token = await signToken({
      institutionId: institutionIdForToken,
      email: session.email,
      type: 'institution',
    });

    console.log('[Verify OTP] Login successful');
    return NextResponse.json({
      token,
      institutionId: institutionIdForToken,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { message: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}

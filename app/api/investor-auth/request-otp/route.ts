import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { otpSessions, users } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/server/services/email';

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

        // Check if user exists and is an investor
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, lowerEmail))
            .limit(1);

        if (!user || user.accountType !== 'investor') {
            return NextResponse.json(
                { message: 'No investor account found with this email. Please sign up first.' },
                { status: 404 }
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in universal otp_sessions table
        const [session] = await db
            .insert(otpSessions)
            .values({
                email: lowerEmail,
                otp,
                purpose: 'login',
                expiresAt,
                verified: false,
            })
            .returning();

        // Send OTP email
        await sendEmail({
            to: lowerEmail,
            subject: 'Your XENTRO Investor Login Code',
            text: `Hi ${user.name},\n\nYour login code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.\n\nBest regards,\nThe XENTRO Team`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 10px;">Investor Login Code</h1>
                        <p style="color: #666; font-size: 14px;">Enter this code to access your XENTRO investor dashboard</p>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
                        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Hi ${user.name},</p>
                        <div style="background: white; border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; display: inline-block;">
                            <p style="color: #8b5cf6; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</p>
                        </div>
                        <p style="color: #999; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes</p>
                    </div>
                    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
                        <p style="color: #92400e; font-size: 13px; margin: 0;">
                            <strong>Security tip:</strong> Never share this code with anyone. XENTRO will never ask for your login code.
                        </p>
                    </div>
                    <div style="text-align: center; color: #999; font-size: 12px;">
                        <p>If you didn't request this code, please ignore this email.</p>
                        <p style="margin-top: 20px;">© ${new Date().getFullYear()} XENTRO. All rights reserved.</p>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({
            sessionId: session.id,
            message: 'OTP sent to your email',
        });
    } catch (error) {
        console.error('Investor request OTP error:', error);
        return NextResponse.json(
            { message: 'Failed to send OTP. Please try again.' },
            { status: 500 }
        );
    }
}

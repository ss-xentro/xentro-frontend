/**
 * POST /api/auth/otp/request
 * 
 * Request OTP for email login (passwordless)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOtpSession } from '@/server/services/unified-auth';
import { sendEmail } from '@/server/services/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const session = await createOtpSession(normalizedEmail, 'login');

    // Send OTP via email
    await sendEmail({
      to: normalizedEmail,
      subject: 'Your XENTRO Login Code',
      text: `Your login code is: ${session.otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 10px;">Your Login Code</h1>
            <p style="color: #666; font-size: 14px;">Enter this code to access your XENTRO account</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; display: inline-block;">
              <p style="color: #8b5cf6; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${session.otp}</p>
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
      success: true,
      message: 'OTP sent to your email',
      // OTP expires in 10 minutes
      expiresInMinutes: 10,
    });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

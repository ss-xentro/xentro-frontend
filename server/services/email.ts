import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

function getEnv(name: string, required = true) {
  const value = process.env[name];
  if (!value && required) throw new Error(`${name} is required for SMTP email`);
  return value;
}

// Load email template
function loadEmailTemplate(templateName: string): string {
  const templatePath = path.join(process.cwd(), 'server', 'templates', `${templateName}.html`);
  return fs.readFileSync(templatePath, 'utf-8');
}

// Replace template variables
function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  Object.entries(variables).forEach(([key, value]) => {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return rendered;
}

const smtpHost = getEnv('SMTP_HOST', false);
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = getEnv('SMTP_USER', false);
const smtpPass = getEnv('SMTP_PASS', false);
const smtpFrom = getEnv('SMTP_FROM', false) ?? 'no-reply@xentro.io';

const transporter = smtpHost
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort || 587,
      secure: Boolean(process.env.SMTP_SECURE === 'true' || (smtpPort && smtpPort === 465)),
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    })
  : null;

async function sendEmail(to: string, subject: string, text: string, html?: string) {
  if (!transporter) {
    console.log('Email (stubbed):', { to, subject, text });
    return;
  }
  await transporter.sendMail({ from: smtpFrom, to, subject, text, html });
}

export async function sendMentorApprovalEmail(params: { email: string; name: string; loginUrl: string }) {
  const subject = 'You are approved as a Xentro Mentor! 🎉';
  const body = `Hey ${params.name},\n\nHurray! Your mentor profile is approved.\n\nJump back in: ${params.loginUrl}\n\nLet’s help more founders together.\n- Xentro Team`;
  await sendEmail(params.email, subject, body);
}

export async function sendInstitutionMagicLink(params: { email: string; name: string; magicLink: string }) {
  const subject = 'Verify Your Email - Complete Your XENTRO Onboarding';
  const text = `Hi ${params.name},\n\nThanks for joining XENTRO! Please verify your email address to complete your institution onboarding:\n${params.magicLink}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe XENTRO Team`;
  
  try {
    // Load and render the email template
    const template = loadEmailTemplate('verify-email');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const currentYear = new Date().getFullYear().toString();
    
    // Use the hosted XENTRO logo from production site
    const logoUrl = process.env.EMAIL_LOGO_URL || 'https://www.xentro.in/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-nobg%20copy.21bfd613.png&w=384&q=75';
    
    const html = renderTemplate(template, {
      name: params.name,
      verificationLink: params.magicLink,
      baseUrl: baseUrl,
      logoUrl: logoUrl,
      year: currentYear
    });
    
    await sendEmail(params.email, subject, text, html);
  } catch (error) {
    // Fallback to simple HTML if template loading fails
    console.error('Failed to load email template, using fallback:', error);
    const html = `<p>Hi ${params.name},</p><p>Thanks for joining XENTRO! Please verify your email address:</p><p><a href="${params.magicLink}" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Verify Email</a></p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br>The XENTRO Team</p>`;
    await sendEmail(params.email, subject, text, html);
  }
}

export async function sendInstitutionOTP(params: { email: string; name: string; otp: string }) {
  const subject = 'Your XENTRO Login Code';
  const text = `Hi ${params.name},\n\nYour login code is: ${params.otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.\n\nBest regards,\nThe XENTRO Team`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 10px;">Your Login Code</h1>
        <p style="color: #666; font-size: 14px;">Enter this code to access your XENTRO dashboard</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Hi ${params.name},</p>
        <div style="background: white; border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; display: inline-block;">
          <p style="color: #8b5cf6; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${params.otp}</p>
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
  `;
  await sendEmail(params.email, subject, text, html);
}

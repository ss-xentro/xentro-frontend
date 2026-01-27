import nodemailer from 'nodemailer';

function getEnv(name: string, required = true) {
  const value = process.env[name];
  if (!value && required) throw new Error(`${name} is required for SMTP email`);
  return value;
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
  const subject = 'Verify your institution submission';
  const text = `Hi ${params.name},\n\nThanks for submitting your institution. Please verify your email using this magic link:\n${params.magicLink}\n\nIf you did not request this, ignore this email.\n- Xentro Team`;
  const html = `<p>Hi ${params.name},</p><p>Thanks for submitting your institution. Please verify your email using this magic link:</p><p><a href="${params.magicLink}">${params.magicLink}</a></p><p>If you did not request this, ignore this email.</p><p>- Xentro Team</p>`;
  await sendEmail(params.email, subject, text, html);
}

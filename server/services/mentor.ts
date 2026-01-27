import { mentorRepository } from '@/server/repositories/mentor.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { sendMentorApprovalEmail } from './email';
import { signJwt, hashPassword } from './auth';

function sanitizeJson(value: unknown) {
  if (value == null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export async function submitMentorApplication(payload: {
  name: string;
  email: string;
  password?: string;
  expertise?: string;
  rate?: number | null;
  occupation?: string;
  packages?: unknown;
  achievements?: unknown;
  availability?: unknown;
}) {
  const email = payload.email.toLowerCase();
  const existingUser = await userRepository.findByEmail(email);

  const user = existingUser ?? (await mentorRepository.createMentorUser({ name: payload.name, email }));

  const passwordHash = payload.password ? await hashPassword(payload.password) : undefined;
  if (payload.password) {
    await userRepository.ensureAuthAccount({
      userId: user.id,
      provider: 'credentials',
      providerAccountId: email,
      passwordHash,
    });
  }

  const profile = await mentorRepository.upsertProfile({
    userId: user.id,
    expertise: payload.expertise ?? null,
    rate: payload.rate != null ? String(payload.rate) : null,
    occupation: payload.occupation ?? null,
    packages: sanitizeJson(payload.packages),
    achievements: sanitizeJson(payload.achievements),
    availability: sanitizeJson(payload.availability),
    status: 'pending',
    verified: false,
  });

  const token = await signJwt({ sub: user.id, email: user.email, role: user.accountType, mentorStatus: profile.status });
  return { user, profile, token };
}

export async function approveMentor(params: { mentorUserId: string; approvedBy: string; loginUrl: string }) {
  const profile = await mentorRepository.upsertProfile({
    userId: params.mentorUserId,
    status: 'approved',
    approvedAt: new Date(),
    rejectedReason: null,
    verified: true,
  });

  const user = await userRepository.findById(params.mentorUserId);
  if (user?.email) {
    await sendMentorApprovalEmail({ email: user.email, name: user.name, loginUrl: params.loginUrl });
  }

  return profile;
}

export async function rejectMentor(params: { mentorUserId: string; reason?: string | null }) {
  const profile = await mentorRepository.upsertProfile({
    userId: params.mentorUserId,
    status: 'rejected',
    rejectedReason: params.reason ?? 'Not approved',
  });
  return profile;
}

export async function getMentorProfile(userId: string) {
  return mentorRepository.findProfileByUserId(userId);
}

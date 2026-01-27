import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { userRepository } from '@/server/repositories/user.repository';
import { authProviderEnum } from '@/db/schemas';
import { hashPassword, verifyPassword } from '@/server/utils/password';

// Re-export for existing imports elsewhere in the codebase
export { hashPassword, verifyPassword };

const JWT_EXPIRY = '7d';
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export async function signJwt(payload: Record<string, unknown>) {
  const secret = new TextEncoder().encode(getEnv('JWT_SECRET'));
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(JWT_EXPIRY).sign(secret);
}

export async function verifyJwt(token: string) {
  const secret = new TextEncoder().encode(getEnv('JWT_SECRET'));
  const { payload } = await jwtVerify(token, secret);
  return payload as Record<string, unknown>;
}

export async function requireAuth(headers: Headers, roles?: Array<string>) {
  const authHeader = headers.get('authorization') || headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.slice('Bearer '.length).trim();
  const payload = await verifyJwt(token);
  if (roles && roles.length && payload.role && !roles.includes(String(payload.role))) {
    throw new Error('Forbidden');
  }
  return payload;
}

function sanitizeInterests(interests: unknown) {
  if (!Array.isArray(interests)) return [] as string[];
  const unique = Array.from(new Set(interests.map((i) => String(i).trim()).filter(Boolean)));
  return unique.slice(0, 15);
}

export async function signupXplorer(params: { name: string; email: string; password: string; interests?: unknown }) {
  const email = params.email.toLowerCase();
  const interests = sanitizeInterests(params.interests);
  const existingUser = await userRepository.findByEmail(email);

  const passwordHash = await hashPassword(params.password);

  const user = existingUser
    ? existingUser
    : await userRepository.createExplorer({ name: params.name, email, interests });

  if (!existingUser && interests.length) {
    await userRepository.updateExplorerInterests(user.id, interests);
  }

  await userRepository.ensureAuthAccount({
    userId: user.id,
    provider: 'credentials',
    providerAccountId: email,
    passwordHash,
  });

  const token = await signJwt({ sub: user.id, email: user.email, role: user.accountType });
  return { user, token };
}

export async function loginXplorerWithPassword(params: { email: string; password: string }) {
  const email = params.email.toLowerCase();
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const auth = await userRepository.findAuthAccount('credentials', email);
  if (!auth || !auth.passwordHash) throw new Error('Password login not configured for this account');

  const ok = await verifyPassword(params.password, auth.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  const token = await signJwt({ sub: user.id, email: user.email, role: user.accountType });
  return { user, token };
}

export async function loginXplorerWithGoogle(idToken: string) {
  const clientId = getEnv('GOOGLE_CLIENT_ID');
  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, { audience: clientId });
  const email = String(payload.email ?? '').toLowerCase();
  if (!email) throw new Error('Google token missing email');
  const name = String(payload.name ?? 'Xplorer');
  const sub = String(payload.sub ?? email);

  const existingUser = await userRepository.findByEmail(email);
  const user = existingUser ?? (await userRepository.createExplorer({ name, email }));

  await userRepository.ensureAuthAccount({
    userId: user.id,
    provider: 'google',
    providerAccountId: sub,
  });

  // If a credentials account exists without google, we still merge by email via shared user record.

  const token = await signJwt({ sub: user.id, email: user.email, role: user.accountType });
  return { user, token };
}

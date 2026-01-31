/**
 * XENTRO Unified Auth Service
 * 
 * Handles:
 * - Base JWT (identity only)
 * - Context JWT (scoped to specific role/entity)
 * - Multiple auth providers (Google, Credentials, OTP)
 * - 2FA for admin roles
 */

import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { db } from '@/db/client';
import * as schema from '@/db/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '@/server/utils/password';
import type { 
  UserContext, 
  BaseJwtPayload, 
  ContextJwtPayload,
  AuthResult,
  UserContextInfo 
} from '@/lib/unified-types';

// ============================================
// CONFIG
// ============================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production'
);

const BASE_JWT_EXPIRY = '24h';      // Base identity token
const CONTEXT_JWT_EXPIRY = '8h';    // Scoped context token
const OTP_EXPIRY_MINUTES = 10;

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

// ============================================
// JWT FUNCTIONS
// ============================================

/**
 * Sign a base JWT (identity only, no context)
 */
export async function signBaseJwt(user: {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  unlockedContexts: UserContext[];
}): Promise<string> {
  const payload: Omit<BaseJwtPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    unlockedContexts: user.unlockedContexts,
  };

  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(BASE_JWT_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Sign a context-scoped JWT
 */
export async function signContextJwt(
  basePayload: BaseJwtPayload,
  context: UserContext,
  contextEntityId?: string,
  contextRole?: string
): Promise<string> {
  const payload: Omit<ContextJwtPayload, 'iat' | 'exp'> = {
    ...basePayload,
    context,
    contextEntityId,
    contextRole,
  };

  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(CONTEXT_JWT_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify any JWT (base or context)
 */
export async function verifyJwt(token: string): Promise<BaseJwtPayload | ContextJwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as BaseJwtPayload | ContextJwtPayload;
}

/**
 * Check if payload has context info
 */
export function isContextPayload(payload: BaseJwtPayload | ContextJwtPayload): payload is ContextJwtPayload {
  return 'context' in payload && payload.context !== undefined;
}

// ============================================
// OTP FUNCTIONS
// ============================================

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and store an OTP session
 */
export async function createOtpSession(
  email: string,
  purpose: 'login' | 'verify_email' | 'reset_password' | 'two_factor'
): Promise<{ otp: string; sessionId: string }> {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const [session] = await db
    .insert(schema.otpSessions)
    .values({
      email: email.toLowerCase(),
      otp,
      purpose,
      expiresAt,
    })
    .returning();

  return { otp, sessionId: session.id };
}

/**
 * Verify an OTP
 */
export async function verifyOtp(
  sessionId: string,
  otp: string,
  purpose: string
): Promise<{ valid: boolean; email?: string; error?: string }> {
  const [session] = await db
    .select()
    .from(schema.otpSessions)
    .where(eq(schema.otpSessions.id, sessionId))
    .limit(1);

  if (!session) {
    return { valid: false, error: 'Invalid session' };
  }

  if (session.verified) {
    return { valid: false, error: 'OTP already used' };
  }

  if (session.purpose !== purpose) {
    return { valid: false, error: 'Invalid OTP purpose' };
  }

  if (new Date() > session.expiresAt) {
    return { valid: false, error: 'OTP expired' };
  }

  if (session.otp !== otp) {
    return { valid: false, error: 'Invalid OTP' };
  }

  // Mark as verified
  await db
    .update(schema.otpSessions)
    .set({ verified: true })
    .where(eq(schema.otpSessions.id, sessionId));

  return { valid: true, email: session.email };
}

// ============================================
// AUTH PROVIDERS
// ============================================

/**
 * Sign up with email and password
 * All users start as Explorer
 */
export async function signupWithCredentials(params: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResult> {
  const email = params.email.toLowerCase();

  // Check if user exists
  const existingUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: 'Email already registered' };
  }

  // Create user with Explorer context unlocked
  const passwordHash = await hashPassword(params.password);
  
  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      name: params.name,
      accountType: 'explorer',
      unlockedContexts: ['explorer'],
      activeContext: 'explorer',
    })
    .returning();

  // Create auth account
  await db
    .insert(schema.authAccounts)
    .values({
      userId: user.id,
      provider: 'credentials',
      providerAccountId: email,
      passwordHash,
    });

  // Create explorer profile
  await db
    .insert(schema.explorerProfiles)
    .values({
      userId: user.id,
    });

  // Generate token
  const token = await signBaseJwt({
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: false,
    unlockedContexts: user.unlockedContexts as UserContext[],
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      unlockedContexts: user.unlockedContexts as UserContext[],
    },
    token,
  };
}

/**
 * Login with email and password
 */
export async function loginWithCredentials(params: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = params.email.toLowerCase();

  // Find user
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  // Find credentials auth account
  const [authAccount] = await db
    .select()
    .from(schema.authAccounts)
    .where(
      and(
        eq(schema.authAccounts.userId, user.id),
        eq(schema.authAccounts.provider, 'credentials')
      )
    )
    .limit(1);

  if (!authAccount || !authAccount.passwordHash) {
    return { success: false, error: 'Password login not set up for this account' };
  }

  // Verify password
  const valid = await verifyPassword(params.password, authAccount.passwordHash);
  if (!valid) {
    return { success: false, error: 'Invalid credentials' };
  }

  // TODO: Add 2FA support when users table has twoFactorEnabled field

  // Update last login
  await db
    .update(schema.users)
    .set({ lastLoginAt: new Date() })
    .where(eq(schema.users.id, user.id));

  // Generate token
  const token = await signBaseJwt({
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified ?? false,
    unlockedContexts: user.unlockedContexts as UserContext[],
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
      unlockedContexts: user.unlockedContexts as UserContext[],
    },
    token,
  };
}

/**
 * Login/Signup with Google OAuth
 */
export async function loginWithGoogle(idToken: string): Promise<AuthResult> {
  try {
    // Verify Google token
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return { success: false, error: 'Google OAuth not configured' };
    }

    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      audience: clientId,
    });

    const email = (payload.email as string)?.toLowerCase();
    const name = payload.name as string || 'User';
    const googleId = payload.sub as string;
    const avatar = payload.picture as string;

    if (!email) {
      return { success: false, error: 'Email not provided by Google' };
    }

    // Check if user exists
    let [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user) {
      // Create new user
      [user] = await db
        .insert(schema.users)
        .values({
          email,
          name,
          avatar,
          accountType: 'explorer',
          unlockedContexts: ['explorer'],
          activeContext: 'explorer',
          emailVerified: true, // Google verifies email
        })
        .returning();

      // Create explorer profile
      await db
        .insert(schema.explorerProfiles)
        .values({
          userId: user.id,
        });
    }

    // Link or update Google auth account
    const [existingAuth] = await db
      .select()
      .from(schema.authAccounts)
      .where(
        and(
          eq(schema.authAccounts.userId, user.id),
          eq(schema.authAccounts.provider, 'google')
        )
      )
      .limit(1);

    if (!existingAuth) {
      await db
        .insert(schema.authAccounts)
        .values({
          userId: user.id,
          provider: 'google',
          providerAccountId: googleId,
        });
    }

    // Update last login
    await db
      .update(schema.users)
      .set({ 
        lastLoginAt: new Date(),
        avatar: avatar || user.avatar,
      })
      .where(eq(schema.users.id, user.id));

    // Generate token
    const token = await signBaseJwt({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified ?? true, // Google verified email
      unlockedContexts: user.unlockedContexts as UserContext[],
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || undefined,
        unlockedContexts: user.unlockedContexts as UserContext[],
      },
      token,
    };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: 'Failed to verify Google token' };
  }
}

/**
 * Login with OTP (passwordless)
 * Can verify with either sessionId + otp OR email + otp
 */
export async function loginWithOtp(params: {
  email?: string;
  sessionId?: string;
  otp: string;
}): Promise<AuthResult> {
  let email: string;
  
  if (params.sessionId) {
    // Verify by session ID
    const result = await verifyOtp(params.sessionId, params.otp, 'login');
    if (!result.valid || !result.email) {
      return { success: false, error: result.error || 'Invalid OTP' };
    }
    email = result.email;
  } else if (params.email) {
    // Verify by email - find the most recent unverified session
    email = params.email.toLowerCase();
    const [session] = await db
      .select()
      .from(schema.otpSessions)
      .where(
        and(
          eq(schema.otpSessions.email, email),
          eq(schema.otpSessions.purpose, 'login'),
          eq(schema.otpSessions.verified, false),
          eq(schema.otpSessions.otp, params.otp)
        )
      )
      .orderBy(schema.otpSessions.createdAt)
      .limit(1);
    
    if (!session) {
      return { success: false, error: 'Invalid OTP' };
    }
    
    if (new Date() > session.expiresAt) {
      return { success: false, error: 'OTP expired' };
    }
    
    // Mark as verified
    await db
      .update(schema.otpSessions)
      .set({ verified: true })
      .where(eq(schema.otpSessions.id, session.id));
  } else {
    return { success: false, error: 'Email or session ID required' };
  }

  // Find or create user
  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (!user) {
    // Create new user with OTP
    [user] = await db
      .insert(schema.users)
      .values({
        email,
        name: email.split('@')[0], // Default name from email
        accountType: 'explorer',
        unlockedContexts: ['explorer'],
        activeContext: 'explorer',
        emailVerified: true, // OTP verifies email
      })
      .returning();

    // Create auth account
    await db
      .insert(schema.authAccounts)
      .values({
        userId: user.id,
        provider: 'otp',
        providerAccountId: email,
      });

    // Create explorer profile
    await db
      .insert(schema.explorerProfiles)
      .values({
        userId: user.id,
      });
  }

  // Update last login
  await db
    .update(schema.users)
    .set({ lastLoginAt: new Date() })
    .where(eq(schema.users.id, user.id));

  // Generate token
  const token = await signBaseJwt({
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified ?? true, // OTP verified email
    unlockedContexts: user.unlockedContexts as UserContext[],
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
      unlockedContexts: user.unlockedContexts as UserContext[],
    },
    token,
  };
}

// ============================================
// CONTEXT SWITCHING
// ============================================

/**
 * Get available contexts for a user
 */
export async function getUserContexts(userId: string): Promise<UserContextInfo[]> {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) {
    return [];
  }

  const contexts: UserContextInfo[] = [];
  const unlockedContexts = user.unlockedContexts as UserContext[];

  // Explorer is always available
  if (unlockedContexts.includes('explorer')) {
    contexts.push({ context: 'explorer' });
  }

  // Check startup memberships
  if (unlockedContexts.includes('startup')) {
    const startupMemberships = await db
      .select({
        startupId: schema.startupMembers.startupId,
        role: schema.startupMembers.role,
        name: schema.startups.name,
      })
      .from(schema.startupMembers)
      .innerJoin(schema.startups, eq(schema.startupMembers.startupId, schema.startups.id))
      .where(
        and(
          eq(schema.startupMembers.userId, userId),
          eq(schema.startupMembers.isActive, true)
        )
      );

    for (const membership of startupMemberships) {
      contexts.push({
        context: 'startup',
        entityId: membership.startupId,
        role: membership.role,
        name: membership.name,
      });
    }
  }

  // Check institution memberships
  if (unlockedContexts.includes('institute')) {
    const institutionMemberships = await db
      .select({
        institutionId: schema.institutionMembers.institutionId,
        role: schema.institutionMembers.role,
        name: schema.institutions.name,
      })
      .from(schema.institutionMembers)
      .innerJoin(schema.institutions, eq(schema.institutionMembers.institutionId, schema.institutions.id))
      .where(
        and(
          eq(schema.institutionMembers.userId, userId),
          eq(schema.institutionMembers.isActive, true)
        )
      );

    for (const membership of institutionMemberships) {
      contexts.push({
        context: 'institute',
        entityId: membership.institutionId,
        role: membership.role,
        name: membership.name,
      });
    }
  }

  // Check mentor status
  if (unlockedContexts.includes('mentor')) {
    const [mentorProfile] = await db
      .select()
      .from(schema.mentorProfiles)
      .where(
        and(
          eq(schema.mentorProfiles.userId, userId),
          eq(schema.mentorProfiles.status, 'approved')
        )
      )
      .limit(1);

    if (mentorProfile) {
      contexts.push({ context: 'mentor' });
    }
  }

  // Check admin status
  if (unlockedContexts.includes('admin')) {
    const [adminProfile] = await db
      .select()
      .from(schema.adminProfiles)
      .where(
        and(
          eq(schema.adminProfiles.userId, userId),
          eq(schema.adminProfiles.isActive, true)
        )
      )
      .limit(1);

    if (adminProfile) {
      contexts.push({
        context: 'admin',
        role: adminProfile.level,
      });
    }
  }

  return contexts;
}

/**
 * Switch to a different context
 * Returns a new scoped JWT
 */
export async function switchContext(
  userId: string,
  basePayload: BaseJwtPayload,
  targetContext: UserContext,
  entityId?: string
): Promise<{ success: boolean; token?: string; contextInfo?: UserContextInfo; error?: string }> {
  // Verify user has access to this context
  const availableContexts = await getUserContexts(userId);
  
  const contextMatch = availableContexts.find(c => {
    if (c.context !== targetContext) return false;
    if (entityId && c.entityId !== entityId) return false;
    return true;
  });

  if (!contextMatch) {
    return { success: false, error: 'You do not have access to this context' };
  }

  // TODO: Add 2FA requirement for admin context when users table supports it

  // Update user's active context
  await db
    .update(schema.users)
    .set({ activeContext: targetContext })
    .where(eq(schema.users.id, userId));

  // Generate context-scoped JWT
  const token = await signContextJwt(
    basePayload,
    targetContext,
    contextMatch.entityId,
    contextMatch.role
  );

  return {
    success: true,
    token,
    contextInfo: contextMatch,
  };
}

// ============================================
// CONTEXT UNLOCKING
// ============================================

/**
 * Unlock a new context for a user
 * Called after form approval
 */
export async function unlockContext(
  userId: string,
  context: UserContext
): Promise<boolean> {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) return false;

  const currentContexts = user.unlockedContexts as UserContext[];
  if (currentContexts.includes(context)) {
    return true; // Already unlocked
  }

  await db
    .update(schema.users)
    .set({
      unlockedContexts: [...currentContexts, context],
    })
    .where(eq(schema.users.id, userId));

  return true;
}

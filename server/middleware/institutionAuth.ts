import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/server/services/auth';
import { db } from '@/db/client';
import { institutions, institutionApplications, institutionMembers } from '@/db/schemas';
import { eq, and } from 'drizzle-orm';
import { sessionCache } from '@/server/services/sessionCache';

export interface InstitutionAuthPayload {
  institutionId: string;
  applicationId?: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'viewer';
  userId?: string;
}

export interface AuthResult {
  success: true;
  payload: InstitutionAuthPayload;
}

export interface AuthError {
  success: false;
  response: NextResponse;
}

/**
 * Verifies institution authentication from request headers
 * Returns the decoded payload or an error response
 */
export async function verifyInstitutionAuth(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('institution_token')?.value;
  
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : cookieToken;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { message: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    };
  }

  try {
    const decoded = await verifyToken(token);
    
    if (!decoded || decoded.type !== 'institution') {
      return {
        success: false,
        response: NextResponse.json(
          { message: 'Invalid token type', code: 'INVALID_TOKEN' },
          { status: 401 }
        ),
      };
    }

    const rawInstitutionId = String(decoded.institutionId || '');
    const email = String(decoded.email || '');
    
    if (!rawInstitutionId && !email) {
      return {
        success: false,
        response: NextResponse.json(
          { message: 'Token missing institution context', code: 'INVALID_TOKEN' },
          { status: 401 }
        ),
      };
    }

    // Check cache first
    const cached = sessionCache.get(token);
    if (cached) {
      return {
        success: true,
        payload: cached,
      };
    }

    // Resolve institution ID - handle backward compatibility
    let institutionId = rawInstitutionId;
    let applicationId: string | undefined;
    
    // Verify the token's institutionId/applicationId belongs to this email
    const appRecord = await db.query.institutionApplications.findFirst({
      where: eq(institutionApplications.email, email),
    });

    if (!appRecord) {
      return {
        success: false,
        response: NextResponse.json(
          { message: 'No application found for this account', code: 'INVALID_SESSION' },
          { status: 403 }
        ),
      };
    }

    // Check if the ID is actually an institution
    const institutionRecord = await db.query.institutions.findFirst({
      where: eq(institutions.id, rawInstitutionId),
    });

    if (institutionRecord) {
      // Verify this institution belongs to this email's application
      if (appRecord.institutionId !== institutionRecord.id) {
        return {
          success: false,
          response: NextResponse.json(
            { message: 'Access denied: Institution does not belong to this account', code: 'FORBIDDEN' },
            { status: 403 }
          ),
        };
      }
      institutionId = institutionRecord.id;
    } else {
      // May be an application ID
      if (appRecord.id !== rawInstitutionId) {
        return {
          success: false,
          response: NextResponse.json(
            { message: 'Access denied: Application does not belong to this account', code: 'FORBIDDEN' },
            { status: 403 }
          ),
        };
      }
      applicationId = appRecord.id;
      institutionId = appRecord.institutionId || '';
    }

    // Default role is owner for the applicant
    let role: 'owner' | 'admin' | 'manager' | 'viewer' = 'owner';
    let userId: string | undefined;

    // Check institution member role if we have a valid institution
    if (institutionId && email) {
      // Find user by email and check membership
      const memberRecord = await db.query.institutionMembers.findFirst({
        where: and(
          eq(institutionMembers.institutionId, institutionId),
          eq(institutionMembers.isActive, true)
        ),
      });
      
      if (memberRecord) {
        role = memberRecord.role;
        userId = memberRecord.userId;
      }
    }

    const sessionPayload = {
      institutionId,
      applicationId,
      email,
      role,
      userId,
    };

    // Cache the session
    sessionCache.set(token, sessionPayload);

    return {
      success: true,
      payload: sessionPayload,
    };
  } catch (error) {
    console.error('[Institution Auth] Token verification failed:', error);
    return {
      success: false,
      response: NextResponse.json(
        { message: 'Invalid or expired token', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Require specific roles for an action
 */
export function requireRole(
  payload: InstitutionAuthPayload,
  allowedRoles: Array<'owner' | 'admin' | 'manager' | 'viewer'>
): AuthError | null {
  if (!allowedRoles.includes(payload.role)) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          message: 'Insufficient permissions', 
          code: 'FORBIDDEN',
          requiredRoles: allowedRoles,
          currentRole: payload.role,
        },
        { status: 403 }
      ),
    };
  }
  return null;
}

/**
 * Verify that the authenticated user has access to a specific institution
 */
export async function verifyInstitutionAccess(
  payload: InstitutionAuthPayload,
  targetInstitutionId: string
): Promise<AuthError | null> {
  // Institution ID must match
  if (payload.institutionId !== targetInstitutionId) {
    return {
      success: false,
      response: NextResponse.json(
        { message: 'Access denied to this institution', code: 'ACCESS_DENIED' },
        { status: 403 }
      ),
    };
  }
  return null;
}

/**
 * Rate limiting helper - returns true if rate limited
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count++;
  return false;
}

/**
 * Create rate limit error response
 */
export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
    { status: 429, headers: { 'Retry-After': '60' } }
  );
}

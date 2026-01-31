/**
 * XENTRO Context-Based RBAC Middleware
 * 
 * Enforces role-based access control based on user context
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, isContextPayload } from '@/server/services/unified-auth';
import type { 
  UserContext, 
  BaseJwtPayload, 
  ContextJwtPayload,
  StartupRole,
  InstituteRole,
  AdminLevel
} from '@/lib/unified-types';
import { ADMIN_LEVEL_PERMISSIONS } from '@/lib/unified-types';

// ============================================
// TYPES
// ============================================

export interface AuthenticatedRequest extends NextRequest {
  user: BaseJwtPayload | ContextJwtPayload;
}

export interface AuthResult {
  success: true;
  user: BaseJwtPayload | ContextJwtPayload;
}

export interface AuthError {
  success: false;
  response: NextResponse;
}

type RequireAuthResult = AuthResult | AuthError;

// ============================================
// HELPERS
// ============================================

/**
 * Extract token from request (NextRequest) or headers (Headers)
 */
function extractToken(requestOrHeaders: NextRequest | Headers): string | null {
  // If it's Headers (from API routes), use headers directly
  if (requestOrHeaders instanceof Headers) {
    const authHeader = requestOrHeaders.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return null;
  }

  // If it's NextRequest, check Authorization header
  const authHeader = requestOrHeaders.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check cookie for NextRequest
  const cookieToken = requestOrHeaders.cookies?.get('auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

function errorResponse(status: number, message: string, code?: string): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      code: code || 'AUTH_ERROR'
    },
    { status }
  );
}

// ============================================
// BASE AUTH
// ============================================

/**
 * Require authentication (any valid token)
 * Works with both NextRequest and Headers
 */
export async function requireAuth(requestOrHeaders: NextRequest | Headers): Promise<RequireAuthResult> {
  const token = extractToken(requestOrHeaders);

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const payload = await verifyJwt(token);
    return { success: true, user: payload };
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

/**
 * Helper to get user info from auth result
 */
export function getUserFromAuth(auth: RequireAuthResult): {
  userId: string;
  email: string;
  name: string;
  context?: UserContext;
  contextEntityId?: string;
  contextRole?: string;
} {
  if (!auth.success) {
    throw new Error('Auth failed');
  }
  
  const payload = auth.user;
  const result: {
    userId: string;
    email: string;
    name: string;
    context?: UserContext;
    contextEntityId?: string;
    contextRole?: string;
  } = {
    userId: payload.sub,
    email: payload.email,
    name: payload.name,
  };

  if (isContextPayload(payload)) {
    result.context = payload.context;
    result.contextEntityId = payload.contextEntityId;
    result.contextRole = payload.contextRole;
  }

  return result;
}

// ============================================
// CONTEXT-BASED AUTH
// ============================================

/**
 * Require a specific context
 */
export async function requireContext(
  requestOrHeaders: NextRequest | Headers,
  allowedContexts: UserContext[]
): Promise<RequireAuthResult> {
  const auth = await requireAuth(requestOrHeaders);
  if (!auth.success) return auth;

  const payload = auth.user;

  // If context token, check the context
  if (isContextPayload(payload)) {
    if (!allowedContexts.includes(payload.context)) {
      return {
        success: false,
        response: errorResponse(403, `This action requires one of: ${allowedContexts.join(', ')}`, 'WRONG_CONTEXT'),
      };
    }
    return { success: true, user: payload };
  }

  // Base token - check if user has any of the required contexts unlocked
  const hasContext = allowedContexts.some(ctx => 
    payload.unlockedContexts.includes(ctx)
  );

  if (!hasContext) {
    return {
      success: false,
      response: errorResponse(403, `You need to unlock one of: ${allowedContexts.join(', ')}`, 'CONTEXT_NOT_UNLOCKED'),
    };
  }

  return { success: true, user: payload };
}

/**
 * Require startup context with specific role
 */
export async function requireStartupRole(
  requestOrHeaders: NextRequest | Headers,
  startupId: string,
  allowedRoles: StartupRole[]
): Promise<RequireAuthResult> {
  const auth = await requireContext(requestOrHeaders, ['startup']);
  if (!auth.success) return auth;

  const payload = auth.user;

  // Must be context token with matching startup
  if (!isContextPayload(payload)) {
    return {
      success: false,
      response: errorResponse(403, 'Please switch to startup context first', 'NO_CONTEXT'),
    };
  }

  if (payload.context !== 'startup' || payload.contextEntityId !== startupId) {
    return {
      success: false,
      response: errorResponse(403, 'You are not in the context of this startup', 'WRONG_STARTUP'),
    };
  }

  // Check role
  const userRole = payload.contextRole as StartupRole;
  if (!allowedRoles.includes(userRole)) {
    return {
      success: false,
      response: errorResponse(403, `This action requires one of: ${allowedRoles.join(', ')}`, 'INSUFFICIENT_ROLE'),
    };
  }

  return { success: true, user: payload };
}

/**
 * Require institution context with specific role
 */
export async function requireInstituteRole(
  requestOrHeaders: NextRequest | Headers,
  institutionId: string,
  allowedRoles: InstituteRole[]
): Promise<RequireAuthResult> {
  const auth = await requireContext(requestOrHeaders, ['institute']);
  if (!auth.success) return auth;

  const payload = auth.user;

  if (!isContextPayload(payload)) {
    return {
      success: false,
      response: errorResponse(403, 'Please switch to institution context first', 'NO_CONTEXT'),
    };
  }

  if (payload.context !== 'institute' || payload.contextEntityId !== institutionId) {
    return {
      success: false,
      response: errorResponse(403, 'You are not in the context of this institution', 'WRONG_INSTITUTION'),
    };
  }

  const userRole = payload.contextRole as InstituteRole;
  if (!allowedRoles.includes(userRole)) {
    return {
      success: false,
      response: errorResponse(403, `This action requires one of: ${allowedRoles.join(', ')}`, 'INSUFFICIENT_ROLE'),
    };
  }

  return { success: true, user: payload };
}

/**
 * Require admin context with specific level
 */
export async function requireAdminLevel(
  requestOrHeaders: NextRequest | Headers,
  minLevel: AdminLevel
): Promise<RequireAuthResult> {
  const auth = await requireContext(requestOrHeaders, ['admin']);
  if (!auth.success) return auth;

  const payload = auth.user;

  if (!isContextPayload(payload)) {
    return {
      success: false,
      response: errorResponse(403, 'Please switch to admin context first', 'NO_CONTEXT'),
    };
  }

  if (payload.context !== 'admin') {
    return {
      success: false,
      response: errorResponse(403, 'Admin access required', 'NOT_ADMIN'),
    };
  }

  const userLevel = payload.contextRole as AdminLevel;
  const levelOrder: AdminLevel[] = ['L1', 'L2', 'L3'];
  const userLevelIndex = levelOrder.indexOf(userLevel);
  const requiredLevelIndex = levelOrder.indexOf(minLevel);

  if (userLevelIndex < requiredLevelIndex) {
    return {
      success: false,
      response: errorResponse(403, `This action requires ${minLevel} or higher`, 'INSUFFICIENT_LEVEL'),
    };
  }

  return { success: true, user: payload };
}

/**
 * Require admin with specific permission
 */
export async function requireAdminPermission(
  requestOrHeaders: NextRequest | Headers,
  permission: string
): Promise<RequireAuthResult> {
  const auth = await requireContext(requestOrHeaders, ['admin']);
  if (!auth.success) return auth;

  const payload = auth.user;

  if (!isContextPayload(payload) || payload.context !== 'admin') {
    return {
      success: false,
      response: errorResponse(403, 'Admin access required', 'NOT_ADMIN'),
    };
  }

  const userLevel = payload.contextRole as AdminLevel;
  const permissions = ADMIN_LEVEL_PERMISSIONS[userLevel] || [];

  if (!permissions.includes(permission)) {
    return {
      success: false,
      response: errorResponse(403, `You don't have permission: ${permission}`, 'NO_PERMISSION'),
    };
  }

  return { success: true, user: payload };
}

/**
 * Require mentor context (approved)
 */
export async function requireMentor(requestOrHeaders: NextRequest | Headers): Promise<RequireAuthResult> {
  const auth = await requireContext(requestOrHeaders, ['mentor']);
  if (!auth.success) return auth;

  const payload = auth.user;

  if (isContextPayload(payload) && payload.context === 'mentor') {
    return { success: true, user: payload };
  }

  // If base token with mentor unlocked, they've been approved
  if (payload.unlockedContexts.includes('mentor')) {
    return { success: true, user: payload };
  }

  return {
    success: false,
    response: errorResponse(403, 'Mentor access required', 'NOT_MENTOR'),
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get user ID from auth result
 */
export function getUserId(auth: AuthResult): string {
  return auth.user.sub;
}

/**
 * Get current context from auth result
 */
export function getCurrentContext(auth: AuthResult): UserContext | null {
  if (isContextPayload(auth.user)) {
    return auth.user.context;
  }
  return null;
}

/**
 * Get context entity ID from auth result
 */
export function getContextEntityId(auth: AuthResult): string | undefined {
  if (isContextPayload(auth.user)) {
    return auth.user.contextEntityId;
  }
  return undefined;
}

/**
 * Check if user owns or is member of entity
 */
export function isOwnerOrMember(
  auth: AuthResult,
  entityType: 'startup' | 'institute',
  entityId: string
): boolean {
  if (!isContextPayload(auth.user)) return false;
  
  const contextMap = { startup: 'startup', institute: 'institute' };
  return (
    auth.user.context === contextMap[entityType] &&
    auth.user.contextEntityId === entityId
  );
}

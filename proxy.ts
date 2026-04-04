import { NextRequest, NextResponse } from 'next/server';

// ── Auth cookie name (set by AuthContext on login) ──
const AUTH_COOKIE = 'xentro_auth';

// Security headers for all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' https: data: blob:",
    "connect-src 'self' https://accounts.google.com https://*.sentry.io wss:",
    "frame-src https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

// Defense-in-depth rate limiting (per Next.js process).
// IMPORTANT: This is an early-return optimisation, NOT the authoritative rate limit.
// For multi-instance deployments this store is per-process — an attacker hitting
// different instances sees independent counters.
// Authoritative rate limits for security-critical paths are enforced at the Django
// layer (see apps/core/middleware/throttle.py and @rate_limit decorators on auth views).
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest): string {
  // Prefer IPs set server-side at the network/proxy layer (not spoofable by clients).
  // request.ip — populated by Next.js/Vercel from the actual TCP connection.
  // x-real-ip  — set by nginx's real_ip module from the connection, not from headers.
  // x-forwarded-for last entry — appended by our own reverse proxy (nginx), not the client.
  const xForwardedFor = request.headers.get('x-forwarded-for') ?? '';
  const ip =
    (request as NextRequest & { ip?: string }).ip ??
    request.headers.get('x-real-ip') ??
    (xForwardedFor ? xForwardedFor.split(',').pop()?.trim() : undefined) ??
    'unknown';
  return `${ip}:${request.nextUrl.pathname}`;
}

function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) rateLimitStore.delete(k);
    }
  }

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

// Rate limits by route pattern
const rateLimits: Record<string, { max: number; window: number }> = {
  '/api/auth/otp/send/': { max: 5, window: 60000 },
  '/api/auth/otp/verify/': { max: 10, window: 60000 },
  '/api/media': { max: 20, window: 60000 },
  'default': { max: 100, window: 60000 },
};

// ── Auth route definitions ──

/** Routes that require ANY authenticated user */
const AUTH_REQUIRED_PREFIXES = ['/notifications', '/profile'];

/** Role → allowed dashboard prefixes */
const ROLE_ROUTE_MAP: Record<string, string[]> = {
  admin: ['/admin/dashboard'],
  startup: ['/dashboard'],
  founder: ['/dashboard'],
  mentor: ['/mentor-dashboard', '/mentor/onboarding'],
  institution: ['/institution-dashboard', '/institution-edit'],
  // investor hidden for v1 — re-enable in v2
};

/** Routes that guests should access; logged-in users get redirected away */
const GUEST_ONLY_ROUTES = ['/join', '/login', '/admin/login'];

/** Prefixes that skip auth checks entirely */
const PUBLIC_PREFIXES = [
  '/api', '/assets', '/_next', '/favicon', '/xentro-logo',
  '/onboarding', '/mentor-signup', '/mentor-login',
  '/institution-login', '/institution-onboarding',
  '/explore', '/startups', '/institutions', '/events', '/search',
  '/feed', // feed is public/hidden for v1 — let it pass through
];

function parseCookie(cookieValue: string): { role: string; contexts: string[]; startupOnboarded?: boolean; mentorOnboarded?: boolean } | null {
  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return null;
  }
}

/**
 * Check auth rules and return a redirect response if access is denied,
 * or null if the request should proceed normally.
 */
function checkAuth(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Skip public/static routes
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  // Read auth cookie
  const authCookie = request.cookies.get(AUTH_COOKIE)?.value;
  const auth = authCookie ? parseCookie(authCookie) : null;
  const isLoggedIn = !!auth?.role;

  const isStartupUser = auth?.role === 'startup' || auth?.role === 'founder';
  const onboardingOnlyPath = pathname === '/startup/onboarding' || pathname.startsWith('/startup/onboarding/');
  const legacyOnboardingPath = pathname === '/onboarding/startup' || pathname.startsWith('/onboarding/startup/');
  const isMentorUser = auth?.role === 'mentor';
  const mentorOnboardingPath = pathname === '/mentor/onboarding' || pathname.startsWith('/mentor/onboarding/');

  // Startup users with incomplete onboarding can only access onboarding.
  if (isLoggedIn && isStartupUser && auth?.startupOnboarded === false && !onboardingOnlyPath && !legacyOnboardingPath) {
    return NextResponse.redirect(new URL('/startup/onboarding', request.url));
  }

  if (isLoggedIn && isMentorUser && auth?.mentorOnboarded === false && !mentorOnboardingPath) {
    return NextResponse.redirect(new URL('/mentor/onboarding', request.url));
  }

  // Guest-only routes: redirect logged-in users to /home
  if (isLoggedIn && GUEST_ONLY_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    if (pathname.startsWith('/admin/login') && auth?.role === 'admin') return null;
    return NextResponse.redirect(new URL('/explore/institute', request.url));
  }

  // Auth-required routes
  if (AUTH_REQUIRED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', request.url));
    return null;
  }

  // Role-specific dashboard routes
  for (const [role, prefixes] of Object.entries(ROLE_ROUTE_MAP)) {
    for (const prefix of prefixes) {
      if (pathname === prefix || pathname.startsWith(prefix + '/')) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', request.url));

        const userRole = auth!.role;
        const contexts = auth!.contexts || [];

        // Admin can access everything
        if (userRole === 'admin') return null;

        // Direct role match
        if (userRole === role) return null;

        // founder/startup interchangeable
        if (
          (role === 'startup' || role === 'founder') &&
          (userRole === 'startup' || userRole === 'founder')
        ) return null;

        // Unlocked contexts
        const contextName = role === 'founder' ? 'startup' : role;
        if (contexts.includes(contextName)) return null;

        // No access
        return NextResponse.redirect(new URL('/explore/institute', request.url));
      }
    }
  }

  return null; // pass through
}

export async function proxy(request: NextRequest) {
  const start = performance.now();
  const pathname = request.nextUrl.pathname;

  // ── Auth check (redirects if access denied) ──
  const authResponse = checkAuth(request);
  if (authResponse) return authResponse;

  // Apply rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitConfig = rateLimits[pathname] || rateLimits['default'];
    const key = getRateLimitKey(request);

    if (isRateLimited(key, rateLimitConfig.max, rateLimitConfig.window)) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: {
            ...securityHeaders,
            'Retry-After': '60',
          }
        }
      );
    }
  }

  const response = NextResponse.next();

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Performance timing
  const duration = performance.now() - start;
  response.headers.set('x-response-time', `${duration.toFixed(2)}ms`);

  // Only log in development or for slow requests
  if (process.env.NODE_ENV === 'development' || duration > 100) {
    console.info(`[proxy] ${request.method} ${pathname} - ${duration.toFixed(2)}ms`);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

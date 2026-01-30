import { NextRequest, NextResponse } from 'next/server';

// Security headers for all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
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

// Protected routes that require authentication
const protectedPatterns = [
  /^\/institution-dashboard/,
  /^\/institution-edit/,
  /^\/api\/startups$/,
  /^\/api\/startups\/.+/,
  /^\/api\/programs$/,
  /^\/api\/institution-team/,
];

// Rate limits by route pattern
const rateLimits: Record<string, { max: number; window: number }> = {
  '/api/institution-auth/request-otp': { max: 5, window: 60000 }, // 5 per minute
  '/api/institution-auth/verify-otp': { max: 10, window: 60000 }, // 10 per minute
  '/api/media': { max: 20, window: 60000 }, // 20 uploads per minute
  'default': { max: 100, window: 60000 }, // 100 requests per minute default
};

export function middleware(request: NextRequest) {
  const start = performance.now();
  const pathname = request.nextUrl.pathname;

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

  // Check for protected routes - client-side auth check
  // Note: Actual token verification happens in API routes
  const isProtected = protectedPatterns.some(pattern => pattern.test(pathname));
  
  if (isProtected && pathname.startsWith('/institution-')) {
    // For page routes, we let them through and handle auth client-side
    // The page will redirect to login if no token
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
    console.info(`[middleware] ${request.method} ${pathname} - ${duration.toFixed(2)}ms`);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — runs on the edge before every matched route.
 *
 * Reads the `xentro_auth` cookie (set by AuthContext on login) to determine
 * authentication status and user role, then enforces:
 *   1. Protected routes require authentication
 *   2. Role-specific dashboards require the correct role
 *   3. Logged-in users accessing /guest or /join are redirected to /home
 */

// ── Cookie name (must match what AuthContext sets) ──
const AUTH_COOKIE = 'xentro_auth';

// ── Route definitions ──

/** Routes that require ANY authenticated user */
const AUTH_REQUIRED_PREFIXES = [
	'/home',
	'/feed',
	'/notifications',
	'/profile',
];

/** Role → allowed dashboard prefixes */
const ROLE_ROUTE_MAP: Record<string, string[]> = {
	admin: ['/admin/dashboard'],
	startup: ['/dashboard'],
	founder: ['/dashboard'],
	mentor: ['/mentor-dashboard'],
	institution: ['/institution-dashboard', '/institution-edit'],
	investor: ['/investor-dashboard'],
};

/** Routes that guests (unauthenticated) should access; logged-in users get redirected away */
const GUEST_ONLY_ROUTES = ['/guest', '/join', '/login', '/admin/login'];

/** Public routes — no auth needed, no redirect for logged-in users */
const PUBLIC_PREFIXES = [
	'/api',
	'/assets',
	'/_next',
	'/favicon',
	'/xentro-logo',
	'/onboarding',
	'/mentor-signup',
	'/mentor-login',
	'/investor-login',
	'/investor-onboarding',
	'/institution-login',
	'/institution-onboarding',
	'/explore',
	'/startups',
	'/institutions',
	'/events',
	'/search',
];

function parseCookie(cookieValue: string): { role: string; contexts: string[] } | null {
	try {
		const decoded = decodeURIComponent(cookieValue);
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip public/static routes
	if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
		return NextResponse.next();
	}

	// Read auth cookie
	const authCookie = request.cookies.get(AUTH_COOKIE)?.value;
	const auth = authCookie ? parseCookie(authCookie) : null;
	const isLoggedIn = !!auth?.role;

	// ── Guest-only routes: redirect logged-in users to /home ──
	if (isLoggedIn && GUEST_ONLY_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
		// Exception: allow /admin/login for admins (they might need to re-auth)
		if (pathname.startsWith('/admin/login') && auth?.role === 'admin') {
			return NextResponse.next();
		}
		return NextResponse.redirect(new URL('/home', request.url));
	}

	// ── Auth-required routes ──
	if (AUTH_REQUIRED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
		if (!isLoggedIn) {
			return NextResponse.redirect(new URL('/guest', request.url));
		}
		return NextResponse.next();
	}

	// ── Role-specific dashboard routes ──
	for (const [role, prefixes] of Object.entries(ROLE_ROUTE_MAP)) {
		for (const prefix of prefixes) {
			if (pathname === prefix || pathname.startsWith(prefix + '/')) {
				// Must be logged in
				if (!isLoggedIn) {
					return NextResponse.redirect(new URL('/login', request.url));
				}

				// Check role match or unlocked context
				const userRole = auth!.role;
				const contexts = auth!.contexts || [];

				// Admin can access everything
				if (userRole === 'admin') {
					return NextResponse.next();
				}

				// Direct role match
				if (userRole === role) {
					return NextResponse.next();
				}

				// founder/startup are interchangeable for /dashboard
				if (
					(role === 'startup' || role === 'founder') &&
					(userRole === 'startup' || userRole === 'founder')
				) {
					return NextResponse.next();
				}

				// Check unlocked contexts
				const contextName = role === 'founder' ? 'startup' : role;
				if (contexts.includes(contextName)) {
					return NextResponse.next();
				}

				// No access — redirect to feed
				return NextResponse.redirect(new URL('/feed', request.url));
			}
		}
	}

	// Everything else — pass through
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico
		 * - public files (images, etc.)
		 */
		'/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
	],
};

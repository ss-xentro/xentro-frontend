import { NextRequest, NextResponse } from 'next/server';

const TOKEN_COOKIE = 'xentro_token';
const FIVE_DAYS = 5 * 24 * 60 * 60;

/**
 * POST /api/auth/session — Store the JWT in an HttpOnly cookie.
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
	try {
		const { token } = await request.json();
		if (!token || typeof token !== 'string') {
			return NextResponse.json({ error: 'Token is required' }, { status: 400 });
		}

		const response = NextResponse.json({ ok: true });
		response.cookies.set(TOKEN_COOKIE, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: FIVE_DAYS,
		});

		return response;
	} catch {
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}
}

/**
 * DELETE /api/auth/session — Clear the HttpOnly token cookie.
 */
export async function DELETE() {
	const response = NextResponse.json({ ok: true });
	response.cookies.set(TOKEN_COOKIE, '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	});
	return response;
}

/**
 * GET /api/auth/session — Check if a valid session cookie exists (no token exposed).
 */
export async function GET(request: NextRequest) {
	const token = request.cookies.get(TOKEN_COOKIE)?.value;
	return NextResponse.json({ authenticated: !!token });
}

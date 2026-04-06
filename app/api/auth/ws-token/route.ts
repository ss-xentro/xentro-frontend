import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/ws-token
 * Returns the JWT stored in the HttpOnly cookie so client-side code
 * can use it for WebSocket first-message authentication.
 *
 * This is intentionally not HttpOnly — WebSocket connections cannot
 * automatically send cookies across origins (Django on :8000, Next on :3000).
 */
export async function GET(request: NextRequest) {
	const token = request.cookies.get('xentro_token')?.value;
	if (!token) {
		return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
	}
	return NextResponse.json({ token });
}

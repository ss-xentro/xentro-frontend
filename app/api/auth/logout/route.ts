/**
 * POST /api/auth/logout
 * 
 * Logout user (clear cookies)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Clear auth cookies
  response.cookies.delete('auth_token');
  response.cookies.delete('context_token');

  return response;
}

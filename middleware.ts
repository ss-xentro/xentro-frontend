import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const start = performance.now();
  const response = NextResponse.next();
  const duration = performance.now() - start;

  response.headers.set('x-response-time', `${duration.toFixed(2)}ms`);
  console.info(`[middleware] ${request.method} ${request.nextUrl.pathname} - ${duration.toFixed(2)}ms`);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

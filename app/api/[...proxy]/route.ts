import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return handleProxy(request);
}

export async function POST(request: NextRequest) {
  return handleProxy(request);
}

export async function PUT(request: NextRequest) {
  return handleProxy(request);
}

export async function PATCH(request: NextRequest) {
  return handleProxy(request);
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request);
}

async function handleProxy(request: NextRequest) {
  const url = new URL(request.url);
  const method = request.method;

  // All requests go to Django — strip quotes that Docker env_file may include
  const rawUrl = process.env.DJANGO_API_URL || 'http://localhost:8000';
  const DJANGO_URL = rawUrl.replace(/^["']|["']$/g, '').trim();

  // Django requires trailing slashes
  let pathname = url.pathname;
  if (!pathname.endsWith('/')) {
    pathname += '/';
  }

  const targetUrl = `${DJANGO_URL}${pathname}${url.search}`;
  console.log(`[API Proxy] ${method} ${pathname} → ${targetUrl}`);

  // Extract headers — remove hop-by-hop headers that must not be forwarded
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('upgrade');
  headers.delete('keep-alive');
  headers.delete('transfer-encoding');
  headers.delete('te');
  headers.delete('proxy-authorization');
  headers.delete('proxy-connection');

  // Extract body for mutation requests
  let body: ReadableStream | string | null = null;
  let duplex: 'half' | undefined = undefined;

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // Stream the body directly instead of buffering it into memory
    // This prevents 502 Bad Gateway errors on large uploads
    body = request.body;
    duplex = 'half';
  }

  // Proxy fetch to Django
  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      // @ts-expect-error duplex is required in Node.js for streaming requests
      duplex,
      redirect: 'manual',
      cache: 'no-store'
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    console.error(`[API Gateway Error] ${method} ${targetUrl} failed:`, error);
    return NextResponse.json(
      { error: 'API Gateway Timeout or Connection Refused', target: targetUrl, details: String(error) },
      { status: 502 }
    );
  }
}

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

  // All requests go to Django (port 8000)
  const DJANGO_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

  // Django requires trailing slashes
  let pathname = url.pathname;
  if (!pathname.endsWith('/')) {
    pathname += '/';
  }

  const targetUrl = `${DJANGO_URL}${pathname}${url.search}`;

  // Extract headers
  const headers = new Headers(request.headers);
  headers.delete('host');

  // Extract body for mutation requests
  let body = null;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      try {
        body = await request.blob();
      } catch (e) {
        body = await request.arrayBuffer();
      }
    } else {
      const text = await request.text();
      if (text) {
        body = text;
      }
    }
  }

  // Proxy fetch to Django
  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
      cache: 'no-store'
    });

    const responseData = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    console.error(`[API Gateway Error] Proxy to Django failed:`, error);
    return NextResponse.json(
      { error: 'API Gateway Timeout or Connection Refused', details: String(error) },
      { status: 502 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return handleProxy(request);
}

export async function POST(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return handleProxy(request);
}

export async function PUT(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return handleProxy(request);
}

export async function PATCH(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return handleProxy(request);
}

export async function DELETE(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return handleProxy(request);
}

async function handleProxy(request: NextRequest) {
  const url = new URL(request.url);
  const method = request.method;

  // 1. Determine the target port
  // GET requests go to Go Fiber (8080). Mutations go to Django (8000).
  const targetPort = method === 'GET' ? '8080' : '8000';
  const targetUrl = `http://localhost:${targetPort}${url.pathname}${url.search}`;

  // 2. Extract headers
  const headers = new Headers(request.headers);
  // Remove host header to avoid conflicts with destination server
  headers.delete('host');

  // 3. Extract body
  let body = null;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // Read body as text or buffer depending on content type
    // The easiest way to proxy safely in Edge/Node is arrayBuffer
    const contentType = request.headers.get('content-type') || '';

    // If it's a multipart form (e.g. file upload), we just pass the request along natively
    if (contentType.includes('multipart/form-data')) {
      try {
        // Must read as formData explicitly if we strictly pass it, or just use blob
        body = await request.blob();
      } catch (e) {
        // Fallback
        body = await request.arrayBuffer();
      }
    } else {
      // JSON or text
      const text = await request.text();
      if (text) {
        body = text;
      }
    }
  }

  // 4. Perform proxy fetch
  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      // Keep redirect manual so we don't accidentally follow them blindly
      redirect: 'manual',
      // Disable native caching for the proxy layer
      cache: 'no-store'
    });

    // 5. Construct Next.js Response
    const responseData = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);

    // Next.js handles these encoding headers automatically,
    // passing them from the proxy can break compression
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    console.error(`[API Gateway Error] Proxy to ${targetPort} failed:`, error);
    return NextResponse.json(
      { error: 'API Gateway Timeout or Connection Refused', details: String(error) },
      { status: 502 }
    );
  }
}

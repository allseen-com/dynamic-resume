import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
      return NextResponse.json(
        { success: false, error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    // Block potentially dangerous domains
    const blockedDomains = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '10.',
      '192.168.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.'
    ];

    const hostname = validatedUrl.hostname.toLowerCase();
    for (const blocked of blockedDomains) {
      if (hostname.includes(blocked)) {
        return NextResponse.json(
          { success: false, error: 'Access to this domain is not allowed' },
          { status: 403 }
        );
      }
    }

    // Fetch content with timeout and size limits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `HTTP ${response.status}: ${response.statusText}` },
          { status: response.status }
        );
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        return NextResponse.json(
          { success: false, error: 'URL does not return HTML content' },
          { status: 400 }
        );
      }

      // Check content length
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 1000000) { // 1MB limit
        return NextResponse.json(
          { success: false, error: 'Content too large (max 1MB)' },
          { status: 413 }
        );
      }

      // Read content with size limit
      const reader = response.body?.getReader();
      if (!reader) {
        return NextResponse.json(
          { success: false, error: 'Unable to read response body' },
          { status: 500 }
        );
      }

      const chunks: Uint8Array[] = [];
      let totalSize = 0;
      const maxSize = 1000000; // 1MB limit

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          totalSize += value.length;
          if (totalSize > maxSize) {
            return NextResponse.json(
              { success: false, error: 'Content too large (max 1MB)' },
              { status: 413 }
            );
          }

          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }

      // Combine chunks and decode
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const content = new TextDecoder().decode(combined);

      return NextResponse.json({
        success: true,
        content,
        metadata: {
          url,
          contentType,
          contentLength: totalSize,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout (10 seconds)' },
          { status: 408 }
        );
      }

      throw error;
    }

  } catch (error) {
    console.error('URL extraction error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 
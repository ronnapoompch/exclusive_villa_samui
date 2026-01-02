/**
 * CORS Configuration Middleware
 * Phase 1.6 - Security Hardening
 * 
 * Implements whitelist-based CORS protection for API routes.
 * Only allows requests from configured trusted origins.
 */

/**
 * Allowed origins for CORS
 * Add your production domains here before deployment
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Production domains (uncomment when ready):
  // 'https://exclusive-villa-samui.com',
  // 'https://www.exclusive-villa-samui.com',
];

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Get CORS headers for allowed origin
 */
export function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * Handle CORS preflight (OPTIONS) request
 */
export function handleCorsPreflightRequest(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    
    if (!isOriginAllowed(origin)) {
      return new Response('Forbidden', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  return null;
}

/**
 * Validate request origin
 * Returns error response if origin is not allowed
 */
export function validateOrigin(request: Request): Response | null {
  const origin = request.headers.get('origin');
  
  // Skip validation for same-origin requests (no origin header)
  if (!origin) return null;
  
  if (!isOriginAllowed(origin)) {
    console.warn(`🚫 CORS Violation: Blocked request from ${origin}`);
    return new Response(
      JSON.stringify({ 
        error: 'Forbidden',
        message: 'Origin not allowed'
      }), 
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return null;
}

/**
 * Wrapper function to apply CORS to API route handler
 * 
 * Usage:
 * ```typescript
 * export async function POST(request: Request) {
 *   return withCors(request, async (req) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   });
 * }
 * ```
 */
export async function withCors(
  request: Request,
  handler: (request: Request) => Promise<Response>
): Promise<Response> {
  // Handle preflight
  const preflightResponse = handleCorsPreflightRequest(request);
  if (preflightResponse) return preflightResponse;

  // Validate origin
  const originError = validateOrigin(request);
  if (originError) return originError;

  // Execute handler
  const response = await handler(request);

  // Add CORS headers to response
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value as string);
  });

  return response;
}

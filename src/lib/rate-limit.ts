/**
 * Rate Limiting Middleware
 * Phase 1.7 - Security Hardening
 * 
 * Implements rate limiting using Upstash Redis to prevent:
 * - DDoS attacks
 * - Brute force attacks
 * - API abuse
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Initialize Redis client
 * Uses Upstash Redis for serverless-friendly rate limiting
 */
const redis = Redis.fromEnv();

/**
 * Rate limit configurations for different endpoint types
 */

/**
 * Payment endpoints (create-intent)
 * Strict limit: 10 requests per 10 seconds per IP
 * Prevents payment spam and potential fraud
 */
export const paymentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@ratelimit/payment',
});

/**
 * Authentication endpoints (login, register)
 * Very strict: 5 requests per minute per IP
 * Prevents brute force password attacks
 */
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: '@ratelimit/auth',
});

/**
 * Admin endpoints
 * Moderate limit: 20 requests per minute per user
 * Allows normal admin operations while preventing abuse
 */
export const adminRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: '@ratelimit/admin',
});

/**
 * General API endpoints
 * Relaxed limit: 50 requests per minute per IP
 * For non-critical read operations
 */
export const generalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 m'),
  analytics: true,
  prefix: '@ratelimit/general',
});

/**
 * Get identifier for rate limiting
 * Uses IP address from request headers
 */
export function getIdentifier(request: Request): string {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  // Use first available IP
  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'anonymous';
  
  return ip.trim();
}

/**
 * Check rate limit and return response if exceeded
 * 
 * @param ratelimit - The rate limit instance to check
 * @param identifier - Unique identifier (usually IP address)
 * @returns Response if rate limit exceeded, null otherwise
 */
export async function checkRateLimit(
  ratelimit: Ratelimit,
  identifier: string
): Promise<Response | null> {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    const resetDate = new Date(reset);
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);

    console.warn(`⚠️ Rate limit exceeded for ${identifier}`, {
      limit,
      remaining,
      reset: resetDate.toISOString(),
      retryAfter,
    });

    return new Response(
      JSON.stringify({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter,
        limit,
        reset: resetDate.toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  // Success - add rate limit headers to inform client
  return null; // Will be added to response in withRateLimit wrapper
}

/**
 * Rate limit headers for successful requests
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
}

/**
 * Wrapper function to apply rate limiting to API route handler
 * 
 * Usage:
 * ```typescript
 * export async function POST(request: Request) {
 *   return withRateLimit(request, paymentRateLimit, async (req) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   });
 * }
 * ```
 */
export async function withRateLimit(
  request: Request,
  ratelimit: Ratelimit,
  handler: (request: Request) => Promise<Response>
): Promise<Response> {
  const identifier = getIdentifier(request);

  // Check rate limit
  const rateLimitResponse = await checkRateLimit(ratelimit, identifier);
  if (rateLimitResponse) return rateLimitResponse;

  // Execute handler
  const response = await handler(request);

  // Add rate limit headers to successful response
  const { limit, remaining, reset } = await ratelimit.limit(identifier);
  const headers = getRateLimitHeaders(limit, remaining, reset);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

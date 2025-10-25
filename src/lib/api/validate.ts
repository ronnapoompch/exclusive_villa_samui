import { z } from 'zod'
import type { NextRequest } from 'next/server'

/**
 * API validation utilities following security-rules.md input validation patterns
 */

export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: z.ZodError
}

/**
 * Validate request data against Zod schema
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}

/**
 * Extract client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Check headers in order of priority
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim()
  }
  
  return 'unknown'
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined
}

/**
 * Rate limiting helper (basic implementation)
 * In production, replace with Redis-based solution
 */
export function isRateLimited(ip: string): boolean {
  // TODO: Implement proper rate limiting with Redis or similar store
  // For development, rate limiting is disabled
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Rate limit check for IP: ${ip}`)
  }
  return false
}

/**
 * Validate API key (if using API key authentication)
 */
export function validateAPIKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const validAPIKey = process.env.API_SECRET_KEY
  
  if (!validAPIKey) return true // No API key required
  
  return apiKey === validAPIKey
}
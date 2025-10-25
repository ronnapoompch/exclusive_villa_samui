import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/auth/verification'
import { auditLog } from '@/lib/audit/audit-log'
import { getClientIP, getUserAgent } from '@/lib/api/validate'

/**
 * GET /api/v1/auth/verify-email?token=...
 * Email verification endpoint following security-rules.md patterns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: { message: 'Verification token is required' }
        },
        { status: 400 }
      )
    }

    // Verify email using the token
    const result = await verifyEmailToken(token)

    // Audit log
    await auditLog({
      action: result.isValid ? 'email.verify.success' : 'email.verify.failed',
      entityType: 'VERIFICATION_TOKEN',
      entityId: token,
      userId: result.userId,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { 
        success: result.isValid,
        error: result.isValid ? undefined : 'Invalid or expired token'
      }
    })

    if (!result.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: { message: 'Invalid or expired token' }
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        userId: result.userId
      }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: { message: 'Internal server error during email verification' }
      },
      { status: 500 }
    )
  }
}
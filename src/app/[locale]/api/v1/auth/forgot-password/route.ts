import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { generatePasswordResetToken } from '@/lib/auth/verification'
import { sendPasswordResetEmail } from '@/services/email.service'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { validateRequest, getClientIP, getUserAgent } from '@/lib/api/validate'
import { auditLog } from '@/lib/audit/audit-log'

/**
 * POST /api/v1/auth/forgot-password
 * Password reset request endpoint following security-rules.md patterns
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json()
    const validation = await validateRequest(forgotPasswordSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: { 
            message: 'Validation failed',
            details: validation.error?.issues
          }
        },
        { status: 400 }
      )
    }

    const { email } = validation.data!

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        active: true
      }
    })

    // Always return success response to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account with this email exists, a password reset link will be sent.'
    }

    if (!user || !user.active) {
      // Audit failed attempt
      await auditLog({
        action: 'password.reset.requested.notfound',
        entityType: 'USER',
        entityId: 'anonymous',
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { 
          email,
          reason: !user ? 'user_not_found' : 'user_inactive'
        }
      })

      // Return success to prevent enumeration
      return NextResponse.json(successResponse)
    }

    // Generate password reset token
    const resetToken = await generatePasswordResetToken(user.email)

    // Create reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.name || undefined
    )

    // Audit log
    await auditLog({
      action: 'password.reset.requested',
      entityType: 'USER',
      entityId: user.id,
      userId: user.id,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { 
        email: user.email,
        emailSent: emailResult.success
      }
    })

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      // Don't expose email sending failure to prevent information disclosure
    }

    return NextResponse.json(successResponse)

  } catch (error) {
    console.error('Password reset request error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: { message: 'Internal server error during password reset request' }
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/password'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { validateRequest, getClientIP, getUserAgent } from '@/lib/api/validate'
import { auditLog } from '@/lib/audit/audit-log'
import { isPast } from 'date-fns'

/**
 * POST /api/v1/auth/reset-password
 * Password reset endpoint following security-rules.md patterns
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json()
    const validation = await validateRequest(resetPasswordSchema, body)
    
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

    const { token, password } = validation.data!

    // Find and validate reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            active: true
          }
        }
      }
    })

    if (!resetToken) {
      await auditLog({
        action: 'password.reset.failed',
        entityType: 'USER',
        entityId: 'anonymous',
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { 
          reason: 'invalid_token',
          token: token.substring(0, 8) + '...'
        }
      })

      return NextResponse.json(
        { 
          success: false,
          error: { message: 'Invalid or expired reset token' }
        },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (isPast(resetToken.expiresAt)) {
      await auditLog({
        action: 'password.reset.failed',
        entityType: 'USER',
        entityId: resetToken.userId || 'unknown',
        userId: resetToken.userId || undefined,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { 
          reason: 'token_expired',
          email: resetToken.email
        }
      })

      return NextResponse.json(
        { 
          success: false,
          error: { message: 'Reset token has expired' }
        },
        { status: 400 }
      )
    }

    // Check if token was already used
    if (resetToken.used) {
      await auditLog({
        action: 'password.reset.failed',
        entityType: 'USER',
        entityId: resetToken.userId || 'unknown',
        userId: resetToken.userId || undefined,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { 
          reason: 'token_already_used',
          email: resetToken.email
        }
      })

      return NextResponse.json(
        { 
          success: false,
          error: { message: 'Reset token has already been used' }
        },
        { status: 400 }
      )
    }

    // Check if user is active
    if (!resetToken.user?.active) {
      await auditLog({
        action: 'password.reset.failed',
        entityType: 'USER',
        entityId: resetToken.userId || 'unknown',
        userId: resetToken.userId || undefined,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        metadata: { 
          reason: 'user_inactive',
          email: resetToken.email
        }
      })

      return NextResponse.json(
        { 
          success: false,
          error: { message: 'Account is not active' }
        },
        { status: 400 }
      )
    }

    // Check if user ID exists
    if (!resetToken.userId) {
      await auditLog({
        action: 'PASSWORD_RESET_FAILED',
        entityType: 'USER',
        entityId: 'unknown',
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        metadata: { reason: 'Invalid reset token - user not found' }
      })
      return NextResponse.json(
        { error: 'Invalid reset token - user not found' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Use transaction to update password and mark token as used
    await prisma.$transaction([
      // Update user password
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }),
      // Mark token as used
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      }),
      // Clean up any other unused tokens for this user (security)
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId!,
          used: false,
          id: { not: resetToken.id }
        },
        data: { used: true }
      })
    ])

    // Audit log successful password reset
    await auditLog({
      action: 'password.reset.completed',
      entityType: 'USER',
      entityId: resetToken.userId,
      userId: resetToken.userId,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { 
        email: resetToken.email
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: { message: 'Internal server error during password reset' }
      },
      { status: 500 }
    )
  }
}
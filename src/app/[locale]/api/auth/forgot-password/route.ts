import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user doesn't exist (security practice)
      return NextResponse.json(
        { 
          success: true,
          message: 'If an account with that email exists, we have sent a password reset link.' 
        },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    // Clean up old reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        email: user.email,
        userId: user.id,
        expiresAt
      }
    })

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.name || 'User', resetLink)
      console.log(`Password reset email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Don't return error to user for security reasons
      // But log it for debugging
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request. Please try again later.' },
      { status: 500 }
    )
  }
}

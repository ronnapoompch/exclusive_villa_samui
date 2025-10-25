import { NextRequest, NextResponse } from 'next/server'
import { generateVerificationToken } from '@/lib/auth/verification'
import { sendVerificationEmail } from '@/services/email.service'
import prisma from '@/lib/db/prisma'
import { registerSchema } from '@/lib/validations/auth'
import { hashPassword } from '@/lib/auth/password'
import { validateRequest, getClientIP, getUserAgent } from '@/lib/api/validate'
import { auditLog } from '@/lib/audit/audit-log'

/**
 * POST /api/v1/auth/register
 * User registration with email verification following security-rules.md patterns
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json()
    const validation = await validateRequest(registerSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: { 
            message: 'Validation failed',
            details: validation.error?.issues || []
          }
        },
        { status: 400 }
      )
    }

    const { name, email, password, phone, preferredLanguage } = validation.data!

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: { message: 'User with this email already exists' }
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        preferredLanguage: preferredLanguage || 'en',
        emailVerified: null, // Will be set after email verification
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        preferredLanguage: true,
        createdAt: true
      }
    })

    // Generate email verification token
    const verificationToken = await generateVerificationToken(user.id, user.email)

    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email, 
      verificationUrl,
      user.name || undefined
    )

    // Audit log
    await auditLog({
      action: 'user.register',
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
      console.error('Failed to send verification email:', emailResult.error)
      // Don't fail registration, but log the issue
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailSent: emailResult.success
        }
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: { message: 'Internal server error during registration' }
      },
      { status: 500 }
    )
  }
}
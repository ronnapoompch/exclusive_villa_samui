import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/[locale]/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Admin-specific login validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Only allow admin emails
    const allowedAdminEmails = [
      'admin@exclusivevillasamui.com',
      'staff@exclusivevillasamui.com',
      'manager@exclusivevillasamui.com'
    ]

    if (!allowedAdminEmails.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Access denied. Admin credentials required.' },
        { status: 403 }
      )
    }

    // Use regular NextAuth for authentication
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        redirect: false
      })
    })

    const authResult = await response.json()

    if (!response.ok || authResult.error) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Additional admin role check
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin login successful',
      redirectTo: '/admin/dashboard'
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Admin login failed' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { unlockAccount, getLockoutStatus } from '@/lib/auth/login-attempts'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get current lockout status
    const beforeStatus = await getLockoutStatus(email)
    
    // Unlock the account
    await unlockAccount(email)
    
    // Get status after unlock
    const afterStatus = await getLockoutStatus(email)
    
    return NextResponse.json({
      success: true,
      message: `Account ${email} has been unlocked`,
      beforeStatus,
      afterStatus
    })
  } catch (error) {
    console.error('Error unlocking account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Get lockout status
    const status = await getLockoutStatus(email)
    
    return NextResponse.json({
      success: true,
      email,
      status
    })
  } catch (error) {
    console.error('Error getting lockout status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
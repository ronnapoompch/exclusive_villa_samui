import { prisma } from '@/lib/prisma'

export interface LoginAttemptResult {
  allowed: boolean
  reason?: string
  blockedUntil?: Date
}

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

export async function trackLoginAttempt(
  email: string,
  success: boolean,
  ip: string,
  userAgent?: string,
  userId?: string
): Promise<void> {
  await prisma.loginAttempt.create({
    data: {
      email,
      success,
      ip,
      userAgent,
      userId,
      reason: success ? null : 'Invalid credentials',
    },
  })

  // If login failed, check if we need to block the user
  if (!success) {
    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      },
    })

    if (failedAttempts >= MAX_ATTEMPTS) {
      const blockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
      
      // Update the most recent failed attempt with block info
      await prisma.loginAttempt.updateMany({
        where: {
          email,
          success: false,
          createdAt: {
            gte: new Date(Date.now() - 1000), // Last second
          },
        },
        data: {
          blockedUntil,
          reason: 'Account temporarily blocked due to multiple failed attempts',
        },
      })
    }
  }
}

export async function isLockedOut(email: string): Promise<boolean> {
  // Check for recent failed attempts
  const recentFailedAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
      },
    },
  })

  if (recentFailedAttempts < MAX_ATTEMPTS) {
    return false
  }

  // Check if there's an active block
  const latestBlockedAttempt = await prisma.loginAttempt.findFirst({
    where: {
      email,
      blockedUntil: {
        not: null,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (latestBlockedAttempt?.blockedUntil) {
    if (new Date() < latestBlockedAttempt.blockedUntil) {
      return true
    }
  }

  return false
}

// Function to manually unlock an account (for admin use)
export async function unlockAccount(email: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({
    where: {
      email,
      success: false
    }
  })
}

// Function to get lockout status with details
export async function getLockoutStatus(email: string): Promise<LoginAttemptResult> {
  const recentFailedAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000),
      },
    },
  })

  if (recentFailedAttempts < MAX_ATTEMPTS) {
    return { allowed: true }
  }

  const latestBlockedAttempt = await prisma.loginAttempt.findFirst({
    where: {
      email,
      blockedUntil: {
        not: null,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (latestBlockedAttempt?.blockedUntil) {
    if (new Date() < latestBlockedAttempt.blockedUntil) {
      return {
        allowed: false,
        reason: `Account locked. Try again after ${latestBlockedAttempt.blockedUntil.toLocaleTimeString()}`,
        blockedUntil: latestBlockedAttempt.blockedUntil,
      }
    }
  }

  return { allowed: true }
}

export async function clearLoginAttempts(email: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({
    where: { email },
  })
}

export async function getLoginAttemptStats(email: string): Promise<{
  totalAttempts: number
  failedAttempts: number
  recentFailedAttempts: number
  isCurrentlyBlocked: boolean
  blockedUntil?: Date
}> {
  const totalAttempts = await prisma.loginAttempt.count({
    where: { email },
  })

  const failedAttempts = await prisma.loginAttempt.count({
    where: { email, success: false },
  })

  const recentFailedAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000),
      },
    },
  })

  const isLocked = await isLockedOut(email)
  const lockoutStatus = await getLockoutStatus(email)

  return {
    totalAttempts,
    failedAttempts,
    recentFailedAttempts,
    isCurrentlyBlocked: isLocked,
    blockedUntil: lockoutStatus.blockedUntil,
  }
}
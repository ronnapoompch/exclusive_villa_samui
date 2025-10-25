import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function generateVerificationToken(userId: string, email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete any existing verification tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { userId }
  })

  // Create new verification token
  await prisma.verificationToken.create({
    data: {
      userId,
      email,
      token,
      expiresAt,
      type: 'EMAIL_VERIFICATION'
    }
  })

  return token
}

export async function generatePasswordResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('User not found')
  }

  // Delete any existing password reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id }
  })

  // Create new password reset token
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      email,
      token,
      expiresAt,
    }
  })

  return token
}

export async function verifyEmailToken(token: string): Promise<{ 
  isValid: boolean
  userId?: string 
}> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  })

  if (!verificationToken) {
    return { isValid: false }
  }

  if (verificationToken.expiresAt < new Date()) {
    // Token expired, delete it
    await prisma.verificationToken.delete({
      where: { token }
    })
    return { isValid: false }
  }

  return { 
    isValid: true, 
    userId: verificationToken.userId 
  }
}

export async function verifyPasswordResetToken(token: string): Promise<{ 
  isValid: boolean
  email?: string 
}> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken) {
    return { isValid: false }
  }

  if (resetToken.expiresAt < new Date()) {
    // Token expired, delete it
    await prisma.passwordResetToken.delete({
      where: { token }
    })
    return { isValid: false }
  }

  return { 
    isValid: true, 
    email: resetToken.email 
  }
}

export async function consumeVerificationToken(token: string): Promise<boolean> {
  try {
    const verification = await verifyEmailToken(token)
    
    if (!verification.isValid || !verification.userId) {
      return false
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date() }
    })

    // Delete the token
    await prisma.verificationToken.delete({
      where: { token }
    })

    return true
  } catch (error) {
    console.error('Error consuming verification token:', error)
    return false
  }
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  try {
    const reset = await verifyPasswordResetToken(token)
    
    if (!reset.isValid || !reset.email) {
      return null
    }

    // Delete the token
    await prisma.passwordResetToken.delete({
      where: { token }
    })

    return reset.email
  } catch (error) {
    console.error('Error consuming password reset token:', error)
    return null
  }
}
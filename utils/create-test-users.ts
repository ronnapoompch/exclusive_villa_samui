import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('Creating test users...')

    // Test user 1: Regular user
    const hashedPassword1 = await bcrypt.hash('Test123@', 12)
    const user1 = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword1,
        role: 'USER',
        active: true,
        emailVerified: new Date(),
      },
    })
    console.log('Created user:', user1.email)

    // Test user 2: Admin user
    const hashedPassword2 = await bcrypt.hash('Admin123@', 12)
    const user2 = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword2,
        role: 'ADMIN',
        active: true,
        emailVerified: new Date(),
      },
    })
    console.log('Created admin:', user2.email)

    console.log('Test users created successfully!')
  } catch (error) {
    console.error('Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
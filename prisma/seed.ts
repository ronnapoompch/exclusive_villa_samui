// prisma/seed.ts - Basic Seed Data for Current Schema
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // ============================================================================
  // 👤 CREATE USERS
  // ============================================================================
  
  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@exclusivevillasamui.com' },
    update: {},
    create: {
      email: 'admin@exclusivevillasamui.com',
      name: 'Villa Admin',
      password: await bcrypt.hash('admin123!', 12),
      role: 'ADMIN',
      phone: '+66-2-123-4567',
      language: 'en',
      preferredLanguage: 'en',
      preferredCurrency: 'THB',
    },
  })

  // Staff User
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@exclusivevillasamui.com' },
    update: {},
    create: {
      email: 'staff@exclusivevillasamui.com',
      name: 'Villa Staff',
      password: await bcrypt.hash('staff123!', 12),
      role: 'STAFF',
      phone: '+66-77-123-456',
      language: 'en',
      preferredLanguage: 'th',
      preferredCurrency: 'THB',
    },
  })

  // Regular User
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'John Smith',
      password: await bcrypt.hash('user123!', 12),
      role: 'USER',
      phone: '+1-555-0123',
      language: 'en',
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
    },
  })

  console.log('✅ Users created:', { 
    adminUser: adminUser.id, 
    staffUser: staffUser.id, 
    regularUser: regularUser.id 
  })

  console.log('🎉 Database seeding completed successfully!')
  
  // Summary
  console.log('\n📊 SEEDING SUMMARY:')
  console.log('👤 Users: 3 (Admin, Staff, Regular User)')
  console.log('📧 Admin Login: admin@exclusivevillasamui.com / admin123!')
  console.log('👷 Staff Login: staff@exclusivevillasamui.com / staff123!')
  console.log('👤 User Login: user@example.com / user123!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
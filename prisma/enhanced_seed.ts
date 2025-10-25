// prisma/enhanced_seed.ts - Enhanced Seed Data for Current Schema
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting ENHANCED database seeding...')

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

  // Additional Guest Users
  const guestUsers = [];
  const guestData = [
    { email: 'guest1@example.com', name: 'Sarah Johnson', phone: '+1-555-0101', currency: 'USD' },
    { email: 'guest2@example.com', name: 'Michael Brown', phone: '+1-555-0102', currency: 'EUR' },
    { email: 'guest3@example.com', name: 'Emma Wilson', phone: '+44-20-1234-5678', currency: 'GBP' },
    { email: 'guest4@example.com', name: 'David Lee', phone: '+1-555-0104', currency: 'USD' },
    { email: 'manager@exclusivevillasamui.com', name: 'Villa Manager', phone: '+66-77-999-888', currency: 'THB', role: 'ADMIN' },
  ];

  for (const guest of guestData) {
    const user = await prisma.user.upsert({
      where: { email: guest.email },
      update: {},
      create: {
        email: guest.email,
        name: guest.name,
        password: await bcrypt.hash('guest123!', 12),
        role: (guest.role as 'USER' | 'ADMIN' | 'STAFF') || 'USER',
        phone: guest.phone,
        language: 'en',
        preferredLanguage: 'en',
        preferredCurrency: guest.currency,
      },
    });
    guestUsers.push(user);
  }

  console.log('✅ Users created:', { 
    adminUser: adminUser.id, 
    staffUser: staffUser.id, 
    regularUser: regularUser.id,
    additionalUsers: guestUsers.length 
  })

  // ============================================================================
  // 🔐 CREATE SAMPLE LOGIN ATTEMPTS
  // ============================================================================

  await prisma.loginAttempt.createMany({
    data: [
      {
        email: 'admin@exclusivevillasamui.com',
        userId: adminUser.id,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        createdAt: new Date(Date.now() - 86400000), // Yesterday
      },
      {
        email: 'staff@exclusivevillasamui.com',
        userId: staffUser.id,
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        success: true,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        email: 'unknown@hacker.com',
        ip: '103.45.67.89',
        userAgent: 'curl/7.68.0',
        success: false,
        reason: 'Invalid credentials',
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
      },
      {
        email: 'guest1@example.com',
        userId: guestUsers[0]?.id,
        ip: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        success: true,
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      },
    ],
  });

  console.log('✅ Login attempts created');

  // ============================================================================
  // 📝 CREATE AUDIT LOGS
  // ============================================================================

  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: adminUser.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        metadata: { loginMethod: 'password', timestamp: new Date().toISOString() },
      },
      {
        userId: staffUser.id,
        action: 'USER_PROFILE_UPDATE',
        entityType: 'USER',
        entityId: staffUser.id,
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        metadata: { field: 'preferredLanguage', oldValue: 'en', newValue: 'th' },
      },
      {
        userId: adminUser.id,
        action: 'SYSTEM_BACKUP',
        entityType: 'USER',
        entityId: 'system',
        ipAddress: '192.168.1.100',
        metadata: { type: 'full_backup', status: 'completed', size: '2.5GB' },
      },
    ],
  });

  console.log('✅ Audit logs created');

  // ============================================================================
  // 🔐 CREATE VERIFICATION TOKENS
  // ============================================================================

  await prisma.verificationToken.createMany({
    data: [
      {
        userId: regularUser.id,
        token: 'verify_email_abc123def456',
        type: 'EMAIL_VERIFICATION',
        email: regularUser.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        used: false,
      },
      {
        userId: guestUsers[0]?.id || regularUser.id,
        token: 'reset_pass_xyz789uvw012',
        type: 'PASSWORD_RESET',
        email: guestUsers[0]?.email || regularUser.email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        used: false,
      },
      {
        userId: adminUser.id,
        token: 'verify_phone_qwe345rty678',
        type: 'PHONE_VERIFICATION',
        phone: adminUser.phone,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        used: true,
      },
    ],
  });

  console.log('✅ Verification tokens created');

  console.log('🎉 ENHANCED database seeding completed successfully!')
  
  // Summary
  console.log('\n📊 ENHANCED SEEDING SUMMARY:')
  console.log(`👤 Users: ${3 + guestUsers.length} total (1 Admin, 1 Staff, ${1 + guestUsers.length} Regular Users)`)
  console.log('🔐 Login Attempts: 4 records (3 successful, 1 failed)')
  console.log('� Audit Logs: 3 system activities')
  console.log('🔑 Verification Tokens: 3 tokens (email, password reset, phone)')
  console.log('')
  console.log('🔐 LOGIN CREDENTIALS:')
  console.log('📧 Admin: admin@exclusivevillasamui.com / admin123!')
  console.log('👷 Staff: staff@exclusivevillasamui.com / staff123!')
  console.log('👤 User: user@example.com / user123!')
  console.log('👥 Guests: guest1@example.com through guest4@example.com / guest123!')
  console.log('👔 Manager: manager@exclusivevillasamui.com / guest123!')
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
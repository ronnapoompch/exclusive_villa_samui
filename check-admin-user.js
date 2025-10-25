const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Checking for admin users...')
    
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true, active: true }
    })
    
    console.log('📊 Admin users found:', adminUsers.length)
    
    if (adminUsers.length > 0) {
      console.log('✅ Existing admin users:')
      adminUsers.forEach(user => {
        console.log(`  - ${user.email} (Active: ${user.active})`)
      })
    } else {
      console.log('⚠️ No admin users found. Creating admin user...')
      
      // Hash the password properly
      const hashedPassword = await bcrypt.hash('Admin123!', 12)
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@exclusivevillasamui.com',
          name: 'Villa Admin',
          password: hashedPassword,
          role: 'ADMIN',
          active: true
        }
      })
      
      console.log('✅ Admin user created:')
      console.log(`  - Email: ${adminUser.email}`)
      console.log(`  - Password: Admin123!`)
      console.log(`  - Role: ${adminUser.role}`)
    }
    
    // Test login credentials
    console.log('\n🧪 Testing admin login...')
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@exclusivevillasamui.com' }
    })
    
    if (testUser) {
      const passwordValid = await bcrypt.compare('Admin123!', testUser.password)
      console.log('🔐 Password test:', passwordValid ? '✅ Valid' : '❌ Invalid')
      console.log('👤 User active:', testUser.active ? '✅ Yes' : '❌ No')
      console.log('🔑 User role:', testUser.role)
    }
    
    await prisma.$disconnect()
    console.log('\n🎉 Admin check complete!')
    
  } catch (error) {
    console.error('❌ Database error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkAndCreateAdmin()
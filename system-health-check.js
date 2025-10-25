console.log('🔍 Testing System Health...')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testSystemHealth() {
  try {
    console.log('1. Testing Database Connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    console.log('2. Testing Admin User...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@exclusivevillasamui.com' }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        active: adminUser.active
      })
    } else {
      console.log('❌ Admin user not found')
    }

    console.log('3. Testing Villa Count...')
    const villaCount = await prisma.villa.count()
    console.log('✅ Villa count:', villaCount)

    console.log('4. Testing Booking Count...')
    const bookingCount = await prisma.booking.count()
    console.log('✅ Booking count:', bookingCount)

    console.log('🎉 All systems operational!')

  } catch (error) {
    console.error('❌ System health check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSystemHealth()
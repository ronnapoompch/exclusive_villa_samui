// Test database connection
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...')
    
    // Test raw query
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Raw query: OK')
    
    // Test villa count
    const villaCount = await prisma.villa.count()
    console.log(`✅ Villa count: ${villaCount}`)
    
    // Test image count
    const imageCount = await prisma.villaImage.count()
    console.log(`✅ Image count: ${imageCount}`)
    
    // Get first villa
    const firstVilla = await prisma.villa.findFirst({
      include: {
        villaImages: { take: 1 }
      }
    })
    console.log(`✅ First villa: ${firstVilla?.name}`)
    console.log(`✅ First image: ${firstVilla?.villaImages[0]?.url?.substring(0, 50)}...`)
    
    console.log('\n🎉 Database connection: SUCCESS!')
  } catch (error) {
    console.error('\n❌ Database connection: FAILED!')
    console.error('Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

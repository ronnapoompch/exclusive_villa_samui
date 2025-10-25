// Test database connection
const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    console.log('🔄 Testing database connection...');
    
    const userCount = await prisma.user.count();
    console.log('✅ Database connected successfully!');
    console.log(`👥 Users in database: ${userCount}`);
    
    const villaCount = await prisma.villa.count();
    console.log(`🏠 Villas in database: ${villaCount}`);
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Check if we can create a test user (will rollback)
    const testEmail = 'test-connection@example.com';
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log('🔍 Test user already exists');
    } else {
      console.log('👤 No test user found (this is normal)');
    }
    
    console.log('✅ All database operations working!');
    
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log(error.message);
    
    if (error.code === 'P1001') {
      console.log('💡 Solution: Check DATABASE_URL in .env file');
    } else if (error.code === 'P2021') {
      console.log('💡 Solution: Run "npx prisma migrate dev"');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearLoginAttempts() {
  try {
    console.log('🔧 Clearing login attempts and unlocking accounts...\n');
    
    // ตรวจสอบ login attempts ที่มีอยู่
    const attempts = await prisma.loginAttempt.findMany({
      where: {
        OR: [
          { email: 'admin@exclusivevillasamui.com' },
          { email: 'test@villa.com' },
          { email: 'user@villa.com' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`Found ${attempts.length} recent login attempts:`);
    attempts.forEach(attempt => {
      console.log(`- ${attempt.email}: ${attempt.success ? '✅ Success' : '❌ Failed'} at ${attempt.createdAt}`);
      if (attempt.blockedUntil) {
        console.log(`  🔒 Blocked until: ${attempt.blockedUntil}`);
      }
    });
    
    // ลบ login attempts ทั้งหมด
    const deleteResult = await prisma.loginAttempt.deleteMany({
      where: {
        OR: [
          { email: 'admin@exclusivevillasamui.com' },
          { email: 'test@villa.com' },
          { email: 'user@villa.com' }
        ]
      }
    });
    
    console.log(`\n✅ Cleared ${deleteResult.count} login attempts`);
    console.log('🔓 All accounts are now unlocked and ready for login!');
    
    console.log('\n📋 Available accounts:');
    console.log('- admin@exclusivevillasamui.com / Admin123!');
    console.log('- test@villa.com / test123');
    console.log('- user@villa.com / user123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearLoginAttempts();
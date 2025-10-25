const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function unlockAllAccounts() {
  try {
    console.log('🔓 Unlocking all accounts...\n');
    
    // Get all failed attempts
    const failedAttempts = await prisma.loginAttempt.findMany({
      where: { success: false },
      select: { email: true, createdAt: true, blockedUntil: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (failedAttempts.length > 0) {
      console.log('Failed login attempts found:');
      const uniqueEmails = [...new Set(failedAttempts.map(attempt => attempt.email))];
      uniqueEmails.forEach(email => {
        const userAttempts = failedAttempts.filter(attempt => attempt.email === email);
        const blockedAttempt = userAttempts.find(attempt => attempt.blockedUntil);
        console.log(`- ${email}: ${userAttempts.length} failed attempts${blockedAttempt ? ' (BLOCKED until ' + blockedAttempt.blockedUntil + ')' : ''}`);
      });
      
      // Delete all failed attempts
      const deleteResult = await prisma.loginAttempt.deleteMany({
        where: { success: false }
      });
      
      console.log(`\n✅ Cleared ${deleteResult.count} failed login attempts`);
      console.log('🔓 All accounts unlocked successfully!');
    } else {
      console.log('✅ No failed login attempts found. All accounts are already unlocked.');
    }
    
    console.log('\n📋 Ready to login with:');
    console.log('- admin@exclusivevillasamui.com / Admin123!');
    console.log('- test@villa.com / test123');
    console.log('- user@villa.com / user123');
    
  } catch (error) {
    console.error('❌ Error unlocking accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unlockAllAccounts();
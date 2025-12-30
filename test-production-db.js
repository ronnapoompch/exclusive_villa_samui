const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testProductionDB() {
  try {
    console.log('🔍 Testing production database connection...\n');
    
    // Test basic query
    const count = await prisma.villa.count();
    console.log(`✅ Total villas: ${count}`);
    
    // Test monthly villas
    const monthlyVillas = await prisma.villa.findMany({
      where: { isMonthlyRate: true },
      select: {
        id: true,
        name: true,
        codeId: true,
        isMonthlyRate: true,
        monthlyPriceText: true,
      },
      take: 3
    });
    
    console.log(`✅ Monthly villas: ${monthlyVillas.length}\n`);
    
    if (monthlyVillas.length > 0) {
      console.log('Sample monthly villas:');
      monthlyVillas.forEach(v => {
        console.log(`  - ${v.name} (${v.codeId}): "${v.monthlyPriceText}"`);
      });
    } else {
      console.log('⚠️  No monthly villas found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testProductionDB();

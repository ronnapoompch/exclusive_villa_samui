// Check database for monthly villas
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database for monthly villas...\n');
    
    // Find villas with isMonthlyRate flag
    const monthlyVillas = await prisma.villa.findMany({
      where: {
        isMonthlyRate: true,
      },
      select: {
        id: true,
        name: true,
        codeId: true,
        isMonthlyRate: true,
        monthlyPriceText: true,
        pricePerNight: true,
      },
      take: 10,
    });
    
    console.log(`✅ Found ${monthlyVillas.length} villas with isMonthlyRate=true`);
    console.log('\n📋 First 10 monthly villas:\n');
    
    monthlyVillas.forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}`);
      console.log(`   Code: ${v.codeId || 'N/A'}`);
      console.log(`   isMonthlyRate: ${v.isMonthlyRate}`);
      console.log(`   monthlyPriceText: "${v.monthlyPriceText}"`);
      console.log(`   pricePerNight: ${v.pricePerNight}\n`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

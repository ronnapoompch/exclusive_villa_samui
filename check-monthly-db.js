const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMonthlyVillas() {
  try {
    const monthlyVillas = await prisma.villa.findMany({
      where: {
        isMonthlyRate: true
      },
      select: {
        id: true,
        name: true,
        codeId: true,
        isMonthlyRate: true,
        monthlyPriceText: true,
      }
    });
    
    console.log(`\n✅ Found ${monthlyVillas.length} monthly villas in database:\n`);
    
    monthlyVillas.slice(0, 10).forEach((v, i) => {
      console.log(`${i + 1}. ${v.name} (${v.codeId})`);
      console.log(`   monthlyPriceText: "${v.monthlyPriceText}"\n`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMonthlyVillas();

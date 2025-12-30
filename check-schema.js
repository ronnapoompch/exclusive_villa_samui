const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    // Try to query with new fields
    const villa = await prisma.villa.findFirst({
      select: {
        id: true,
        name: true,
        codeId: true,
        isMonthlyRate: true,
        monthlyPriceText: true,
      }
    });
    
    console.log('✅ Schema has new fields!');
    console.log('Sample villa:', villa);
  } catch (error) {
    console.log('❌ Schema missing fields:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();

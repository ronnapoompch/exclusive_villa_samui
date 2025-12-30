const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumns() {
  try {
    console.log('🔧 Adding columns to Villa table...\n');
    
    // Add codeId column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "villas" 
      ADD COLUMN IF NOT EXISTS "codeId" TEXT UNIQUE
    `);
    console.log('✅ Added codeId column');
    
    // Add isMonthlyRate column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "villas" 
      ADD COLUMN IF NOT EXISTS "isMonthlyRate" BOOLEAN DEFAULT false
    `);
    console.log('✅ Added isMonthlyRate column');
    
    // Add monthlyPriceText column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "villas" 
      ADD COLUMN IF NOT EXISTS "monthlyPriceText" TEXT
    `);
    console.log('✅ Added monthlyPriceText column');
    
    console.log('\n🎉 All columns added successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addColumns();

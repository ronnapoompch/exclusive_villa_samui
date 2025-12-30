const { PrismaClient } = require('@prisma/client');

// Use production DATABASE_URL from environment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function addProductionColumns() {
  try {
    console.log('🔧 Adding columns to production database...\n');
    
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
    
    // Create index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "villas_codeId_idx" ON "villas"("codeId")
    `);
    console.log('✅ Created index on codeId');
    
    console.log('\n🎉 All columns added to production database successfully!');
    console.log('\nNext step: Run seed script to populate data');
    console.log('  npx tsx prisma/seed.ts');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addProductionColumns();

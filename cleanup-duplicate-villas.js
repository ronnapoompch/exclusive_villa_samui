const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function cleanupDuplicateVillas() {
  try {
    console.log('🧹 Cleaning up duplicate villas...\n');
    
    // Load JSON - this is the source of truth
    const jsonData = JSON.parse(
      fs.readFileSync('./data/villas-optimized.json', 'utf8')
    );
    
    const correctSlugs = new Set(jsonData.map(v => v.slug));
    console.log(`📁 Correct villas from JSON: ${correctSlugs.size}`);
    
    // Get all villas from database
    const allDbVillas = await prisma.villa.findMany({
      select: { id: true, slug: true, name: true }
    });
    
    console.log(`💾 Current villas in DB: ${allDbVillas.length}\n`);
    
    // Find villas to delete (not in JSON)
    const villasToDelete = allDbVillas.filter(v => !correctSlugs.has(v.slug));
    
    console.log(`❌ Villas to delete: ${villasToDelete.length}\n`);
    
    if (villasToDelete.length === 0) {
      console.log('✅ No duplicates found. Database is clean!');
      return;
    }
    
    console.log('📋 Sample villas that will be deleted (first 10):');
    villasToDelete.slice(0, 10).forEach(v => {
      console.log(`  - ${v.name} (${v.slug})`);
    });
    
    if (villasToDelete.length > 10) {
      console.log(`  ... and ${villasToDelete.length - 10} more\n`);
    } else {
      console.log('');
    }
    
    console.log('🗑️  Starting deletion...\n');
    
    const villaIdsToDelete = villasToDelete.map(v => v.id);
    
    // Delete in transaction for safety
    const result = await prisma.villa.deleteMany({
      where: {
        id: {
          in: villaIdsToDelete
        }
      }
    });
    
    console.log(`✅ Deleted ${result.count} villas\n`);
    
    // Verify final count
    const finalCount = await prisma.villa.count();
    console.log('='.repeat(60));
    console.log(`🎯 Final villa count: ${finalCount}`);
    console.log(`📁 Expected count: ${correctSlugs.size}`);
    
    if (finalCount === correctSlugs.size) {
      console.log('✅ SUCCESS! Database matches JSON file');
    } else {
      console.log('⚠️  WARNING: Counts do not match!');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateVillas();

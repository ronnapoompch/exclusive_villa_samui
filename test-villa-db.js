const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVillaDB() {
  try {
    console.log('🔍 Checking villas in database...\n');
    
    // Test 1: Count total villas
    const count = await prisma.villa.count();
    console.log(`✅ Total villas in DB: ${count}\n`);
    
    // Test 2: Get sample villas
    const villas = await prisma.villa.findMany({
      take: 5,
      select: { id: true, name: true, slug: true, active: true }
    });
    
    console.log('📋 Sample villas:');
    villas.forEach(v => {
      console.log(`  - ${v.name} (slug: ${v.slug}, active: ${v.active})`);
    });
    
    // Test 3: Try to find the specific villa
    console.log('\n🎯 Looking for "5-stars-beachfront-villa"...');
    const targetVilla = await prisma.villa.findUnique({
      where: { slug: '5-stars-beachfront-villa' },
      select: { id: true, name: true, slug: true, active: true }
    });
    
    if (targetVilla) {
      console.log('✅ Found:', targetVilla);
    } else {
      console.log('❌ Villa not found in database!');
    }
    
    // Test 4: Get all villa slugs
    console.log('\n📝 All villa slugs in DB:');
    const allSlugs = await prisma.villa.findMany({
      select: { slug: true },
      take: 10
    });
    allSlugs.forEach(v => console.log(`  - ${v.slug}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testVillaDB();

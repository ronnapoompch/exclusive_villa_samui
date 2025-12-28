const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testVillaQuery() {
  try {
    console.log('🔍 Testing villa query...\n');

    // Test 1: Count total villas
    const totalVillas = await prisma.villa.count();
    console.log(`📊 Total villas in database: ${totalVillas}`);

    // Test 2: Get first 3 villas with images
    const villas = await prisma.villa.findMany({
      take: 3,
      include: {
        villaImages: {
          take: 2,
          orderBy: [
            { isHero: 'desc' },
            { order: 'asc' }
          ]
        },
        pricing: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' }
      ]
    });

    console.log(`\n✅ Successfully fetched ${villas.length} villas\n`);

    villas.forEach((villa, i) => {
      console.log(`${i + 1}. ${villa.name}`);
      console.log(`   Slug: ${villa.slug}`);
      console.log(`   Images: ${villa.villaImages.length}`);
      if (villa.villaImages.length > 0) {
        console.log(`   First image: ${villa.villaImages[0].url.substring(0, 80)}...`);
      }
      console.log(`   Pricing: ${villa.pricing.length > 0 ? `$${villa.pricing[0].dailyRate}/night` : 'Not set'}`);
      console.log('');
    });

    // Test 3: Test the exact query used by API
    const apiStyleQuery = await prisma.villa.findMany({
      where: { active: true },
      include: {
        villaImages: {
          orderBy: [
            { isHero: 'desc' },
            { order: 'asc' }
          ]
        },
        pricing: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      skip: 0,
      take: 10,
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' }
      ]
    });

    console.log(`📈 API-style query results: ${apiStyleQuery.length} villas`);
    
    if (apiStyleQuery.length === 0) {
      console.log('\n⚠️  No active villas found! Checking active status...');
      
      const activeCount = await prisma.villa.count({ where: { active: true } });
      const inactiveCount = await prisma.villa.count({ where: { active: false } });
      
      console.log(`   Active villas: ${activeCount}`);
      console.log(`   Inactive villas: ${inactiveCount}`);
      
      if (activeCount === 0) {
        console.log('\n❌ PROBLEM: All villas are marked as inactive!');
        console.log('   Solution: Need to set villas as active=true');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testVillaQuery();

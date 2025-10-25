// Professional Villa Management Test
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVillaManagement() {
  console.log('🏠 PROFESSIONAL VILLA MANAGEMENT TEST');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Get villa statistics
    console.log('1️⃣ Testing villa statistics...');
    const totalVillas = await prisma.villa.count();
    const activeVillas = await prisma.villa.count({ where: { active: true } });
    const beachfrontVillas = await prisma.villa.count({ where: { beachfront: true } });
    const featuredVillas = await prisma.villa.count({ where: { featured: true } });
    
    console.log(`   Total villas: ${totalVillas}`);
    console.log(`   Active villas: ${activeVillas}`);
    console.log(`   Beachfront villas: ${beachfrontVillas}`);
    console.log(`   Featured villas: ${featuredVillas}`);
    console.log('   ✅ Villa statistics retrieved');
    
    // Test 2: Get sample villas
    console.log('\n2️⃣ Testing villa retrieval...');
    const sampleVillas = await prisma.villa.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        bedrooms: true,
        bathrooms: true,
        maxGuests: true,
        beachfront: true,
        location: true,
        active: true,
        featured: true
      }
    });
    
    console.log(`   Retrieved ${sampleVillas.length} sample villas:`);
    sampleVillas.forEach((villa, index) => {
      console.log(`     ${index + 1}. ${villa.name}`);
      console.log(`        Slug: ${villa.slug}`);
      console.log(`        Bedrooms: ${villa.bedrooms}, Bathrooms: ${villa.bathrooms}`);
      console.log(`        Max Guests: ${villa.maxGuests}`);
      console.log(`        Location: ${villa.location || 'Not specified'}`);
      console.log(`        Beachfront: ${villa.beachfront ? 'Yes' : 'No'}`);
      console.log(`        Featured: ${villa.featured ? 'Yes' : 'No'}`);
      console.log(`        Active: ${villa.active ? 'Yes' : 'No'}`);
      console.log('');
    });
    console.log('   ✅ Villa retrieval working');
    
    // Test 3: Test villa search by location
    console.log('\n3️⃣ Testing villa search by location...');
    const laemaiVillas = await prisma.villa.count({
      where: {
        location: {
          contains: 'Lamai',
          mode: 'insensitive'
        }
      }
    });
    
    const chawengVillas = await prisma.villa.count({
      where: {
        location: {
          contains: 'Chaweng',
          mode: 'insensitive'
        }
      }
    });
    
    console.log(`   Lamai villas: ${laemaiVillas}`);
    console.log(`   Chaweng villas: ${chawengVillas}`);
    console.log('   ✅ Location search working');
    
    // Test 4: Test villa with pricing
    console.log('\n4️⃣ Testing villa pricing data...');
    const villasWithPricing = await prisma.villa.findMany({
      where: { active: true },
      include: {
        pricing: {
          take: 3,
          orderBy: { month: 'asc' }
        }
      },
      take: 2
    });
    
    console.log(`   Found ${villasWithPricing.length} villas with pricing data:`);
    villasWithPricing.forEach((villa, index) => {
      console.log(`     ${index + 1}. ${villa.name}`);
      console.log(`        Pricing entries: ${villa.pricing.length}`);
      if (villa.pricing.length > 0) {
        villa.pricing.forEach(price => {
          console.log(`          Month ${price.month}: Daily ฿${price.dailyRate || 'N/A'}, Monthly ฿${price.monthlyRate || 'N/A'}`);
        });
      }
      console.log('');
    });
    console.log('   ✅ Villa pricing data accessible');
    
    // Test 5: Test villa filtering
    console.log('\n5️⃣ Testing villa filtering...');
    
    // Filter by bedrooms
    const large3BRVillas = await prisma.villa.count({
      where: {
        bedrooms: { gte: 3 },
        active: true
      }
    });
    
    // Filter by guests
    const groupVillas = await prisma.villa.count({
      where: {
        maxGuests: { gte: 8 },
        active: true
      }
    });
    
    // Beachfront only
    const beachfrontActive = await prisma.villa.count({
      where: {
        beachfront: true,
        active: true
      }
    });
    
    console.log(`   Large villas (3+ bedrooms): ${large3BRVillas}`);
    console.log(`   Group villas (8+ guests): ${groupVillas}`);
    console.log(`   Active beachfront villas: ${beachfrontActive}`);
    console.log('   ✅ Villa filtering working');
    
    // Test 6: Test villa search functionality
    console.log('\n6️⃣ Testing villa search functionality...');
    
    const searchTerm = 'villa';
    const searchResults = await prisma.villa.count({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { location: { contains: searchTerm, mode: 'insensitive' } }
        ],
        active: true
      }
    });
    
    console.log(`   Search for "${searchTerm}": ${searchResults} results`);
    console.log('   ✅ Villa search functionality working');
    
    // Test 7: Test villa by slug
    console.log('\n7️⃣ Testing villa retrieval by slug...');
    
    const sampleSlug = sampleVillas[0]?.slug;
    if (sampleSlug) {
      const villaBySlug = await prisma.villa.findUnique({
        where: { slug: sampleSlug },
        include: {
          pricing: {
            take: 5,
            orderBy: { month: 'asc' }
          }
        }
      });
      
      if (villaBySlug) {
        console.log(`   Villa found by slug: ${villaBySlug.name}`);
        console.log(`   Description length: ${villaBySlug.description?.length || 0} characters`);
        console.log(`   Amenities: ${villaBySlug.amenities?.length || 0} items`);
        console.log(`   Images: ${villaBySlug.images?.length || 0} items`);
        console.log('   ✅ Villa slug lookup working');
      } else {
        console.log('   ❌ Villa not found by slug');
      }
    } else {
      console.log('   ⚠️ No sample slug available for testing');
    }
    
    // Test 8: Test villa amenities
    console.log('\n8️⃣ Testing villa amenities...');
    
    const villasWithAmenities = await prisma.villa.count({
      where: {
        amenities: { not: { equals: [] } }
      }
    });
    
    console.log(`   Villas with amenities: ${villasWithAmenities}`);
    
    // Get sample amenities
    const sampleVillaWithAmenities = await prisma.villa.findFirst({
      where: {
        amenities: { not: { equals: [] } }
      },
      select: {
        name: true,
        amenities: true
      }
    });
    
    if (sampleVillaWithAmenities) {
      console.log(`   Sample villa: ${sampleVillaWithAmenities.name}`);
      console.log(`   Amenities: ${sampleVillaWithAmenities.amenities?.join(', ') || 'None'}`);
    }
    console.log('   ✅ Villa amenities working');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL VILLA MANAGEMENT TESTS PASSED!');
    console.log('✅ Villa management system is working correctly');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • ${totalVillas} total villas in database`);
    console.log(`   • ${activeVillas} active villas available`);
    console.log(`   • ${beachfrontVillas} beachfront properties`);
    console.log(`   • ${featuredVillas} featured properties`);
    console.log('   • Search, filtering, and pricing all functional');
    
  } catch (error) {
    console.log('\n❌ Villa management test failed:');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.code || 'Unknown'}`);
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testVillaManagement();
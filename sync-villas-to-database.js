// Sync villas from JSON to PostgreSQL database
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function syncVillasToDatabase() {
  try {
    console.log('🔄 Loading villas from JSON...');
    const jsonPath = path.join(__dirname, 'public', 'villas-data.json');
    const villasData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📊 Found ${villasData.length} villas to sync`);
    
    let synced = 0;
    let errors = 0;
    
    for (const villa of villasData) {
      try {
        await prisma.villas.upsert({
          where: { slug: villa.slug },
          update: {
            name: villa.name,
            location: villa.location,
            bedrooms: villa.bedrooms,
            bathrooms: villa.bathrooms,
            guests: villa.guests,
            price: villa.price,
            description: villa.description,
            amenities: villa.amenities,
            images: villa.images,
            featured: villa.featured || false,
            beachfront: villa.features?.beachfront || false,
            priceRange: villa.priceRange,
          },
          create: {
            slug: villa.slug,
            name: villa.name,
            location: villa.location,
            bedrooms: villa.bedrooms,
            bathrooms: villa.bathrooms,
            guests: villa.guests,
            price: villa.price,
            description: villa.description,
            amenities: villa.amenities,
            images: villa.images,
            featured: villa.featured || false,
            beachfront: villa.features?.beachfront || false,
            priceRange: villa.priceRange,
          },
        });
        synced++;
        if (synced % 50 === 0) {
          console.log(`  ✅ Synced ${synced}/${villasData.length}`);
        }
      } catch (error) {
        errors++;
        console.error(`  ❌ Error syncing ${villa.slug}:`, error.message);
      }
    }
    
    console.log(`\n✅ Sync complete!`);
    console.log(`   - Synced: ${synced}`);
    console.log(`   - Errors: ${errors}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncVillasToDatabase();

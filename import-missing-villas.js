const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importMissingVillas() {
  try {
    console.log('🔍 Loading villas from JSON...\n');
    
    // Load JSON data
    const jsonData = JSON.parse(
      fs.readFileSync('./data/villas-optimized.json', 'utf8')
    );
    
    console.log(`📁 Total villas in JSON: ${jsonData.length}`);
    
    // Get existing villas from database
    const existingVillas = await prisma.villa.findMany({
      select: { slug: true }
    });
    
    const existingSlugs = new Set(existingVillas.map(v => v.slug));
    console.log(`💾 Total villas in DB: ${existingVillas.length}\n`);
    
    // Find missing villas
    const missingVillas = jsonData.filter(villa => !existingSlugs.has(villa.slug));
    
    console.log(`❌ Missing villas: ${missingVillas.length}\n`);
    
    if (missingVillas.length === 0) {
      console.log('✅ All villas are already in database!');
      return;
    }
    
    console.log('📋 Missing villas:');
    missingVillas.slice(0, 10).forEach(v => {
      console.log(`  - ${v.name} (${v.slug})`);
    });
    if (missingVillas.length > 10) {
      console.log(`  ... and ${missingVillas.length - 10} more\n`);
    }
    
    console.log('\n🚀 Starting import...\n');
    
    let imported = 0;
    let errors = 0;
    
    for (const villa of missingVillas) {
      try {
        await prisma.villa.create({
          data: {
            name: villa.name,
            slug: villa.slug,
            description: villa.description || null,
            bedrooms: villa.bedrooms || 0,
            bathrooms: villa.bathrooms || 0,
            maxGuests: villa.maxGuests || 0,
            beachfront: villa.beachfront || false,
            location: villa.location || 'Koh Samui',
            locationLink: villa.locationLink || null,
            phone: villa.phone || null,
            officialWebsite: villa.officialWebsite || null,
            airbnbUrl: villa.airbnbUrl || null,
            agodaUrl: villa.agodaUrl || null,
            images: villa.images || [],
            amenities: villa.amenities || [],
            minimumStay: villa.minimumStay || null,
            petFriendly: villa.petFriendly || false,
            cleaning: villa.cleaning || null,
            cook: villa.cook || null,
            utilities: villa.utilities || null,
            active: true,
            featured: villa.featured || false
          }
        });
        
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`  ✅ Imported ${imported}/${missingVillas.length} villas...`);
        }
        
      } catch (error) {
        errors++;
        console.error(`  ❌ Error importing ${villa.slug}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Import completed!`);
    console.log(`  - Successfully imported: ${imported} villas`);
    console.log(`  - Errors: ${errors} villas`);
    console.log(`  - Total in DB now: ${existingVillas.length + imported} villas`);
    console.log('='.repeat(60));
    
    // Verify final count
    const finalCount = await prisma.villa.count();
    console.log(`\n🎯 Final verification: ${finalCount} villas in database`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importMissingVillas();

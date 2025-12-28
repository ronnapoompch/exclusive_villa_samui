// Direct import to production database using DATABASE_URL
// Usage: POSTGRES_PRISMA_URL="your-production-db-url" node import-to-production-direct.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function importToProduction() {
  try {
    console.log('🚀 Direct Import to Production Database\n');

    // Check for production database URL
    const productionDbUrl = process.env.POSTGRES_PRISMA_URL || process.env.PRODUCTION_DATABASE_URL;
    
    if (!productionDbUrl) {
      console.log('❌ Production database URL not provided!\n');
      console.log('📋 How to get your production DATABASE_URL:\n');
      console.log('1️⃣ Go to: https://vercel.com/ronnapooms-projects/exclusive-villa-samui/settings/environment-variables');
      console.log('2️⃣ Find: POSTGRES_PRISMA_URL or DATABASE_URL');
      console.log('3️⃣ Copy the value');
      console.log('\n4️⃣ Then run:');
      console.log('   POSTGRES_PRISMA_URL="your-url-here" node import-to-production-direct.js\n');
      return;
    }

    console.log('✅ Production database URL found');
    console.log(`   ${productionDbUrl.substring(0, 40)}...\n`);

    // Connect to production database
    const prisma = new PrismaClient({
      datasources: {
        db: { url: productionDbUrl }
      }
    });

    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to production database\n');

    // Load export data
    if (!fs.existsSync('export-villa-data.json')) {
      console.error('❌ export-villa-data.json not found!');
      console.log('   Run: node export-for-production.js first');
      await prisma.$disconnect();
      return;
    }

    const exportData = JSON.parse(fs.readFileSync('export-villa-data.json', 'utf8'));
    console.log(`📊 Loaded ${exportData.totalVillas} villas from export\n`);

    // Check existing data
    const existingCount = await prisma.villa.count();
    console.log(`📋 Current villas in production: ${existingCount}`);

    if (existingCount > 0) {
      console.log('\n⚠️  Production database already has villas!');
      console.log('   Options:');
      console.log('   1. Skip import (data already exists)');
      console.log('   2. Clear and reimport (delete all first)');
      console.log('\n   Skipping to avoid duplicates...');
      await prisma.$disconnect();
      return;
    }

    console.log('\n🎯 Starting import...\n');

    let imported = 0;
    let failed = 0;

    for (const villaData of exportData.villas) {
      try {
        // Create villa with relations
        await prisma.villa.create({
          data: {
            slug: villaData.slug,
            name: villaData.name,
            description: villaData.description,
            bedrooms: villaData.bedrooms,
            bathrooms: villaData.bathrooms,
            maxGuests: villaData.maxGuests,
            beachfront: villaData.beachfront,
            location: villaData.location,
            amenities: villaData.amenities || [],
            featured: villaData.featured || false,
            active: villaData.active !== false,
            villaImages: {
              create: villaData.villaImages.map(img => ({
                url: img.url,
                category: img.category,
                order: img.order,
                isHero: img.isHero || false,
                altText: img.altText || `${villaData.name} - ${img.category}`
              }))
            },
            pricing: {
              create: villaData.pricing.map(price => ({
                dailyRate: price.dailyRate,
                weeklyRate: price.weeklyRate,
                monthlyRate: price.monthlyRate,
                currency: price.currency || 'USD',
                validFrom: price.validFrom ? new Date(price.validFrom) : new Date(),
                validTo: price.validTo ? new Date(price.validTo) : null
              }))
            }
          }
        });

        imported++;
        if (imported % 10 === 0) {
          console.log(`✅ Imported ${imported}/${exportData.totalVillas} villas...`);
        }

      } catch (error) {
        console.error(`❌ Failed to import ${villaData.name}:`, error.message);
        failed++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('\n📈 Import Complete!');
    console.log(`   ✅ Imported: ${imported} villas`);
    console.log(`   ❌ Failed: ${failed} villas`);
    console.log(`   📸 Total images: ${imported * 30} (approximate)`);

    // Verify
    const finalCount = await prisma.villa.count();
    console.log(`\n✅ Verified: ${finalCount} villas in production database`);

    await prisma.$disconnect();
    console.log('\n🎉 All done! Check your production site now!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

importToProduction();

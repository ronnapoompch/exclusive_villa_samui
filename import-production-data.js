// import-production-data.js - Import 226 villas with Vercel Blob URLs to Production
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

const VERCEL_BLOB_BASE_URL = 'https://xkoncnp41eepsysa.public.blob.vercel-storage.com';

// Convert local image path to Vercel Blob URL
function convertToVercelBlobUrl(localPath) {
  if (!localPath) return null;
  if (localPath.startsWith('http')) return localPath; // Already a URL
  
  // Remove leading slash and 'optimized-villas/' prefix
  let cleanPath = localPath.replace(/^\//, '').replace(/^optimized-villas\//, '');
  
  // Return Vercel Blob URL
  return `${VERCEL_BLOB_BASE_URL}/${cleanPath}`;
}

async function importVillaData() {
  console.log('🚀 Starting Production Data Import...\n');
  
  try {
    // Read export data
    const exportData = JSON.parse(fs.readFileSync('export-villa-data.json', 'utf8'));
    console.log(`📊 Found ${exportData.villas.length} villas in export file\n`);
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful\n');
    
    // Check current villa count
    const currentCount = await prisma.villa.count();
    console.log(`📋 Current villa count in database: ${currentCount}`);
    
    if (currentCount > 0) {
      console.log('\n⚠️  Database already has villas. Options:');
      console.log('   1. Delete existing and import fresh (recommended)');
      console.log('   2. Skip import');
      console.log('\n▶️  Proceeding with option 1: Fresh import\n');
      
      // Delete existing data
      console.log('🗑️  Deleting existing data...');
      await prisma.villaImage.deleteMany({});
      await prisma.villa.deleteMany({});
      console.log('✅ Existing data deleted\n');
    }
    
    // Import villas
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log('📥 Importing villas...\n');
    
    for (let i = 0; i < exportData.villas.length; i++) {
      const villaData = exportData.villas[i];
      
      try {
        // Prepare villa data (exclude villaImages from main data)
        const { villaImages, ...villaOnly } = villaData;
        
        // Parse JSON fields if they're strings
        if (typeof villaOnly.images === 'string') {
          villaOnly.images = JSON.parse(villaOnly.images);
        }
        if (typeof villaOnly.amenities === 'string') {
          villaOnly.amenities = JSON.parse(villaOnly.amenities);
        }
        
        // Remove id fields to let database generate new ones
        delete villaOnly.id;
        delete villaOnly.createdAt;
        delete villaOnly.updatedAt;
        
        // Create villa
        const createdVilla = await prisma.villa.create({
          data: villaOnly
        });
        
        // Import villa images with Vercel Blob URLs
        if (villaImages && villaImages.length > 0) {
          const imageRecords = villaImages.map(img => {
            // Convert local path to Vercel Blob URL
            const vercelBlobUrl = convertToVercelBlobUrl(img.url);
            
            return {
              villaId: createdVilla.id,
              url: vercelBlobUrl,
              category: img.category || 'hero',
              order: img.order || 0,
              altText: img.altText || `${createdVilla.slug} - ${img.category}`,
              width: img.width,
              height: img.height,
              size: img.size,
              format: img.format || 'webp',
              isHero: img.isHero || false,
            };
          });
          
          // Batch create images
          await prisma.villaImage.createMany({
            data: imageRecords,
            skipDuplicates: true,
          });
        }
        
        successCount++;
        
        // Progress indicator
        if ((i + 1) % 10 === 0) {
          console.log(`   ✅ Imported ${i + 1}/${exportData.villas.length} villas...`);
        }
        
      } catch (error) {
        errorCount++;
        errors.push({
          villa: villaData.name,
          slug: villaData.slug,
          error: error.message
        });
        console.log(`   ❌ Error importing ${villaData.name}: ${error.message}`);
      }
    }
    
    // Final statistics
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully imported: ${successCount} villas`);
    console.log(`❌ Failed: ${errorCount} villas`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => {
        console.log(`   - ${err.villa} (${err.slug}): ${err.error}`);
      });
    }
    
    // Verify final counts
    const finalVillaCount = await prisma.villa.count();
    const finalImageCount = await prisma.villaImage.count();
    
    console.log('\n✅ Final Database Counts:');
    console.log(`   📊 Villas: ${finalVillaCount}`);
    console.log(`   🖼️  Images: ${finalImageCount}`);
    
    // Show sample villa with Vercel Blob URLs
    const sampleVilla = await prisma.villa.findFirst({
      include: {
        villaImages: {
          take: 3,
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (sampleVilla) {
      console.log('\n🏠 Sample Villa:');
      console.log(`   Name: ${sampleVilla.name}`);
      console.log(`   Slug: ${sampleVilla.slug}`);
      console.log(`   Images: ${sampleVilla.villaImages.length}`);
      console.log('\n📸 Sample Image URLs:');
      sampleVilla.villaImages.forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img.url}`);
      });
    }
    
    console.log('\n🎉 Import completed successfully!');
    console.log('\n▶️  Next steps:');
    console.log('   1. Test API: https://exclusive-villa-samui.vercel.app/api/villas?limit=5');
    console.log('   2. Check website: https://exclusive-villa-samui.vercel.app/');
    console.log('   3. Verify images are loading from Vercel Blob');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importVillaData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

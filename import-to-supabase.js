/**
 * Import Villa Data to Supabase
 * 
 * This script imports villa and image data from JSON to Supabase
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importToSupabase() {
  console.log('🚀 Starting import to Supabase...\n');
  
  try {
    // Read exported data
    const data = JSON.parse(fs.readFileSync('export-villa-data.json', 'utf-8'));
    
    console.log(`📊 Data summary:`);
    console.log(`   Villas: ${data.villas.length}`);
    console.log(`   Total Images: ${data.villas.reduce((sum, v) => sum + v.villaImages.length, 0)}\n`);
    
    let villaCount = 0;
    let imageCount = 0;
    let errorCount = 0;
    
    for (const villa of data.villas) {
      try {
        // Extract images
        const images = villa.villaImages;
        delete villa.villaImages;
        
        // Create villa
        await prisma.villa.create({
          data: villa
        });
        
        villaCount++;
        
        // Create images
        if (images && images.length > 0) {
          await prisma.villaImage.createMany({
            data: images,
            skipDuplicates: true
          });
          
          imageCount += images.length;
        }
        
        if (villaCount % 10 === 0) {
          console.log(`   ✓ Imported ${villaCount}/${data.villas.length} villas...`);
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to import ${villa.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Import Complete!\n');
    console.log(`   ✅ Villas imported: ${villaCount}`);
    console.log(`   ✅ Images imported: ${imageCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importToSupabase();

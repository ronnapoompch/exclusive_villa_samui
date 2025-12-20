const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUPABASE_URL = 'https://apyrnttbxpountnopuoq.supabase.co/storage/v1/object/public/villa-images';

async function batchUpdateUrls() {
  console.log('🔄 Batch updating image URLs...\n');
  
  try {
    // Get all images with local URLs
    const images = await prisma.villaImage.findMany({
      where: {
        url: { startsWith: '/optimized-villas/' }
      }
    });
    
    console.log(`📊 Found ${images.length} images to update\n`);
    
    let updated = 0;
    const batchSize = 50;
    
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (image) => {
        try {
          // Convert /optimized-villas/{slug}/{category}/{filename}
          // to https://...supabase.co/storage/v1/object/public/villa-images/{slug}/{category}/{filename}
          const storagePath = image.url.replace('/optimized-villas/', '');
          const newUrl = `${SUPABASE_URL}/${storagePath}`;
          
          await prisma.villaImage.update({
            where: { id: image.id },
            data: { url: newUrl }
          });
          
          updated++;
        } catch (error) {
          console.error(`Error updating ${image.id}:`, error.message);
        }
      }));
      
      process.stdout.write(`🔄 Updated: ${updated}/${images.length} (${((updated/images.length)*100).toFixed(1)}%)\r`);
    }
    
    console.log(`\n\n✅ Batch update complete!`);
    console.log(`   Total updated: ${updated}`);
    
    // Verify final count
    const supabaseCount = await prisma.villaImage.count({
      where: { url: { startsWith: 'https://apyrnttbxpountnopuoq.supabase.co' } }
    });
    const localCount = await prisma.villaImage.count({
      where: { url: { startsWith: '/optimized-villas' } }
    });
    
    console.log(`\n📊 Final Status:`);
    console.log(`   ✅ Supabase URLs: ${supabaseCount}`);
    console.log(`   ❌ Local URLs: ${localCount}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

batchUpdateUrls();

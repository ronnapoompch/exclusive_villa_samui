const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function convertToLocalUrls() {
  console.log('🔄 Converting Vercel Blob URLs to local URLs...\n');
  
  try {
    // Get all images with Blob URLs
    const images = await prisma.villaImage.findMany({
      where: {
        url: {
          contains: 'blob.vercel-storage.com'
        }
      },
      include: {
        villa: {
          select: { slug: true }
        }
      }
    });
    
    console.log(`📸 Found ${images.length} images with Blob URLs\n`);
    
    if (images.length === 0) {
      console.log('✅ All images already use local URLs!');
      return;
    }
    
    let updated = 0;
    let failed = 0;
    
    // Convert each image URL
    for (const image of images) {
      try {
        // Extract filename from Blob URL
        // Example: https://.../villas/baan-tawan/amenities/1ffbb143_original.webp
        const urlParts = image.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const category = image.category || urlParts[urlParts.length - 2];
        const slug = image.villa.slug;
        
        // Create local URL: /optimized-villas/{slug}/{category}/{filename}
        const localUrl = `/optimized-villas/${slug}/${category}/${filename}`;
        
        // Update database
        await prisma.villaImage.update({
          where: { id: image.id },
          data: { url: localUrl }
        });
        
        updated++;
        
        if (updated % 100 === 0) {
          console.log(`   ✓ Updated ${updated}/${images.length} images...`);
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to update image ${image.id}:`, error.message);
        failed++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Conversion Complete!\n');
    console.log(`   ✅ Successfully updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📦 Total: ${images.length}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

convertToLocalUrls().catch(console.error);

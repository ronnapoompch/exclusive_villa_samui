const { PrismaClient } = require('@prisma/client');

// Use production database URL
const productionDbUrl = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

if (!productionDbUrl) {
  console.error('❌ No database URL provided');
  console.log('Usage: PRODUCTION_DATABASE_URL=your_db_url node update-production-images.js');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: productionDbUrl
    }
  }
});

async function updateProductionImages() {
  try {
    console.log('🔄 Updating production database images...');
    console.log(`📊 Database: ${productionDbUrl.split('@')[1]?.split('/')[0] || 'unknown'}`);
    
    // Get all villa images with Cloudinary URLs
    const cloudinaryImages = await prisma.villaImage.findMany({
      where: {
        url: {
          contains: 'cloudinary'
        }
      },
      take: 10 // Show first 10 for debugging
    });
    
    console.log(`\n📸 Found ${cloudinaryImages.length} Cloudinary images`);
    if (cloudinaryImages.length > 0) {
      console.log('\n📋 Sample URLs:');
      cloudinaryImages.slice(0, 5).forEach(img => {
        console.log(`   - ${img.url.substring(0, 80)}...`);
      });
    }
    
    // Get total count without limit
    const totalCount = await prisma.villaImage.count({
      where: {
        url: {
          contains: 'cloudinary'
        }
      }
    });
    
    console.log(`\n📊 Total Cloudinary images in database: ${totalCount}`);
    
    if (cloudinaryImages.length === 0) {
      console.log('✅ No Cloudinary images found - database already updated!');
      return;
    }
    
    // Update each image URL from Cloudinary to local path
    let updated = 0;
    let failed = 0;
    
    for (const image of cloudinaryImages) {
      try {
        // Extract path from Cloudinary URL
        // Example: https://res.cloudinary.com/.../villas/5-stars-beachfront-villa/hero/909.webp
        // Should become: /optimized-villas/5-stars-beachfront-villa/hero/909.webp
        
        const match = image.url.match(/villas\/(.+)/);
        if (!match) {
          console.log(`⚠️  Skipping malformed URL: ${image.url}`);
          failed++;
          continue;
        }
        
        const localPath = `/optimized-villas/${match[1]}`;
        
        await prisma.villaImage.update({
          where: { id: image.id },
          data: { url: localPath }
        });
        
        updated++;
        if (updated % 100 === 0) {
          console.log(`   Progress: ${updated}/${cloudinaryImages.length}`);
        }
      } catch (err) {
        console.error(`❌ Failed to update ${image.id}:`, err.message);
        failed++;
      }
    }
    
    console.log(`\n✅ Update complete!`);
    console.log(`   ✓ Updated: ${updated}`);
    console.log(`   ✗ Failed: ${failed}`);
    
    // Verify update
    const remainingCloudinary = await prisma.villaImage.count({
      where: {
        url: {
          contains: 'cloudinary.com'
        }
      }
    });
    
    console.log(`\n📊 Remaining Cloudinary URLs: ${remainingCloudinary}`);
    
    if (remainingCloudinary === 0) {
      console.log('🎉 All images successfully updated to local paths!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateProductionImages();

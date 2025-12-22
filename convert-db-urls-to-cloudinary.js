const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cloudinary base URL
const CLOUDINARY_BASE = 'https://res.cloudinary.com/dkttxey0z/image/upload/exclusive-villa-samui/villas';

async function convertToCloudinaryUrls() {
  try {
    console.log('🚀 Converting local image URLs to Cloudinary URLs...\n');

    // Get all images
    const images = await prisma.villaImage.findMany({
      include: {
        villa: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    });

    console.log(`📊 Found ${images.length} images to convert\n`);

    let converted = 0;
    let alreadyCloudinary = 0;
    let failed = 0;

    for (const image of images) {
      try {
        // Skip if already Cloudinary URL
        if (image.url.startsWith('https://res.cloudinary.com')) {
          alreadyCloudinary++;
          continue;
        }

        // Convert local path to Cloudinary URL
        // From: /optimized-villas/villa-slug/category/image.webp
        // To: https://res.cloudinary.com/dkttxey0z/image/upload/exclusive-villa-samui/villas/villa-slug/category/image.webp
        
        const localPath = image.url.replace('/optimized-villas/', '');
        const cloudinaryUrl = `${CLOUDINARY_BASE}/${localPath}`;

        // Update in database
        await prisma.villaImage.update({
          where: { id: image.id },
          data: { url: cloudinaryUrl }
        });

        converted++;

        if (converted % 100 === 0) {
          console.log(`✅ Converted ${converted} images...`);
        }

      } catch (error) {
        console.error(`❌ Failed to convert ${image.url}:`, error.message);
        failed++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n📈 Conversion Summary:`);
    console.log(`   Total images: ${images.length}`);
    console.log(`   ✅ Converted: ${converted}`);
    console.log(`   ⏭️  Already Cloudinary: ${alreadyCloudinary}`);
    console.log(`   ❌ Failed: ${failed}`);

    // Verify with sample
    const sampleVilla = await prisma.villa.findFirst({
      include: {
        villaImages: {
          take: 3
        }
      }
    });

    if (sampleVilla && sampleVilla.villaImages.length > 0) {
      console.log(`\n📝 Sample verification (${sampleVilla.name}):`);
      sampleVilla.villaImages.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.url.substring(0, 100)}...`);
      });
    }

    console.log(`\n✅ Conversion completed successfully!`);

  } catch (error) {
    console.error('\n❌ Error during conversion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

convertToCloudinaryUrls();

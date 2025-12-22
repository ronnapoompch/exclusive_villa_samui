const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Vercel Blob base URL
const VERCEL_BLOB_BASE = 'https://xkoncnp41eepsysa.public.blob.vercel-storage.com';

async function convertToVercelBlobUrls() {
  try {
    console.log('🔄 Converting Cloudinary URLs to Vercel Blob URLs...\n');

    // Get all images with Cloudinary URLs
    const images = await prisma.villaImage.findMany({
      where: {
        url: {
          contains: 'cloudinary.com'
        }
      },
      include: {
        villa: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    });

    console.log(`📊 Found ${images.length} images with Cloudinary URLs\n`);

    if (images.length === 0) {
      console.log('✅ No Cloudinary URLs found. All images already use Vercel Blob!');
      
      // Show sample to verify
      const sample = await prisma.villaImage.findFirst({
        include: {
          villa: {
            select: { name: true }
          }
        }
      });
      
      if (sample) {
        console.log(`\n📝 Sample URL (${sample.villa.name}):`);
        console.log(`   ${sample.url}`);
      }
      
      await prisma.$disconnect();
      return;
    }

    let converted = 0;
    let failed = 0;

    for (const image of images) {
      try {
        // Convert Cloudinary URL to Vercel Blob URL
        // From: https://res.cloudinary.com/dkttxey0z/image/upload/exclusive-villa-samui/villas/sunny-universal-villa/amen/32.webp
        // To: https://xkoncnp41eepsysa.public.blob.vercel-storage.com/villas/sunny-universal-villa/amen/32.webp
        
        const cloudinaryUrl = image.url;
        
        // Extract the path after "villas/"
        const match = cloudinaryUrl.match(/villas\/(.+)$/);
        
        if (!match) {
          console.error(`❌ Could not parse URL: ${cloudinaryUrl}`);
          failed++;
          continue;
        }
        
        const pathAfterVillas = match[1];
        const vercelBlobUrl = `${VERCEL_BLOB_BASE}/villas/${pathAfterVillas}`;

        // Update in database
        await prisma.villaImage.update({
          where: { id: image.id },
          data: { url: vercelBlobUrl }
        });

        converted++;

        if (converted % 100 === 0) {
          console.log(`✅ Converted ${converted} images...`);
        }

      } catch (error) {
        console.error(`❌ Failed to convert image ${image.id}:`, error.message);
        failed++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n📈 Conversion Summary:`);
    console.log(`   Total Cloudinary URLs: ${images.length}`);
    console.log(`   ✅ Converted: ${converted}`);
    console.log(`   ❌ Failed: ${failed}`);

    // Verify with samples from different villas
    console.log(`\n📝 Sample verification:`);
    const sampleVillas = await prisma.villa.findMany({
      take: 3,
      include: {
        villaImages: {
          take: 1
        }
      }
    });

    sampleVillas.forEach((villa, i) => {
      if (villa.villaImages.length > 0) {
        console.log(`   ${i + 1}. ${villa.name}:`);
        console.log(`      ${villa.villaImages[0].url}`);
      }
    });

    // Check if any Cloudinary URLs remain
    const remaining = await prisma.villaImage.count({
      where: {
        url: {
          contains: 'cloudinary.com'
        }
      }
    });

    if (remaining > 0) {
      console.log(`\n⚠️  Warning: ${remaining} Cloudinary URLs still remain!`);
    } else {
      console.log(`\n✅ All URLs successfully converted to Vercel Blob!`);
    }

  } catch (error) {
    console.error('\n❌ Error during conversion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

convertToVercelBlobUrls();

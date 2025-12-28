const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApiUrls() {
  try {
    console.log('🔍 Checking API URLs...\n');

    // Simulate API query
    const villas = await prisma.villa.findMany({
      where: { active: true },
      include: {
        villaImages: {
          orderBy: [
            { isHero: 'desc' },
            { order: 'asc' }
          ]
        },
        pricing: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      take: 3,
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' }
      ]
    });

    console.log(`✅ API Query Result: ${villas.length} villas\n`);

    // Check URL types
    const allImages = villas.flatMap(v => v.villaImages);
    const vercelBlobCount = allImages.filter(img => img.url.includes('blob.vercel-storage.com')).length;
    const cloudinaryCount = allImages.filter(img => img.url.includes('cloudinary.com')).length;
    const localCount = allImages.filter(img => img.url.startsWith('/')).length;

    console.log('📊 URL Statistics from API Query:');
    console.log(`   ✅ Vercel Blob: ${vercelBlobCount} (${((vercelBlobCount/allImages.length)*100).toFixed(1)}%)`);
    console.log(`   ☁️  Cloudinary: ${cloudinaryCount} (${((cloudinaryCount/allImages.length)*100).toFixed(1)}%)`);
    console.log(`   📁 Local paths: ${localCount} (${((localCount/allImages.length)*100).toFixed(1)}%)`);

    console.log('\n📝 Sample villas with images:');
    villas.forEach((villa, i) => {
      console.log(`\n${i + 1}. ${villa.name}`);
      console.log(`   Slug: ${villa.slug}`);
      console.log(`   Images: ${villa.villaImages.length}`);
      console.log(`   Active: ${villa.active}`);
      if (villa.villaImages.length > 0) {
        const firstImage = villa.villaImages[0].url;
        const imageType = firstImage.includes('blob.vercel-storage.com') ? '✅ Vercel Blob' :
                          firstImage.includes('cloudinary.com') ? '☁️  Cloudinary' :
                          '📁 Local';
        console.log(`   First image (${imageType}):`);
        console.log(`   ${firstImage.substring(0, 90)}...`);
      }
      if (villa.pricing.length > 0) {
        console.log(`   Price: $${villa.pricing[0].dailyRate}/night`);
      }
    });

    if (vercelBlobCount === allImages.length) {
      console.log('\n✅ PERFECT! API is using 100% Vercel Blob URLs!');
    } else if (cloudinaryCount > 0) {
      console.log(`\n⚠️  WARNING: API still has ${cloudinaryCount} Cloudinary URLs!`);
    } else if (localCount > 0) {
      console.log(`\n⚠️  WARNING: API has ${localCount} local path URLs!`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiUrls();

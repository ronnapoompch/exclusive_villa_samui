const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUrls() {
  try {
    console.log('🔍 Verifying image URLs...\n');
    
    // Check for Cloudinary URLs
    const cloudinaryCount = await prisma.villaImage.count({
      where: {
        url: {
          contains: 'cloudinary.com'
        }
      }
    });
    
    // Check for Vercel Blob URLs
    const vercelBlobCount = await prisma.villaImage.count({
      where: {
        url: {
          contains: 'blob.vercel-storage.com'
        }
      }
    });
    
    // Check for local URLs
    const localCount = await prisma.villaImage.count({
      where: {
        url: {
          startsWith: '/'
        }
      }
    });
    
    const totalCount = await prisma.villaImage.count();
    
    console.log('📊 URL Statistics:');
    console.log(`   Total images: ${totalCount}`);
    console.log(`   ✅ Vercel Blob: ${vercelBlobCount} (${((vercelBlobCount/totalCount)*100).toFixed(1)}%)`);
    console.log(`   ☁️  Cloudinary: ${cloudinaryCount} (${((cloudinaryCount/totalCount)*100).toFixed(1)}%)`);
    console.log(`   📁 Local paths: ${localCount} (${((localCount/totalCount)*100).toFixed(1)}%)`);
    
    // Show samples
    console.log('\n📝 Sample URLs:');
    const samples = await prisma.villaImage.findMany({
      take: 5,
      include: {
        villa: {
          select: { name: true }
        }
      }
    });
    
    samples.forEach((img, i) => {
      console.log(`   ${i + 1}. ${img.villa.name}:`);
      console.log(`      ${img.url.substring(0, 80)}...`);
    });
    
    if (vercelBlobCount === totalCount) {
      console.log('\n✅ Perfect! All images use Vercel Blob URLs!');
    } else if (cloudinaryCount > 0) {
      console.log(`\n⚠️  Warning: ${cloudinaryCount} images still use Cloudinary!`);
    } else if (localCount > 0) {
      console.log(`\n⚠️  Warning: ${localCount} images use local paths!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUrls();

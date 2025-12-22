const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVillaImageTable() {
  try {
    console.log('🔍 Checking VillaImage table...\n');
    
    // Check total records in VillaImage table
    const imageCount = await prisma.villaImage.count();
    console.log(`📊 Total images in VillaImage table: ${imageCount}\n`);
    
    // Get sample images
    const sampleImages = await prisma.villaImage.findMany({
      take: 5,
      include: {
        villa: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });
    
    console.log('📸 Sample images:');
    sampleImages.forEach((img, idx) => {
      console.log(`${idx + 1}. Villa: ${img.villa.name}`);
      console.log(`   URL: ${img.url}`);
      console.log(`   Category: ${img.category}`);
      console.log(`   Is Hero: ${img.isHero}`);
      console.log('');
    });
    
    // Count images per villa
    const villasWithImages = await prisma.villa.findMany({
      where: {
        villaImages: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            villaImages: true
          }
        }
      },
      take: 10
    });
    
    console.log(`\n🏠 Villas with images (showing first 10):`);
    villasWithImages.forEach((villa, idx) => {
      console.log(`${idx + 1}. ${villa.name}: ${villa._count.villaImages} images`);
    });
    
    const totalVillas = await prisma.villa.count();
    const villasWithImagesCount = await prisma.villa.count({
      where: {
        villaImages: {
          some: {}
        }
      }
    });
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total villas: ${totalVillas}`);
    console.log(`   Villas with images: ${villasWithImagesCount} (${((villasWithImagesCount/totalVillas)*100).toFixed(1)}%)`);
    console.log(`   Total images: ${imageCount}`);
    if (villasWithImagesCount > 0) {
      console.log(`   Average images per villa with images: ${(imageCount/villasWithImagesCount).toFixed(1)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVillaImageTable();

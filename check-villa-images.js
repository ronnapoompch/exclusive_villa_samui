const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVillaImages() {
  console.log('🔍 Checking villa images in database...\n');
  
  try {
    const villas = await prisma.villa.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        images: true,
      },
      take: 10
    });

    console.log(`📊 Total villas checked: ${villas.length}\n`);

    for (const villa of villas) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🏠 Villa: ${villa.name}`);
      console.log(`🔗 Slug: ${villa.slug}`);
      console.log(`📸 Images: ${villa.images ? villa.images.length : 0}`);
      
      if (villa.images && villa.images.length > 0) {
        console.log(`\n   First 3 image URLs:`);
        villa.images.slice(0, 3).forEach((img, idx) => {
          console.log(`   ${idx + 1}. ${img}`);
        });
        
        // Check if images are Cloudinary URLs
        const cloudinaryImages = villa.images.filter(img => img.includes('cloudinary.com'));
        const localImages = villa.images.filter(img => img.startsWith('/'));
        const otherImages = villa.images.filter(img => !img.includes('cloudinary.com') && !img.startsWith('/'));
        
        console.log(`\n   📊 Image sources:`);
        console.log(`      ☁️  Cloudinary: ${cloudinaryImages.length}`);
        console.log(`      💻 Local: ${localImages.length}`);
        console.log(`      ❓ Other: ${otherImages.length}`);
        
        // Check for broken patterns
        const potentialIssues = villa.images.filter(img => 
          img.includes('undefined') || 
          img.includes('null') || 
          img === '' ||
          !img
        );
        
        if (potentialIssues.length > 0) {
          console.log(`   ⚠️  WARNING: ${potentialIssues.length} potentially broken image URLs`);
        }
      } else {
        console.log(`   ❌ NO IMAGES FOUND!`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n✅ Image check complete!`);

    // Summary statistics
    const allVillas = await prisma.villa.findMany({
      select: {
        images: true
      }
    });

    const villasWithImages = allVillas.filter(v => v.images && v.images.length > 0);
    const villasWithoutImages = allVillas.filter(v => !v.images || v.images.length === 0);
    const totalImages = allVillas.reduce((sum, v) => sum + (v.images ? v.images.length : 0), 0);

    console.log(`\n📈 Overall Statistics:`);
    console.log(`   Total villas: ${allVillas.length}`);
    console.log(`   Villas with images: ${villasWithImages.length} (${((villasWithImages.length/allVillas.length)*100).toFixed(1)}%)`);
    console.log(`   Villas without images: ${villasWithoutImages.length}`);
    console.log(`   Total images: ${totalImages}`);
    console.log(`   Average images per villa: ${(totalImages/allVillas.length).toFixed(1)}`);

  } catch (error) {
    console.error('❌ Error checking images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVillaImages();

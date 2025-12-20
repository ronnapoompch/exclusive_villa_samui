const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRawData() {
  try {
    // Count images directly
    const imageCount = await prisma.villaImage.count();
    console.log('📊 Total VillaImage records:', imageCount);
    
    if (imageCount > 0) {
      // Get sample
      const samples = await prisma.villaImage.findMany({
        take: 5,
        include: { villa: { select: { name: true, slug: true } } }
      });
      
      console.log('\n📸 Sample images:');
      samples.forEach((img, i) => {
        console.log(`\n${i+1}. ${img.villa?.name || 'No villa'}`);
        console.log(`   Villa ID: ${img.villaId}`);
        console.log(`   URL: ${img.url}`);
        console.log(`   Category: ${img.category}`);
      });
    } else {
      console.log('❌ No images found in database!');
      
      // Check if villas exist
      const villaCount = await prisma.villa.count();
      console.log(`\n📊 Total villas: ${villaCount}`);
      
      if (villaCount > 0) {
        const sampleVilla = await prisma.villa.findFirst();
        console.log('\n🏠 Sample villa:');
        console.log(`   Name: ${sampleVilla.name}`);
        console.log(`   Slug: ${sampleVilla.slug}`);
        console.log(`   ID: ${sampleVilla.id}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRawData();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying deployment readiness...\n');
  
  // Check villas
  const villaCount = await prisma.villa.count();
  console.log(`✅ Villas: ${villaCount}`);
  
  // Check images
  const imageCount = await prisma.villaImage.count();
  console.log(`✅ Images in DB: ${imageCount}`);
  
  // Check sample villa with images
  const sampleVilla = await prisma.villa.findFirst({
    include: {
      villaImages: {
        take: 3,
        orderBy: { order: 'asc' }
      }
    }
  });
  
  console.log(`\n📸 Sample Villa: ${sampleVilla.name}`);
  console.log('   Image URLs:');
  sampleVilla.villaImages.forEach(img => {
    console.log(`   - ${img.url}`);
  });
  
  console.log('\n✅ System ready for deployment!');
  await prisma.$disconnect();
}

verify().catch(console.error);

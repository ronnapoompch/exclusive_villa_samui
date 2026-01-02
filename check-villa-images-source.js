const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVillaData() {
  try {
    const villa = await prisma.villa.findFirst({
      where: { slug: 'villa-playful-azure' },
      include: {
        villaImages: true
      }
    });

    if (villa) {
      console.log('Villa:', villa.name);
      console.log('villa.images field:', villa.images ? `${villa.images.length} items` : 'null/empty');
      console.log('villaImages table:', villa.villaImages.length, 'records');
      console.log('');
      
      if (villa.images && villa.images.length > 0) {
        console.log('Images from villa.images field (old JSON field):');
        villa.images.slice(0, 3).forEach((url, i) => {
          console.log(`  ${i + 1}. ${url.substring(0, 80)}...`);
        });
      }
      
      if (villa.villaImages && villa.villaImages.length > 0) {
        console.log('\nImages from villaImages table (new relation):');
        villa.villaImages.slice(0, 3).forEach((img, i) => {
          console.log(`  ${i + 1}. ${img.url.substring(0, 80)}...`);
        });
      }
    } else {
      console.log('Villa not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVillaData();

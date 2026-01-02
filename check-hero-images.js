const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHeroImages() {
  try {
    const villa = await prisma.villa.findFirst({
      where: { slug: 'villa-playful-azure' },
      include: {
        villaImages: {
          orderBy: { order: 'asc' },
          take: 5
        }
      }
    });

    if (villa) {
      console.log('Villa:', villa.name);
      console.log('Total images:', villa.villaImages.length);
      
      const heroImages = villa.villaImages.filter(img => img.isHero);
      console.log('Hero images:', heroImages.length);
      console.log('');
      
      villa.villaImages.forEach((img, i) => {
        console.log(`${i + 1}. isHero=${img.isHero}, order=${img.order}`);
        console.log(`   URL: ${img.url.substring(0, 80)}...`);
      });
    } else {
      console.log('Villa not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkHeroImages();

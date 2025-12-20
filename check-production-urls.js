const { PrismaClient } = require('@prisma/client');

const productionDbUrl = process.env.PRODUCTION_DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: productionDbUrl } }
});

async function checkProductionImages() {
  const images = await prisma.villaImage.findMany({
    take: 5,
    select: { url: true }
  });
  
  console.log('📸 Sample image URLs from PRODUCTION database:');
  images.forEach((img, i) => {
    console.log(`${i+1}. ${img.url}`);
  });
  
  await prisma.$disconnect();
}

checkProductionImages();

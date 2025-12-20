const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUrls() {
  const images = await prisma.villaImage.findMany({
    take: 5,
    select: {
      url: true,
      villa: { select: { slug: true } }
    }
  });
  
  console.log('📸 Sample image URLs from database:');
  images.forEach((img, i) => {
    console.log(`${i+1}. ${img.villa.slug}: ${img.url}`);
  });
  
  process.exit(0);
}

checkUrls();

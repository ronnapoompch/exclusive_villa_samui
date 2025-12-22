const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUrl() {
  const img = await prisma.villaImage.findFirst();
  console.log('Sample URL:', img.url);
  await prisma.$disconnect();
}

checkUrl();

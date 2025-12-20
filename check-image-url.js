const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImageURL() {
  try {
    const image = await prisma.villaImage.findFirst();
    console.log('Sample Image URL:', image?.url);
    console.log('Sample Image Path:', image?.path);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageURL();

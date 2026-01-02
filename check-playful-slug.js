const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSlug() {
  try {
    const villa = await prisma.villa.findFirst({
      where: {
        name: {
          contains: 'Playful',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
    
    console.log('Villa found:', JSON.stringify(villa, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSlug();

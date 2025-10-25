import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearVillaImages() {
  try {
    console.log('🔄 Clearing villa images to fix 404 errors...');
    
    // Update all villas to have empty images array
    const result = await prisma.villa.updateMany({
      data: {
        images: []
      }
    });

    console.log(`✅ Updated ${result.count} villas - removed image paths to use placeholder images`);
    console.log('🎯 All villa cards will now use Unsplash placeholder images');
    
  } catch (error) {
    console.error('❌ Error clearing villa images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearVillaImages();
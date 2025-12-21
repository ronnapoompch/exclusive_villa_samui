/**
 * Check villa image URLs
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImageUrls() {
  try {
    console.log('🔍 Checking villa image URLs...\n');
    
    const villas = await prisma.villa.findMany({
      take: 5,
      include: {
        villaImages: {
          take: 3,
          orderBy: { order: 'asc' }
        }
      }
    });
    
    villas.forEach(villa => {
      console.log(`\n🏡 ${villa.name}:`);
      console.log(`   Images: ${villa.villaImages.length}`);
      
      villa.villaImages.forEach((img, i) => {
        const url = img.url;
        const isBlob = url.startsWith('https://');
        const isLocal = url.startsWith('/');
        
        console.log(`   ${i + 1}. ${isBlob ? '✅ Blob' : '❌ Local'}: ${url.substring(0, 70)}...`);
      });
    });
    
    // Check totals
    const total = await prisma.villaImage.count();
    const blobCount = await prisma.villaImage.count({
      where: { url: { startsWith: 'https://' } }
    });
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`\n📊 Summary:`);
    console.log(`   Total images: ${total}`);
    console.log(`   Blob URLs: ${blobCount} (${(blobCount/total*100).toFixed(1)}%)`);
    console.log(`   Local paths: ${total - blobCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageUrls();

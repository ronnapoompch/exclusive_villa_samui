/**
 * 📊 Check Upload Status
 * 
 * Check how many images are already uploaded vs pending
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStatus() {
  console.log('📊 Checking Upload Status...\n');
  
  try {
    // Count all images
    const totalImages = await prisma.villaImage.count();
    
    // Count uploaded (URL starts with https://)
    const uploadedImages = await prisma.villaImage.count({
      where: {
        url: { startsWith: 'https://' }
      }
    });
    
    // Count pending (local paths)
    const pendingImages = totalImages - uploadedImages;
    
    // Get sample of pending images
    const samplePending = await prisma.villaImage.findMany({
      where: {
        url: { not: { startsWith: 'https://' } }
      },
      include: {
        villa: { select: { name: true, slug: true } }
      },
      take: 10
    });
    
    // Calculate progress
    const progress = ((uploadedImages / totalImages) * 100).toFixed(1);
    
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 UPLOAD STATUS');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log(`📦 Total Images:     ${totalImages}`);
    console.log(`✅ Uploaded:         ${uploadedImages} (${progress}%)`);
    console.log(`⏳ Pending:          ${pendingImages}\n`);
    
    if (pendingImages > 0) {
      console.log('📋 Sample of pending images:\n');
      samplePending.forEach((img, i) => {
        console.log(`${i + 1}. ${img.villa.name}`);
        console.log(`   📁 ${img.url}\n`);
      });
      
      console.log(`\n💡 Run upload script to upload remaining ${pendingImages} images`);
      console.log(`   Command: node upload-to-vercel-blob-robust.js`);
    } else {
      console.log('🎉 ALL IMAGES UPLOADED!\n');
      console.log('Next steps:');
      console.log('  1. Test the website locally');
      console.log('  2. Check if images load correctly');
      console.log('  3. Deploy to production');
    }
    
    console.log('\n═══════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();

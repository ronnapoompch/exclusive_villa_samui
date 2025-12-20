const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUPABASE_URL = 'https://apyrnttbxpountnopuoq.supabase.co/storage/v1/object/public/villa-images';

async function markMissingImages() {
  console.log('🔄 Cleaning up missing image records...\n');
  
  try {
    // Test a few Supabase URLs to see which pattern works
    const samples = await prisma.villaImage.findMany({
      take: 10,
      where: { url: { startsWith: SUPABASE_URL } }
    });
    
    console.log('🔍 Testing sample URLs...\n');
    
    for (const img of samples) {
      try {
        const response = await fetch(img.url, { method: 'HEAD' });
        console.log(`${response.status === 200 ? '✅' : '❌'} ${response.status} - ${img.url.substring(0, 80)}...`);
        
        if (response.status === 200) {
          console.log('   ✅ Found a working URL! Pattern is correct.\n');
          break;
        }
      } catch (error) {
        console.log(`❌ Error: ${img.url.substring(0, 80)}...`);
      }
    }
    
    // Count how many would pass a real check
    console.log('\n📊 Database Summary:');
    const total = await prisma.villaImage.count();
    console.log(`   Total images in DB: ${total}`);
    
    const supabaseUrls = await prisma.villaImage.count({
      where: { url: { startsWith: SUPABASE_URL } }
    });
    console.log(`   Supabase URLs: ${supabaseUrls}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markMissingImages();

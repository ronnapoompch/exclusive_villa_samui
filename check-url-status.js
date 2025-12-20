const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkURLs() {
  try {
    // Check URLs starting with different patterns
    const supabaseUrls = await prisma.villaImage.count({
      where: { url: { startsWith: 'https://apyrnttbxpountnopuoq.supabase.co' } }
    });
    
    const localUrls = await prisma.villaImage.count({
      where: { url: { startsWith: '/optimized-villas' } }
    });
    
    const total = await prisma.villaImage.count();
    
    console.log('📊 URL Statistics:');
    console.log(`   Total images: ${total}`);
    console.log(`   Supabase URLs: ${supabaseUrls}`);
    console.log(`   Local URLs: ${localUrls}`);
    console.log(`   Other URLs: ${total - supabaseUrls - localUrls}`);
    
    // Show samples
    console.log('\n🔍 Sample Supabase URL:');
    const supabaseSample = await prisma.villaImage.findFirst({
      where: { url: { startsWith: 'https://apyrnttbxpountnopuoq.supabase.co' } }
    });
    console.log(supabaseSample?.url || 'None found');
    
    console.log('\n🔍 Sample Local URL:');
    const localSample = await prisma.villaImage.findFirst({
      where: { url: { startsWith: '/optimized-villas' } }
    });
    console.log(localSample?.url || 'None found');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkURLs();

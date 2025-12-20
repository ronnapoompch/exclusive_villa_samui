const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

async function testImageLoad() {
  try {
    // Get a Supabase image URL
    const image = await prisma.villaImage.findFirst({
      where: { 
        url: { startsWith: 'https://apyrnttbxpountnopuoq.supabase.co' } 
      }
    });
    
    if (!image) {
      console.log('❌ No Supabase URLs found in database');
      return;
    }
    
    console.log('🔍 Testing image URL:', image.url);
    
    // Test if image loads
    https.get(image.url, (res) => {
      console.log('📊 Status Code:', res.statusCode);
      console.log('📦 Content-Type:', res.headers['content-type']);
      console.log('📏 Content-Length:', res.headers['content-length']);
      
      if (res.statusCode === 200) {
        console.log('✅ Image loads successfully!');
      } else {
        console.log('❌ Image failed to load');
      }
      
      prisma.$disconnect();
    }).on('error', (err) => {
      console.log('❌ Error:', err.message);
      prisma.$disconnect();
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

testImageLoad();

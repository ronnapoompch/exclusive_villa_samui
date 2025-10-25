const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const imageCollections = {
  // Villa images from Unsplash - Professional villa/hotel photography
  modern_luxury: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop&crop=center',
  ],
  tropical_beachfront: [
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1200&h=800&fit=crop&crop=center',
  ],
  garden_paradise: [
    'https://images.unsplash.com/photo-1602391833977-358a52198938?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1586092670192-20661fc26b1c?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&h=800&fit=crop&crop=center',
  ],
  hillside_views: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1625244724120-1fd1d34d00bb?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1504730030853-efa6973eab9b?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=1200&h=800&fit=crop&crop=center',
  ],
  boutique_luxury: [
    'https://images.unsplash.com/photo-1596725823066-8aeba0ac0df6?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1590725175042-5d047284d317?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&h=800&fit=crop&crop=center',
  ]
};

function getRandomImageSet() {
  const collections = Object.values(imageCollections);
  const randomCollection = collections[Math.floor(Math.random() * collections.length)];
  
  // Shuffle and return 6-10 images
  const shuffled = [...randomCollection].sort(() => Math.random() - 0.5);
  const count = Math.floor(Math.random() * 5) + 6; // 6-10 images
  return shuffled.slice(0, count);
}

async function updateVillaImages() {
  try {
    console.log('🖼️  Starting villa images update...');
    
    // Get all villas
    const villas = await prisma.villa.findMany({
      select: { id: true, name: true }
    });

    console.log(`📋 Found ${villas.length} villas to update`);

    // Update each villa with multiple images
    for (let i = 0; i < villas.length; i++) {
      const villa = villas[i];
      const images = getRandomImageSet();
      
      await prisma.villa.update({
        where: { id: villa.id },
        data: { images: images }
      });
      
      console.log(`✅ Updated ${villa.name} with ${images.length} images`);
    }

    console.log('🎉 Successfully updated all villa images!');
    
  } catch (error) {
    console.error('❌ Error updating villa images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateVillaImages();
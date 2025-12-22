// Export all villas with Vercel Blob URLs for production import
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportVillaData() {
  try {
    console.log('📦 Exporting villa data with Vercel Blob URLs...\n');

    // Get all villas with images and pricing
    const villas = await prisma.villa.findMany({
      include: {
        villaImages: {
          orderBy: [
            { isHero: 'desc' },
            { order: 'asc' }
          ]
        },
        pricing: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Exported ${villas.length} villas`);
    console.log(`📸 Total images: ${villas.reduce((sum, v) => sum + v.villaImages.length, 0)}`);

    // Save to JSON file
    const exportData = {
      exportDate: new Date().toISOString(),
      totalVillas: villas.length,
      totalImages: villas.reduce((sum, v) => sum + v.villaImages.length, 0),
      villas: villas
    };

    fs.writeFileSync(
      'export-villa-data.json',
      JSON.stringify(exportData, null, 2)
    );

    console.log('\n✅ Export complete!');
    console.log('📁 File saved: export-villa-data.json');
    
    // Show sample data
    const sample = villas[0];
    console.log(`\n📝 Sample villa: ${sample.name}`);
    console.log(`   Images: ${sample.villaImages.length}`);
    if (sample.villaImages.length > 0) {
      console.log(`   First image: ${sample.villaImages[0].url.substring(0, 80)}...`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportVillaData();

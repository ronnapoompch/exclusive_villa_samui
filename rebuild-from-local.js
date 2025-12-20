const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(__dirname, 'public', 'optimized-villas');

async function rebuildFromLocal() {
  console.log('🔄 Rebuilding database from local files...\n');
  
  try {
    // Delete all existing records
    console.log('🗑️  Deleting existing records...');
    await prisma.villaImage.deleteMany({});
    console.log('✅ Deleted\n');
    
    // Get all villas
    const villas = await prisma.villa.findMany();
    console.log(`📊 Processing ${villas.length} villas...\n`);
    
    let totalCreated = 0;
    
    for (const villa of villas) {
      const villaDir = path.join(PUBLIC_DIR, villa.slug);
      
      if (!fs.existsSync(villaDir)) {
        continue;
      }
      
      // Get category folders
      const categories = fs.readdirSync(villaDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      
      let villaImageCount = 0;
      
      for (const category of categories) {
        const categoryDir = path.join(villaDir, category);
        const files = fs.readdirSync(categoryDir)
          .filter(f => f.endsWith('.webp'));
        
        for (const file of files) {
          const url = `/optimized-villas/${villa.slug}/${category}/${file}`;
          
          await prisma.villaImage.create({
            data: {
              villaId: villa.id,
              url: url,
              category: category,
              order: villaImageCount,
              isHero: category === 'hero' && villaImageCount === 0
            }
          });
          
          totalCreated++;
          villaImageCount++;
        }
      }
      
      if (villaImageCount > 0) {
        console.log(`✅ ${villa.slug}: ${villaImageCount} images`);
      }
    }
    
    console.log(`\n✅ Rebuild complete!`);
    console.log(`   Total images: ${totalCreated}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

rebuildFromLocal();

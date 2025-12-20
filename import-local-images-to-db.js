const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

console.log('🚀 Starting local image import to database...\n');

const IMAGES_DIR = path.join(__dirname, 'public', 'optimized-villas');
const CATEGORY_MAP = {
  'hero': 'hero',
  'ext': 'exterior',
  'liv': 'living',
  'bed1': 'bedroom',
  'bed2-5': 'bedroom',
  'bath1': 'bathroom',
  'bath2-5': 'bathroom',
  'kit': 'kitchen',
  'din': 'dining',
  'pool': 'pool',
  'amen': 'amenities',
  'view': 'view'
};

// Get file size
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return null;
  }
}

// Scan villa folder for images
function scanVillaImages(villaSlug) {
  const villaPath = path.join(IMAGES_DIR, villaSlug);
  const images = [];

  if (!fs.existsSync(villaPath)) {
    return images;
  }

  try {
    const categories = fs.readdirSync(villaPath).filter(item => {
      const itemPath = path.join(villaPath, item);
      return fs.statSync(itemPath).isDirectory();
    });

    categories.forEach(category => {
      const categoryPath = path.join(villaPath, category);
      const files = fs.readdirSync(categoryPath);

      files.forEach((file, index) => {
        if (file.match(/\.(webp|jpg|jpeg|png)$/i)) {
          const filePath = path.join(categoryPath, file);
          const fileSize = getFileSize(filePath);
          const url = `/optimized-villas/${villaSlug}/${category}/${file}`;
          const mappedCategory = CATEGORY_MAP[category] || category;

          images.push({
            url,
            category: mappedCategory,
            order: index,
            format: path.extname(file).substring(1).toLowerCase(),
            size: fileSize,
            isHero: category === 'hero' && index === 0,
            altText: `${villaSlug.replace(/-/g, ' ')} - ${mappedCategory} ${index + 1}`
          });
        }
      });
    });
  } catch (error) {
    console.error(`❌ Error scanning ${villaSlug}:`, error.message);
  }

  return images;
}

async function importImages() {
  try {
    // Get all villas from database
    const villas = await prisma.villa.findMany({
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    console.log(`📊 Found ${villas.length} villas in database\n`);

    let totalImported = 0;
    let villasWithImages = 0;
    let villasWithoutImages = 0;

    for (const villa of villas) {
      const images = scanVillaImages(villa.slug);

      if (images.length > 0) {
        console.log(`✅ ${villa.name} (${villa.slug})`);
        console.log(`   Found ${images.length} images`);

        // Delete existing images for this villa
        await prisma.villaImage.deleteMany({
          where: { villaId: villa.id }
        });

        // Insert images
        for (const image of images) {
          await prisma.villaImage.create({
            data: {
              villaId: villa.id,
              ...image
            }
          });
        }

        totalImported += images.length;
        villasWithImages++;
        console.log(`   ✓ Imported ${images.length} images\n`);
      } else {
        console.log(`⚠️  ${villa.name} (${villa.slug}) - No local images found\n`);
        villasWithoutImages++;
      }
    }

    console.log('='.repeat(60));
    console.log('\n📈 Import Summary:\n');
    console.log(`Total villas: ${villas.length}`);
    console.log(`✅ Villas with images: ${villasWithImages}`);
    console.log(`⚠️  Villas without images: ${villasWithoutImages}`);
    console.log(`📸 Total images imported: ${totalImported}`);
    console.log(`📊 Average images per villa: ${(totalImported / villasWithImages).toFixed(1)}`);

    // Verify import
    console.log('\n🔍 Verifying import...');
    const imageCount = await prisma.villaImage.count();
    console.log(`✅ Database contains ${imageCount} images`);

    // Show sample
    const sampleVilla = await prisma.villa.findFirst({
      where: {
        villaImages: {
          some: {}
        }
      },
      include: {
        villaImages: {
          take: 5,
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (sampleVilla) {
      console.log(`\n📝 Sample: ${sampleVilla.name}`);
      console.log(`   Images in database: ${sampleVilla.villaImages.length}`);
      sampleVilla.villaImages.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.category} - ${img.url}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importImages()
  .then(() => {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });

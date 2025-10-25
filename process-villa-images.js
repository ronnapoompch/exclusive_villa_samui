#!/usr/bin/env node
// Professional Villa Image Processing System
const fs = require('fs');
const path = require('path');

console.log('🏖️  EXCLUSIVE VILLA SAMUI - Image Processing System');
console.log('=' .repeat(80));

const VILLA_IMAGES_PATH = 'C:\\Users\\ronna\\exclusive-villa-samui\\src\\data\\Villla Images';
const OUTPUT_PATH = 'src/data/villa-images.json';

// Room Type Mapping for Professional Organization
const ROOM_TYPE_MAPPING = {
  'hero': { name: 'Hero Shots', order: 1, description: 'Main showcase images' },
  'ext': { name: 'Exterior', order: 2, description: 'Villa exterior and facade' },
  'liv': { name: 'Living Room', order: 3, description: 'Main living areas' },
  'din': { name: 'Dining', order: 4, description: 'Dining room and areas' },
  'kit': { name: 'Kitchen', order: 5, description: 'Kitchen and cooking areas' },
  'bed1': { name: 'Master Bedroom', order: 6, description: 'Primary bedroom suite' },
  'bed2': { name: 'Bedroom 2', order: 7, description: 'Secondary bedroom' },
  'bed3': { name: 'Bedroom 3', order: 8, description: 'Third bedroom' },
  'bed4': { name: 'Bedroom 4', order: 9, description: 'Fourth bedroom' },
  'bed5': { name: 'Bedroom 5', order: 10, description: 'Fifth bedroom' },
  'bath1': { name: 'Master Bathroom', order: 11, description: 'Primary bathroom' },
  'bath2': { name: 'Bathroom 2', order: 12, description: 'Secondary bathroom' },
  'bath3': { name: 'Bathroom 3', order: 13, description: 'Third bathroom' },
  'bath4': { name: 'Bathroom 4', order: 14, description: 'Fourth bathroom' },
  'pool': { name: 'Pool Area', order: 15, description: 'Swimming pool and deck' },
  'view': { name: 'Views', order: 16, description: 'Scenic views and vistas' },
  'amen': { name: 'Amenities', order: 17, description: 'Special features and amenities' }
};

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function generateSlug(villaName) {
  return villaName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .trim();
}

function categorizeImage(filename) {
  const name = filename.toLowerCase();
  
  // Try to detect room type from filename
  for (const [code, info] of Object.entries(ROOM_TYPE_MAPPING)) {
    if (name.includes(code)) {
      return { type: code, ...info };
    }
  }
  
  // Fallback categorization based on keywords
  if (name.includes('bedroom') || name.includes('bed')) return ROOM_TYPE_MAPPING['bed1'];
  if (name.includes('bathroom') || name.includes('bath')) return ROOM_TYPE_MAPPING['bath1'];
  if (name.includes('living') || name.includes('lounge')) return ROOM_TYPE_MAPPING['liv'];
  if (name.includes('kitchen') || name.includes('cook')) return ROOM_TYPE_MAPPING['kit'];
  if (name.includes('dining') || name.includes('eat')) return ROOM_TYPE_MAPPING['din'];
  if (name.includes('pool') || name.includes('swim')) return ROOM_TYPE_MAPPING['pool'];
  if (name.includes('exterior') || name.includes('outside') || name.includes('front')) return ROOM_TYPE_MAPPING['ext'];
  if (name.includes('view') || name.includes('scenic')) return ROOM_TYPE_MAPPING['view'];
  
  // Default to hero shots
  return ROOM_TYPE_MAPPING['hero'];
}

function processVillaFolder(villaFolderPath, villaName) {
  const villa = {
    id: generateSlug(villaName),
    name: villaName,
    slug: generateSlug(villaName),
    imageCategories: {},
    totalImages: 0,
    heroImage: null,
    processedAt: new Date().toISOString()
  };

  try {
    const items = fs.readdirSync(villaFolderPath);
    let totalImages = 0;

    // Process each item (file or folder)
    items.forEach((item) => {
      const itemPath = path.join(villaFolderPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isFile() && IMAGE_EXTENSIONS.some(ext => item.toLowerCase().endsWith(ext))) {
        // Direct image file in villa folder
        const category = categorizeImage(item);
        const relativePath = `./src/data/Villla Images/${villaName}/${item}`;
        
        if (!villa.imageCategories[category.name]) {
          villa.imageCategories[category.name] = {
            type: category.name,
            order: category.order,
            description: category.description,
            images: []
          };
        }

        const imageData = {
          filename: item,
          path: relativePath,
          url: `/data/Villla Images/${encodeURIComponent(villaName)}/${encodeURIComponent(item)}`,
          category: category.name,
          order: totalImages,
          alt: `${villaName} - ${category.name}`
        };

        villa.imageCategories[category.name].images.push(imageData);
        totalImages++;

        // Set hero image
        if (!villa.heroImage && category.name === 'Hero Shots') {
          villa.heroImage = imageData;
        }

      } else if (stat.isDirectory()) {
        // Subfolder with room type name
        const roomTypeCode = item.toLowerCase();
        let category = null;

        // Find matching room type
        if (ROOM_TYPE_MAPPING[roomTypeCode]) {
          category = ROOM_TYPE_MAPPING[roomTypeCode];
        } else {
          // Try to match partial names
          for (const [code, info] of Object.entries(ROOM_TYPE_MAPPING)) {
            if (roomTypeCode.includes(code) || code.includes(roomTypeCode)) {
              category = info;
              break;
            }
          }
        }

        if (!category) {
          category = ROOM_TYPE_MAPPING['hero']; // Default fallback
        }

        // Process images in subfolder
        try {
          const subfolderFiles = fs.readdirSync(itemPath);
          const imageFiles = subfolderFiles.filter(file => 
            IMAGE_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext))
          );

          if (imageFiles.length > 0) {
            if (!villa.imageCategories[category.name]) {
              villa.imageCategories[category.name] = {
                type: category.name,
                order: category.order,
                description: category.description,
                images: []
              };
            }

            imageFiles.forEach((filename) => {
              const imageData = {
                filename,
                path: `./src/data/Villla Images/${villaName}/${item}/${filename}`,
                url: `/data/Villla Images/${encodeURIComponent(villaName)}/${encodeURIComponent(item)}/${encodeURIComponent(filename)}`,
                category: category.name,
                roomType: roomTypeCode,
                order: totalImages,
                alt: `${villaName} - ${category.name}`
              };

              villa.imageCategories[category.name].images.push(imageData);
              totalImages++;

              // Set hero image (prioritize hero folder)
              if (!villa.heroImage && (roomTypeCode === 'hero' || category.name === 'Hero Shots')) {
                villa.heroImage = imageData;
              }
            });
          }
        } catch (subError) {
          console.warn(`⚠️  Could not process subfolder ${item} in ${villaName}:`, subError.message);
        }
      }
    });

    console.log(`📸 Processing ${villaName}: ${totalImages} images`);
    villa.totalImages = totalImages;
    
    // Convert to array and sort by order
    villa.sortedCategories = Object.values(villa.imageCategories)
      .sort((a, b) => a.order - b.order);

    return villa;

  } catch (error) {
    console.error(`❌ Error processing ${villaName}:`, error.message);
    return null;
  }
}

function processAllVillas() {
  const startTime = Date.now();
  console.log(`🔄 Starting image processing from: ${VILLA_IMAGES_PATH}`);
  
  try {
    const villaFolders = fs.readdirSync(VILLA_IMAGES_PATH);
    const processedVillas = [];
    let totalImages = 0;

    console.log(`📁 Found ${villaFolders.length} villa folders\n`);

    villaFolders.forEach((folderName, index) => {
      const folderPath = path.join(VILLA_IMAGES_PATH, folderName);
      
      if (fs.statSync(folderPath).isDirectory()) {
        const villa = processVillaFolder(folderPath, folderName);
        if (villa) {
          processedVillas.push(villa);
          totalImages += villa.totalImages;
          
          // Progress indicator
          const progress = Math.round(((index + 1) / villaFolders.length) * 100);
          process.stdout.write(`\r🔄 Progress: ${progress}% (${index + 1}/${villaFolders.length})`);
        }
      }
    });

    console.log('\n');

    // Create final data structure
    const villaImageData = {
      metadata: {
        totalVillas: processedVillas.length,
        totalImages: totalImages,
        processedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        roomTypes: ROOM_TYPE_MAPPING
      },
      villas: processedVillas
    };

    // Write to JSON file
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(villaImageData, null, 2), 'utf8');

    // Summary Report
    console.log('\n' + '=' .repeat(80));
    console.log('📊 PROCESSING COMPLETE - SUMMARY REPORT');
    console.log('=' .repeat(80));
    console.log(`✅ Villas Processed: ${processedVillas.length}`);
    console.log(`✅ Total Images: ${totalImages}`);
    console.log(`✅ Average Images per Villa: ${Math.round(totalImages / processedVillas.length)}`);
    console.log(`✅ Processing Time: ${(Date.now() - startTime) / 1000}s`);
    console.log(`✅ Output File: ${OUTPUT_PATH}`);

    // Top villas by image count
    const topVillas = processedVillas
      .sort((a, b) => b.totalImages - a.totalImages)
      .slice(0, 5);

    console.log('\n🏆 Top 5 Villas by Image Count:');
    topVillas.forEach((villa, index) => {
      console.log(`${index + 1}. ${villa.name}: ${villa.totalImages} images`);
    });

    // Room type distribution
    const roomTypeStats = {};
    processedVillas.forEach(villa => {
      Object.values(villa.imageCategories).forEach(category => {
        if (!roomTypeStats[category.type]) {
          roomTypeStats[category.type] = 0;
        }
        roomTypeStats[category.type] += category.images.length;
      });
    });

    console.log('\n📸 Room Type Distribution:');
    Object.entries(roomTypeStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`${type}: ${count} images`);
      });

    console.log('\n🚀 Ready for Integration with Villa System!');
    console.log('=' .repeat(80));

    return villaImageData;

  } catch (error) {
    console.error('❌ Processing failed:', error);
    return null;
  }
}

// Run the processing
if (require.main === module) {
  processAllVillas();
}

module.exports = { processAllVillas, ROOM_TYPE_MAPPING };
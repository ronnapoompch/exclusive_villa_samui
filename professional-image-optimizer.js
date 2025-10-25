// Professional Image Optimization System
// ระบบ Optimize รูปภาพแบบมืออาชีพ
require('dotenv').config({ path: '.env.local' });
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('🔑 Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***configured' : 'MISSING'
});

const CONFIG = {
  // Paths
  excelPath: path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx'),
  sourceDir: path.join(__dirname, 'data', 'Villla Data (New)'),
  outputDir: path.join(__dirname, 'public', 'optimized-villas'),
  
  // Image optimization settings
  optimization: {
    // Different sizes for different use cases
    hero: { width: 1920, height: 1080, quality: 90 },      // Full hero images
    gallery: { width: 1200, height: 900, quality: 85 },    // Gallery/lightbox
    thumbnail: { width: 400, height: 300, quality: 80 },   // List/card thumbnails
    
    // WebP settings
    webp: {
      quality: 85,
      effort: 4,  // 0-6, higher = better compression but slower
      lossless: false
    },
    
    // JPEG fallback
    jpeg: {
      quality: 85,
      progressive: true,
      mozjpeg: true
    }
  },
  
  // Upload settings
  upload: {
    batchSize: 3,  // Upload 3 images at a time
    delayMs: 800,  // Delay between batches
    retryAttempts: 2,
    retryDelay: 2000
  }
};

// ===== UTILITIES =====
function sanitizeSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function sanitizePublicId(str) {
  return str
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^\w\-\/]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== EXCEL PROCESSING =====
function readVillaData() {
  console.log('📖 Reading Excel data...\n');
  
  const workbook = XLSX.readFile(CONFIG.excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return data.map((row, index) => {
    const villaName = (row['NEW NAME (IN CASE CAN USE)'] || row['VILLAS REAL NAME'] || '').trim();
    const bedrooms = parseInt(row['Bedroom']) || 0;
    
    // Extract prices
    const monthlyPrices = {
      january: row['JANUARY'],
      february: row['FEBRUARY'],
      march: row['MARCH'],
      april: row['APRIL'],
      may: row['MAY'],
      june: row['JUNE'],
      july: row['JULY'],
      august: row['AUGUST'],
      september: row['SEPTEMBER'],
      october: row['OCTOBER'],
      november: row['NOVEMBER'],
      december: row['DECEMBER']
    };
    
    const prices = Object.values(monthlyPrices)
      .filter(p => p && typeof p === 'string' && p.includes('K'))
      .map(p => parseFloat(p.replace(/[^\d.]/g, '')));
    
    const avgPrice = prices.length > 0 
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 1000)
      : bedrooms * 5000;
    
    return {
      id: index + 1,
      codeId: row['CODE ID.'] || `EXVLSM${String(index + 1).padStart(4, '0')}`,
      name: villaName,
      folderName: villaName,
      slug: sanitizeSlug(villaName),
      bedrooms: bedrooms,
      bathrooms: Math.max(1, bedrooms - 1),
      guests: bedrooms * 2,
      pricePerNight: avgPrice,
      location: row['Location'] || 'Koh Samui',
      isBeachfront: row['Beachfront (*)'] === '*',
      contact: row['Contact / Tel.'] || '',
      airbnbLink: row['Airbnb / Agoda / Booking'] || '',
      locationLink: row['Location Link'] || '',
      monthlyPrice: row['Monthly'] || '',
      monthlyPrices: monthlyPrices
    };
  }).filter(v => v.name);
}

// ===== IMAGE DISCOVERY =====
function discoverImages(villaFolder) {
  const villaPath = path.join(CONFIG.sourceDir, villaFolder);
  
  if (!fs.existsSync(villaPath)) {
    return [];
  }
  
  const images = [];
  const categories = fs.readdirSync(villaPath).filter(item => 
    fs.statSync(path.join(villaPath, item)).isDirectory()
  );
  
  categories.forEach(category => {
    const categoryPath = path.join(villaPath, category);
    const files = fs.readdirSync(categoryPath);
    
    files.forEach(file => {
      if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
        const filePath = path.join(categoryPath, file);
        const stats = fs.statSync(filePath);
        
        images.push({
          category: category,
          filename: file,
          sourcePath: filePath,
          sizeKB: Math.round(stats.size / 1024),
          extension: path.extname(file).toLowerCase()
        });
      }
    });
  });
  
  return images;
}

// ===== IMAGE OPTIMIZATION =====
async function optimizeImage(sourcePath, category) {
  const isHero = category === 'hero' || category === 'ext';
  const config = isHero ? CONFIG.optimization.hero : CONFIG.optimization.gallery;
  
  try {
    // Get file size first
    const fileStats = fs.statSync(sourcePath);
    const originalSize = fileStats.size;
    
    // Get image metadata
    const metadata = await sharp(sourcePath).metadata();
    
    // Only resize if image is larger than target
    const shouldResize = metadata.width > config.width || metadata.height > config.height;
    
    let pipeline = sharp(sourcePath, {
      failOnError: false,
      unlimited: true
    });
    
    // Resize if needed
    if (shouldResize) {
      pipeline = pipeline.resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: 'lanczos3'  // Best quality
      });
    }
    
    // Optimize and convert to WebP
    const webpBuffer = await pipeline
      .webp({
        quality: config.quality,
        effort: CONFIG.optimization.webp.effort,
        lossless: false
      })
      .toBuffer();
    
    return {
      webp: webpBuffer,
      originalSize: originalSize,
      optimizedSize: webpBuffer.length,
      savings: Math.round((1 - webpBuffer.length / originalSize) * 100)
    };
    
  } catch (error) {
    console.error(`   ⚠️  Optimization failed: ${error.message}`);
    return null;
  }
}

// ===== LOCAL SAVE =====
function saveOptimizedImage(buffer, villaSlug, category, filename) {
  const outputPath = path.join(CONFIG.outputDir, villaSlug, category);
  
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  const baseName = path.parse(filename).name;
  const outputFile = path.join(outputPath, `${sanitizePublicId(baseName)}.webp`);
  
  fs.writeFileSync(outputFile, buffer);
  return outputFile;
}

// ===== CLOUDINARY UPLOAD =====
async function uploadToCloudinary(buffer, publicId, retries = 0) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: 'exclusive-villa-samui',
        resource_type: 'image',
        overwrite: false,
        format: 'webp',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' }
        ]
      },
      async (error, result) => {
        if (error) {
          if (retries < CONFIG.upload.retryAttempts) {
            console.log(`   🔄 Retry ${retries + 1}/${CONFIG.upload.retryAttempts}...`);
            await sleep(CONFIG.upload.retryDelay);
            try {
              const retryResult = await uploadToCloudinary(buffer, publicId, retries + 1);
              resolve(retryResult);
            } catch (retryError) {
              reject(retryError);
            }
          } else {
            reject(error);
          }
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
}

// ===== PROCESS SINGLE IMAGE =====
async function processImage(image, villa) {
  const startTime = Date.now();
  
  try {
    // 1. Optimize
    const optimized = await optimizeImage(image.sourcePath, image.category);
    if (!optimized) {
      return { success: false, error: 'Optimization failed' };
    }
    
    // 2. Save locally
    const localPath = saveOptimizedImage(
      optimized.webp,
      villa.slug,
      image.category,
      image.filename
    );
    
    // 3. Upload to Cloudinary
    const publicId = `villas/${sanitizePublicId(villa.slug)}/${image.category}/${sanitizePublicId(path.parse(image.filename).name)}`;
    
    const cloudinaryResult = await uploadToCloudinary(optimized.webp, publicId);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      category: image.category,
      filename: image.filename,
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      localPath: localPath,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      savings: optimized.savings,
      processingTime: processingTime
    };
    
  } catch (error) {
    return {
      success: false,
      category: image.category,
      filename: image.filename,
      error: error.message
    };
  }
}

// ===== PROCESS VILLA =====
async function processVilla(villa, villaIndex, totalVillas) {
  console.log(`\n[${ + 1}/${totalVillas}] ${villa.name}`);
  console.log('─'.repeat(60));
  
  // Discover images
  const images = discoverImages(villa.folderName);
  
  if (images.length === 0) {
    console.log('⚠️  No images found');
    return null;
  }
  
  console.log(`📸 Found ${images.length} images`);
  console.log(`📁 Categories: ${[...new Set(images.map(i => i.category))].join(', ')}\n`);
  
  const results = [];
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processed = 0;
  
  // Process in batches
  for (let i = 0; i < images.length; i += CONFIG.upload.batchSize) {
    const batch = images.slice(i, i + CONFIG.upload.batchSize);
    const batchResults = await Promise.all(
      batch.map(img => processImage(img, villa))
    );
    
    results.push(...batchResults);
    
    batchResults.forEach(result => {
      if (result.success) {
        totalOriginalSize += result.originalSize;
        totalOptimizedSize += result.optimizedSize;
        console.log(`✅ ${result.category}/${result.filename} (${result.savings}% smaller, ${result.processingTime}ms)`);
      } else {
        console.log(`❌ ${result.category}/${result.filename}: ${result.error}`);
      }
    });
    
    processed += batch.length;
    console.log(`   Progress: ${processed}/${images.length}\n`);
    
    if (i + CONFIG.upload.batchSize < images.length) {
      await sleep(CONFIG.upload.delayMs);
    }
  }
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const totalSavings = totalOriginalSize > 0 
    ? Math.round((1 - totalOptimizedSize / totalOriginalSize) * 100)
    : 0;
  
  console.log(`\n📊 Villa Summary:`);
  console.log(`   ✅ Success: ${successful.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  console.log(`   💾 Original: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   ✨ Optimized: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   📉 Savings: ${totalSavings}%`);
  
  return {
    villa: villa,
    results: results,
    stats: {
      total: images.length,
      successful: successful.length,
      failed: failed.length,
      originalSize: totalOriginalSize,
      optimizedSize: totalOptimizedSize,
      savings: totalSavings
    }
  };
}

// ===== GENERATE JSON =====
function generateVillaJSON(villaData) {
  const { villa, results } = villaData;
  
  // Group images by category
  const imagesByCategory = {};
  results.filter(r => r.success).forEach(result => {
    if (!imagesByCategory[result.category]) {
      imagesByCategory[result.category] = [];
    }
    imagesByCategory[result.category].push(result.url);
  });
  
  // Hero image
  const heroImage = imagesByCategory['hero']?.[0] || 
                    imagesByCategory['ext']?.[0] || 
                    results.find(r => r.success)?.url || '';
  
  // Generate amenities
  const amenities = [];
  if (villa.isBeachfront) amenities.push('Beachfront', 'Beach Access');
  if (imagesByCategory['pool']?.length > 0) amenities.push('Private Pool');
  if (imagesByCategory['kit']?.length > 0) amenities.push('Full Kitchen');
  if (imagesByCategory['amen']?.length > 0) amenities.push('Gym', 'Entertainment');
  amenities.push('WiFi', 'Air Conditioning', 'Smart TV', 'Housekeeping');
  
  // Description
  const description = `Experience luxury in this stunning ${villa.bedrooms}-bedroom villa in ${villa.location}, Koh Samui. ${
    villa.isBeachfront ? 'Beachfront location with ocean views.' : 'Prime location with modern amenities.'
  } Accommodates up to ${villa.guests} guests with ${villa.bathrooms} bathrooms, private pool, and elegant furnishings.`;
  
  return {
    id: villa.id,
    codeId: villa.codeId,
    slug: villa.slug,
    name: villa.name,
    location: villa.location,
    bedrooms: villa.bedrooms,
    bathrooms: villa.bathrooms,
    guests: villa.guests,
    pricePerNight: villa.pricePerNight,
    monthlyPrice: villa.monthlyPrice,
    pricesByMonth: villa.monthlyPrices,
    description: description,
    amenities: amenities,
    features: {
      beachfront: villa.isBeachfront,
      pool: (imagesByCategory['pool']?.length || 0) > 0,
      kitchen: (imagesByCategory['kit']?.length || 0) > 0
    },
    contact: villa.contact,
    airbnbLink: villa.airbnbLink,
    locationLink: villa.locationLink,
    image: heroImage,
    hero: imagesByCategory['hero'] || [],
    ext: imagesByCategory['ext'] || [],
    liv: imagesByCategory['liv'] || [],
    bed: imagesByCategory['bed'] || [],
    bed1: imagesByCategory['bed1'] || [],
    'bed2-5': imagesByCategory['bed2-5'] || [],
    bath1: imagesByCategory['bath1'] || [],
    'bath2-5': imagesByCategory['bath2-5'] || [],
    kit: imagesByCategory['kit'] || [],
    din: imagesByCategory['din'] || [],
    pool: imagesByCategory['pool'] || [],
    amen: imagesByCategory['amen'] || [],
    view: imagesByCategory['view'] || [],
    oth: imagesByCategory['oth'] || [],
    gallery: results.filter(r => r.success).map(r => r.url),
    featured: villa.isBeachfront,
    rating: 5.0,
    reviews: 0,
    createdAt: new Date().toISOString()
  };
}

// ===== MAIN EXECUTION =====
async function main(options = {}) {
  const { dryRun = false, limit = null } = options;
  
  console.log('🚀 Professional Image Optimization System');
  if (dryRun) console.log('🧪 DRY RUN MODE');
  console.log('═'.repeat(60));
  console.log(`📅 Started: ${new Date().toLocaleString()}\n`);
  
  const startTime = Date.now();
  
  // Read Excel
  let villas = readVillaData();
  
  // Limit for dry run
  if (limit && limit < villas.length) {
    console.log(`🧪 Dry Run: Processing only ${limit} villas (out of ${villas.length})\n`);
    villas = villas.slice(0, limit);
  } else {
    console.log(`✅ Loaded ${villas.length} villas from Excel\n`);
  }
  
  const allResults = [];
  const allVillaData = [];
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  // Process each villa
  for (let i = 0; i < villas.length; i++) {
    const result = await processVilla(villas[i], i, villas.length);
    
    if (result) {
      allResults.push(result);
      totalOriginal += result.stats.originalSize;
      totalOptimized += result.stats.optimizedSize;
      
      const villaJSON = generateVillaJSON(result);
      allVillaData.push(villaJSON);
    }
  }
  
  // Save JSON
  console.log('\n' + '═'.repeat(60));
  console.log('💾 Saving data...\n');
  
  const outputJSON = path.join(__dirname, 'data', 'villas-optimized.json');
  fs.writeFileSync(outputJSON, JSON.stringify(allVillaData, null, 2));
  console.log(`✅ Saved: ${outputJSON}`);
  
  const bySlug = {};
  allVillaData.forEach(v => { bySlug[v.slug] = v; });
  fs.writeFileSync(
    outputJSON.replace('.json', '-by-slug.json'),
    JSON.stringify(bySlug, null, 2)
  );
  console.log(`✅ Saved: villas-optimized-by-slug.json`);
  
  // Process log
  fs.writeFileSync(
    path.join(__dirname, 'optimization-report.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      duration: Math.round((Date.now() - startTime) / 1000),
      villas: allResults.map(r => ({
        name: r.villa.name,
        images: r.stats.total,
        successful: r.stats.successful,
        failed: r.stats.failed,
        savings: r.stats.savings
      })),
      summary: {
        totalVillas: villas.length,
        processedVillas: allResults.length,
        totalImages: allResults.reduce((sum, r) => sum + r.stats.total, 0),
        successfulImages: allResults.reduce((sum, r) => sum + r.stats.successful, 0),
        failedImages: allResults.reduce((sum, r) => sum + r.stats.failed, 0),
        originalSizeMB: (totalOriginal / 1024 / 1024).toFixed(2),
        optimizedSizeMB: (totalOptimized / 1024 / 1024).toFixed(2),
        totalSavings: Math.round((1 - totalOptimized / totalOriginal) * 100)
      }
    }, null, 2)
  );
  console.log(`✅ Saved: optimization-report.json`);
  
  // Final summary
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 OPTIMIZATION COMPLETE!\n');
  console.log(`📊 Summary:`);
  console.log(`   Villas: ${allResults.length}/${villas.length}`);
  console.log(`   Images: ${allResults.reduce((s, r) => s + r.stats.successful, 0)}/${allResults.reduce((s, r) => s + r.stats.total, 0)}`);
  console.log(`   Original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Optimized: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Savings: ${Math.round((1 - totalOptimized / totalOriginal) * 100)}%`);
  console.log(`   Time: ${Math.round((Date.now() - startTime) / 1000 / 60)} minutes`);
  console.log(`\n💾 Local files: public/optimized-villas/`);
  console.log(`☁️  Cloudinary: exclusive-villa-samui/villas/`);
  console.log('\n' + '═'.repeat(60));
}

// Run
if (require.main === module) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('--test');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : (isDryRun ? 3 : null);
  
  main({ dryRun: isDryRun, limit }).catch(console.error);
}

module.exports = { main };

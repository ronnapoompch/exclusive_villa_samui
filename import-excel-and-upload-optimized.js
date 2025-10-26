// Import Excel, Optimize Images, Upload to Cloudinary, Generate JSON
const XLSX = require('xlsx');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const EXCEL_PATH = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');
const IMAGES_DIR = path.join(__dirname, 'data', 'Villla Data (New)');
const OUTPUT_DIR = path.join(__dirname, 'public', 'optimized-villas');
const OUTPUT_JSON = path.join(__dirname, 'data', 'villas-from-excel.json');
const BATCH_SIZE = 5; // Upload 5 images at a time
const DELAY_MS = 1000; // 1 second delay

// Read Excel and create villa mapping
function readExcelData() {
  console.log('📖 Reading Excel file...\n');
  
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Get raw data with formatting preserved
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });
  
  console.log(`✅ Found ${data.length} rows in Excel\n`);
  
  return data.map((row, index) => {
    // Use NEW NAME directly as it matches folder names
    const villaName = (row['NEW NAME (IN CASE CAN USE)'] || row['VILLAS REAL NAME'] || '').trim();
    const folderName = villaName; // Folder names match NEW NAME exactly
    
    // Extract bedrooms - handle range like "3-4" or single number
    let bedroomsRaw = String(row['Bedroom'] || '0').trim();
    let bedrooms = 0;
    
    if (bedroomsRaw.includes('-')) {
      // Range like "3-4" - take the maximum
      const parts = bedroomsRaw.split('-').map(p => parseInt(p.trim()));
      bedrooms = Math.max(...parts.filter(n => !isNaN(n)));
    } else {
      bedrooms = parseInt(bedroomsRaw) || 0;
    }
    
    // Validate bedrooms (reject unrealistic values)
    if (bedrooms > 50 || bedrooms < 0) {
      console.warn(`⚠️  Invalid bedrooms for ${villaName}: ${bedroomsRaw} - using 3 as default`);
      bedrooms = 3;
    }
    
    // Extract PAX (guests) if available
    let guests = bedrooms * 2; // Default: bedrooms * 2
    const paxRaw = String(row['PAX'] || '').trim();
    if (paxRaw) {
      // PAX format: "12-14 PAX" or "10 PAX"
      const paxMatch = paxRaw.match(/(\d+)(?:-(\d+))?/);
      if (paxMatch) {
        guests = parseInt(paxMatch[2] || paxMatch[1]); // Use max if range
      }
    }
    
    // Calculate bathrooms (estimate: bedrooms - 1, minimum 1)
    const bathrooms = Math.max(1, bedrooms - 1);
    
    // Extract location
    const location = row['Location'] || 'Koh Samui';
    
    // Extract prices from months
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
    
    // Calculate average price (from available months)
    const prices = Object.values(monthlyPrices)
      .filter(p => p && typeof p === 'string' && p.includes('K'))
      .map(p => parseFloat(p.replace(/[^\d.]/g, '')));
    
    const avgPrice = prices.length > 0 
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 1000)
      : bedrooms * 5000; // Fallback: 5000 THB per bedroom
    
    // Extract beachfront status
    const isBeachfront = row['Beachfront (*)'] === '*';
    
    return {
      id: index + 1,
      codeId: row['CODE ID.'] || `EXVLSM${String(index + 1).padStart(4, '0')}`,
      villaName: villaName.trim(),
      folderName: folderName.trim(),
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      guests: guests,
      pricePerNight: avgPrice,
      location: location,
      isBeachfront: isBeachfront,
      contact: row['Contact / Tel.'] || '',
      airbnbLink: row['Airbnb / Agoda / Booking'] || '',
      locationLink: row['Location Link'] || '',
      monthlyPrice: row['Monthly'] || '',
      monthlyPrices: monthlyPrices,
      slug: ''
    };
  });
}

// Create slug from villa name
function createSlug(villaName) {
  return villaName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Sanitize for Cloudinary public_id
function sanitizePublicId(str) {
  return str
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^\w\-\/]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Get all images from villa folder
function getVillaImages(folderName) {
  const villaPath = path.join(IMAGES_DIR, folderName);
  
  if (!fs.existsSync(villaPath)) {
    console.log(`⚠️  Folder not found: ${folderName}`);
    return [];
  }
  
  const images = [];
  const categories = fs.readdirSync(villaPath).filter(cat => {
    return fs.statSync(path.join(villaPath, cat)).isDirectory();
  });
  
  categories.forEach(category => {
    const categoryPath = path.join(villaPath, category);
    const files = fs.readdirSync(categoryPath);
    
    files.forEach(file => {
      if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
        images.push({
          originalPath: path.join(categoryPath, file),
          category: category,
          filename: file,
          villaFolder: folderName
        });
      }
    });
  });
  
  return images;
}

// Optimize image with sharp
async function optimizeImage(imagePath) {
  const buffer = await sharp(imagePath)
    .resize(1200, 900, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 85 })
    .toBuffer();
  
  return buffer;
}

// Upload optimized image to Cloudinary
async function uploadToCloudinary(imageBuffer, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: 'exclusive-villa-samui',
        resource_type: 'image',
        overwrite: false,
        invalidate: true,
        format: 'webp',
        transformation: [
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    uploadStream.end(imageBuffer);
  });
}

// Process single image: optimize + save locally + upload
async function processImage(imageInfo, villaName) {
  try {
    // Optimize
    const optimizedBuffer = await optimizeImage(imageInfo.originalPath);
    
    // Create Cloudinary public_id
    const sanitizedVillaName = sanitizePublicId(villaName);
    const sanitizedCategory = sanitizePublicId(imageInfo.category);
    const fileWithoutExt = path.parse(imageInfo.filename).name;
    const sanitizedFilename = sanitizePublicId(fileWithoutExt);
    
    const publicId = `villas/${sanitizedVillaName}/${sanitizedCategory}/${sanitizedFilename}`;
    
    // Save optimized image locally
    const localOutputPath = path.join(OUTPUT_DIR, sanitizedVillaName, sanitizedCategory);
    if (!fs.existsSync(localOutputPath)) {
      fs.mkdirSync(localOutputPath, { recursive: true });
    }
    const localFilePath = path.join(localOutputPath, `${sanitizedFilename}.webp`);
    fs.writeFileSync(localFilePath, optimizedBuffer);
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(optimizedBuffer, publicId);
    
    console.log(`✅ ${villaName}/${imageInfo.category}/${imageInfo.filename}`);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      category: imageInfo.category,
      originalPath: imageInfo.originalPath,
      optimizedPath: localFilePath
    };
  } catch (error) {
    console.error(`❌ Failed: ${villaName}/${imageInfo.category}/${imageInfo.filename}`, error.message);
    return {
      success: false,
      error: error.message,
      originalPath: imageInfo.originalPath
    };
  }
}

// Process villa images in batches
async function processVillaImages(villa, images) {
  console.log(`\n🏠 Processing: ${villa.villaName} (${images.length} images)`);
  
  const results = [];
  let processed = 0;
  
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(img => processImage(img, villa.villaName))
    );
    
    results.push(...batchResults);
    processed += batch.length;
    
    console.log(`   Progress: ${processed}/${images.length}`);
    
    if (i + BATCH_SIZE < images.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  return results;
}

// Delete original images after successful upload
function deleteOriginalImages(results) {
  console.log('\n� Optimized images saved to public/optimized-villas/');
  console.log('�🗑️  Deleting original images...');
  
  let deleted = 0;
  results.forEach(result => {
    if (result.success && fs.existsSync(result.originalPath)) {
      try {
        fs.unlinkSync(result.originalPath);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete: ${result.originalPath}`);
      }
    }
  });
  
  console.log(`✅ Deleted ${deleted} original images\n`);
}

// Generate villa JSON data
function generateVillaJSON(villa, uploadResults) {
  const slug = createSlug(villa.villaName);
  
  // Group images by category
  const imagesByCategory = {};
  uploadResults.forEach(result => {
    if (result.success) {
      if (!imagesByCategory[result.category]) {
        imagesByCategory[result.category] = [];
      }
      imagesByCategory[result.category].push(result.url);
    }
  });
  
  // Get hero image (first from hero category or first overall)
  const heroImage = imagesByCategory['hero']?.[0] || 
                    imagesByCategory['ext']?.[0] || 
                    uploadResults.find(r => r.success)?.url || '';
  
  // Generate amenities based on available data
  const amenities = [];
  if (villa.isBeachfront) amenities.push('Beachfront', 'Beach Access');
  if (imagesByCategory['pool']?.length > 0) amenities.push('Private Pool');
  if (imagesByCategory['kit']?.length > 0) amenities.push('Full Kitchen');
  if (imagesByCategory['amen']?.length > 0) amenities.push('Gym', 'Entertainment');
  amenities.push('WiFi', 'Air Conditioning', 'Smart TV', 'Daily Housekeeping');
  
  // Generate description
  const description = `Experience luxury living in this stunning ${villa.bedrooms}-bedroom villa located in ${villa.location}, Koh Samui. ${
    villa.isBeachfront ? 'Situated directly on the beach with breathtaking ocean views.' : 'Nestled in a prime location with easy access to beaches and amenities.'
  } This elegant property accommodates up to ${villa.guests} guests and features ${villa.bathrooms} modern bathrooms, a private pool, and high-end furnishings throughout. Perfect for families or groups seeking an unforgettable tropical getaway.`;
  
  return {
    id: villa.id,
    codeId: villa.codeId,
    slug: slug,
    name: villa.villaName,
    location: villa.location,
    bedrooms: parseInt(villa.bedrooms) || 0,
    bathrooms: parseInt(villa.bathrooms) || 0,
    guests: parseInt(villa.guests) || 0,
    pricePerNight: parseFloat(villa.pricePerNight) || 0,
    monthlyPrice: villa.monthlyPrice,
    pricesByMonth: villa.monthlyPrices,
    description: description,
    amenities: amenities,
    features: {
      beachfront: villa.isBeachfront,
      pool: imagesByCategory['pool']?.length > 0,
      kitchen: imagesByCategory['kit']?.length > 0,
      gym: imagesByCategory['amen']?.length > 0
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
    gallery: uploadResults.filter(r => r.success).map(r => r.url),
    featured: villa.isBeachfront, // Feature beachfront villas
    rating: 5.0,
    reviews: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Main execution
async function main() {
  console.log('🚀 Starting Villa Import & Upload Process\n');
  console.log('=' .repeat(60));
  
  // Read Excel
  const villas = readExcelData();
  console.log(`📊 Processing ${villas.length} villas\n`);
  
  const allVillaData = [];
  const processLog = [];
  
  let totalImages = 0;
  let successfulUploads = 0;
  let failedUploads = 0;
  
  // Process each villa
  for (let i = 0; i < villas.length; i++) {
    const villa = villas[i];
    
    console.log(`\n[${ + 1}/${villas.length}] ${villa.villaName}`);
    console.log('-'.repeat(60));
    
    // Get images from folder
    const images = getVillaImages(villa.folderName);
    
    if (images.length === 0) {
      console.log(`⚠️  No images found, skipping...`);
      processLog.push({
        villa: villa.villaName,
        folder: villa.folderName,
        status: 'no_images',
        images: 0
      });
      continue;
    }
    
    totalImages += images.length;
    
    // Process images (optimize + upload)
    const uploadResults = await processVillaImages(villa, images);
    
    const successful = uploadResults.filter(r => r.success).length;
    const failed = uploadResults.filter(r => !r.success).length;
    
    successfulUploads += successful;
    failedUploads += failed;
    
    // Delete originals
    deleteOriginalImages(uploadResults);
    
    // Generate JSON
    const villaData = generateVillaJSON(villa, uploadResults);
    allVillaData.push(villaData);
    
    processLog.push({
      villa: villa.villaName,
      folder: villa.folderName,
      status: 'completed',
      images: images.length,
      uploaded: successful,
      failed: failed
    });
    
    console.log(`✅ Villa completed: ${successful} uploaded, ${failed} failed`);
  }
  
  // Save JSON files
  console.log('\n' + '='.repeat(60));
  console.log('💾 Saving JSON data...\n');
  
  // Array format
  fs.writeFileSync(
    OUTPUT_JSON,
    JSON.stringify(allVillaData, null, 2)
  );
  console.log(`✅ Saved: ${OUTPUT_JSON}`);
  
  // Object format (by slug)
  const villasBySlug = {};
  allVillaData.forEach(villa => {
    villasBySlug[villa.slug] = villa;
  });
  
  const objectJsonPath = OUTPUT_JSON.replace('.json', '-by-slug.json');
  fs.writeFileSync(
    objectJsonPath,
    JSON.stringify(villasBySlug, null, 2)
  );
  console.log(`✅ Saved: ${objectJsonPath}`);
  
  // Save process log
  const logPath = path.join(__dirname, 'import-process-log.json');
  fs.writeFileSync(
    logPath,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalVillas: villas.length,
        processedVillas: allVillaData.length,
        totalImages: totalImages,
        successfulUploads: successfulUploads,
        failedUploads: failedUploads
      },
      details: processLog
    }, null, 2)
  );
  console.log(`✅ Saved: ${logPath}`);
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 IMPORT COMPLETE!\n');
  console.log(`📊 Summary:`);
  console.log(`   Villas: ${allVillaData.length}/${villas.length}`);
  console.log(`   Images: ${totalImages}`);
  console.log(`   ✅ Uploaded: ${successfulUploads}`);
  console.log(`   ❌ Failed: ${failedUploads}`);
  console.log(`   � Optimized saved: ${successfulUploads} (public/optimized-villas/)`);
  console.log(`   �🗑️  Originals deleted: ${successfulUploads}`);
  console.log('\n' + '='.repeat(60));
}

// Run
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

const fs = require('fs');
const path = require('path');

// Vercel Blob base URL
const VERCEL_BLOB_BASE = 'https://xkoncnp41eepsysa.public.blob.vercel-storage.com';

/**
 * Convert Cloudinary URL to Vercel Blob URL
 * Example:
 * FROM: https://res.cloudinary.com/dkttxey0z/image/upload/exclusive-villa-samui/villas/5-stars-beachfront-villa/hero/909.webp
 * TO: https://xkoncnp41eepsysa.public.blob.vercel-storage.com/villas/5-stars-beachfront-villa/hero/909.webp
 */
function convertUrlToVercelBlob(url) {
  if (!url || typeof url !== 'string') return url;
  
  // Skip if already Vercel Blob URL
  if (url.includes('blob.vercel-storage.com')) {
    return url;
  }
  
  // Skip if not Cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  // Extract path after 'exclusive-villa-samui/'
  const match = url.match(/exclusive-villa-samui\/(.+)$/);
  if (!match) {
    console.warn(`⚠️  Cannot parse URL: ${url}`);
    return url;
  }
  
  const pathAfterBase = match[1];
  return `${VERCEL_BLOB_BASE}/${pathAfterBase}`;
}

/**
 * Convert all URLs in an array
 */
function convertUrlArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(url => convertUrlToVercelBlob(url));
}

/**
 * Convert all image URLs in a villa object
 */
function convertVillaUrls(villa) {
  const converted = { ...villa };
  
  // Convert single image field
  if (converted.image) {
    converted.image = convertUrlToVercelBlob(converted.image);
  }
  
  // Convert all array fields
  const arrayFields = [
    'hero', 'ext', 'liv', 'bed', 'bed1', 'bed2-5', 
    'bath1', 'bath2-5', 'kit', 'din', 'pool', 
    'amen', 'view', 'oth', 'gallery'
  ];
  
  arrayFields.forEach(field => {
    if (converted[field]) {
      converted[field] = convertUrlArray(converted[field]);
    }
  });
  
  return converted;
}

/**
 * Main conversion function
 */
async function convertJsonFile() {
  const inputFile = path.join(__dirname, 'data', 'villas-optimized.json');
  const outputFile = path.join(__dirname, 'data', 'villas-vercel-blob.json');
  
  console.log('🔄 Starting Cloudinary → Vercel Blob conversion...\n');
  console.log(`📂 Input:  ${inputFile}`);
  console.log(`📂 Output: ${outputFile}\n`);
  
  // Read input file
  let villas;
  try {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    villas = JSON.parse(fileContent);
    console.log(`✅ Loaded ${villas.length} villas from JSON file\n`);
  } catch (error) {
    console.error('❌ Error reading input file:', error.message);
    process.exit(1);
  }
  
  // Convert all villas
  let totalUrlsConverted = 0;
  const convertedVillas = villas.map((villa, index) => {
    const originalJson = JSON.stringify(villa);
    const converted = convertVillaUrls(villa);
    const convertedJson = JSON.stringify(converted);
    
    // Count URLs converted in this villa
    const cloudinaryCount = (originalJson.match(/cloudinary\.com/g) || []).length;
    const vercelBlobCount = (convertedJson.match(/blob\.vercel-storage\.com/g) || []).length;
    const urlsConverted = vercelBlobCount - (JSON.stringify(villa).match(/blob\.vercel-storage\.com/g) || []).length;
    
    totalUrlsConverted += urlsConverted;
    
    if ((index + 1) % 50 === 0 || index === 0) {
      console.log(`🔄 Converted ${index + 1}/${villas.length} villas... (${villa.name})`);
    }
    
    return converted;
  });
  
  // Write output file
  try {
    fs.writeFileSync(outputFile, JSON.stringify(convertedVillas, null, 2), 'utf8');
    console.log(`\n✅ Conversion complete!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total villas: ${convertedVillas.length}`);
    console.log(`   - URLs converted: ${totalUrlsConverted}`);
    console.log(`   - Output file: ${outputFile}`);
    
    // Verify conversion
    const verifyContent = fs.readFileSync(outputFile, 'utf8');
    const cloudinaryRemaining = (verifyContent.match(/cloudinary\.com/g) || []).length;
    const vercelBlobTotal = (verifyContent.match(/blob\.vercel-storage\.com/g) || []).length;
    
    console.log(`\n🔍 Verification:`);
    console.log(`   - Cloudinary URLs remaining: ${cloudinaryRemaining}`);
    console.log(`   - Vercel Blob URLs: ${vercelBlobTotal}`);
    
    if (cloudinaryRemaining === 0) {
      console.log(`\n✅ PERFECT! All Cloudinary URLs converted to Vercel Blob! 🎉`);
    } else {
      console.log(`\n⚠️  Warning: ${cloudinaryRemaining} Cloudinary URLs still remaining`);
    }
    
    // Sample output
    console.log(`\n📝 Sample converted villa (${convertedVillas[0].name}):`);
    console.log(`   - Hero image: ${convertedVillas[0].hero?.[0] || 'N/A'}`);
    console.log(`   - Total images: ${convertedVillas[0].gallery?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error writing output file:', error.message);
    process.exit(1);
  }
}

// Run conversion
convertJsonFile().catch(error => {
  console.error('❌ Conversion failed:', error);
  process.exit(1);
});

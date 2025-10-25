// Test Single Villa Optimization
// ทดสอบ optimize 1 villa ก่อนรันจริง
require('dotenv').config({ path: '.env.local' });
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ===== MAIN ASYNC FUNCTION =====
async function testOptimization() {
  // ===== CONFIGURATION =====
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  console.log('🔧 Testing Configuration:');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'MISSING');
  console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING');
  console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '***configured' : 'MISSING');
  console.log('');

  const CONFIG = {
    excelPath: path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx'),
    sourceDir: path.join(__dirname, 'data', 'Villla Data (New)'),
    outputDir: path.join(__dirname, 'public', 'optimized-villas-test'),
    testVillaIndex: 0  // ทดสอบ villa แรก
  };

  // ===== STEP 1: READ EXCEL =====
  console.log('📖 STEP 1: Reading Excel data...');
  const workbook = XLSX.readFile(CONFIG.excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);

  const testVilla = data[CONFIG.testVillaIndex];
  const villaName = (testVilla['NEW NAME (IN CASE CAN USE)'] || testVilla['VILLAS REAL NAME'] || '').trim();

  console.log(`✅ Found test villa: "${villaName}"`);
  console.log('');

  // ===== STEP 2: CHECK FOLDER =====
  console.log('📁 STEP 2: Checking villa folder...');
  const villaPath = path.join(CONFIG.sourceDir, villaName);

  if (!fs.existsSync(villaPath)) {
    console.error(`❌ ERROR: Villa folder not found: ${villaPath}`);
    process.exit(1);
  }

  console.log(`✅ Folder exists: ${villaPath}`);

  const categories = fs.readdirSync(villaPath).filter(item => 
    fs.statSync(path.join(villaPath, item)).isDirectory()
  );

  console.log(`✅ Found ${categories.length} categories:`, categories.join(', '));
  console.log('');

  // ===== STEP 3: COUNT IMAGES =====
  console.log('📸 STEP 3: Counting images...');
  let totalImages = 0;
  const imagesByCategory = {};

  categories.forEach(category => {
    const categoryPath = path.join(villaPath, category);
    const files = fs.readdirSync(categoryPath).filter(f => 
      f.match(/\.(jpg|jpeg|png|webp)$/i)
    );
    imagesByCategory[category] = files.length;
    totalImages += files.length;
  });

  console.log('Images per category:');
  Object.entries(imagesByCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} images`);
  });
  console.log(`✅ Total: ${totalImages} images`);
  console.log('');

  // ===== STEP 4: TEST OPTIMIZATION =====
  console.log('🔧 STEP 4: Testing image optimization...');

  // หารูปทดสอบ 1 รูป
  let testImage = null;
  for (const category of categories) {
    const categoryPath = path.join(villaPath, category);
    const files = fs.readdirSync(categoryPath).filter(f => 
      f.match(/\.(jpg|jpeg|png|webp)$/i)
    );
    if (files.length > 0) {
      testImage = {
        category,
        filename: files[0],
        path: path.join(categoryPath, files[0])
      };
      break;
    }
  }

  if (!testImage) {
    console.error('❌ No test image found!');
    process.exit(1);
  }

  console.log(`Testing with: ${testImage.category}/${testImage.filename}`);

  const originalStats = fs.statSync(testImage.path);
  console.log(`Original size: ${(originalStats.size / 1024).toFixed(2)} KB`);

  // Optimize
  const optimized = await sharp(testImage.path)
    .resize(1200, 900, {
      fit: 'inside',
      withoutEnlargement: true,
      kernel: 'lanczos3'
    })
    .webp({
      quality: 85,
      effort: 4
    })
    .toBuffer();

  console.log(`Optimized size: ${(optimized.length / 1024).toFixed(2)} KB`);
  console.log(`Savings: ${Math.round((1 - optimized.length / originalStats.size) * 100)}%`);
  console.log('✅ Optimization works!');
  console.log('');

  // ===== STEP 5: TEST SAVE TO LOCAL =====
  console.log('💾 STEP 5: Testing save to local folder...');

  const slug = villaName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const outputPath = path.join(CONFIG.outputDir, slug, testImage.category);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const outputFile = path.join(outputPath, path.parse(testImage.filename).name + '.webp');
  fs.writeFileSync(outputFile, optimized);

  console.log(`✅ Saved to: ${outputFile}`);
  console.log('');

  // ===== STEP 6: TEST CLOUDINARY UPLOAD =====
  console.log('☁️  STEP 6: Testing Cloudinary upload...');

  try {
    const publicId = `test-villas/${slug}/${testImage.category}/${path.parse(testImage.filename).name}`;
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: 'exclusive-villa-samui',
          resource_type: 'image',
          overwrite: true,
          format: 'webp'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(optimized);
    });

    console.log('✅ Upload successful!');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    console.log('');
    
    // ===== STEP 7: CLEANUP TEST UPLOAD =====
    console.log('🧹 STEP 7: Cleaning up test upload...');
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Test upload deleted from Cloudinary');
    console.log('');
    
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }

  // ===== FINAL SUMMARY =====
  console.log('═'.repeat(60));
  console.log('🎉 ALL TESTS PASSED!');
  console.log('═'.repeat(60));
  console.log('');
  console.log('✅ Test Summary:');
  console.log('  1. Excel data reading: OK');
  console.log('  2. Villa folder access: OK');
  console.log(`  3. Image discovery: ${totalImages} images found`);
  console.log('  4. Image optimization: OK');
  console.log('  5. Local file save: OK');
  console.log('  6. Cloudinary upload: OK');
  console.log('  7. Cleanup: OK');
  console.log('');
  console.log('📊 Test Villa Stats:');
  console.log(`  Name: ${villaName}`);
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Total Images: ${totalImages}`);
  console.log(`  Estimated Processing Time: ${Math.round(totalImages * 2 / 60)} minutes`);
  console.log('');
  console.log('✅ System is ready for full optimization!');
  console.log('   Run: node professional-image-optimizer.js');
  console.log('');
}

// Run the test
testOptimization().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

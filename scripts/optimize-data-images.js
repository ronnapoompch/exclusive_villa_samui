const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const INPUT_DIR = path.join(__dirname, '../src/data/Villla Images');
const OUTPUT_DIR = path.join(__dirname, '../public/optimized-data-images');
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY_WEBP = 85;
const QUALITY_JPG = 90;

// Statistics tracking
let stats = {
  totalProcessed: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  errors: 0,
  startTime: Date.now()
};

// Create output directory
function createOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// Get file size
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

// Format file size
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Optimize single image
async function optimizeImage(inputPath, outputPath) {
  try {
    const originalSize = getFileSize(inputPath);
    stats.totalOriginalSize += originalSize;

    // Get image info
    const metadata = await sharp(inputPath).metadata();
    
    // Create WebP version
    const webpPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    await sharp(inputPath)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: QUALITY_WEBP })
      .toFile(webpPath);

    // Create optimized JPG version as fallback
    const jpgPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.jpg');
    await sharp(inputPath)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: QUALITY_JPG, progressive: true })
      .toFile(jpgPath);

    // Create thumbnail version
    const thumbPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '_thumb.webp');
    await sharp(inputPath)
      .resize(400, 300, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    const webpSize = getFileSize(webpPath);
    const jpgSize = getFileSize(jpgPath);
    const thumbSize = getFileSize(thumbPath);
    const totalOptimized = webpSize + jpgSize + thumbSize;

    stats.totalOptimizedSize += totalOptimized;
    stats.totalProcessed++;

    const compression = ((originalSize - totalOptimized) / originalSize * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(inputPath)}`);
    console.log(`  Original: ${formatSize(originalSize)} → WebP: ${formatSize(webpSize)} + JPG: ${formatSize(jpgSize)} + Thumb: ${formatSize(thumbSize)}`);
    console.log(`  Compression: ${compression}% | Resolution: ${metadata.width}x${metadata.height}`);

  } catch (error) {
    stats.errors++;
    console.error(`✗ Error processing ${inputPath}:`, error.message);
  }
}

// Process directory recursively
async function processDirectory(inputDir, outputDir, villaName = '') {
  const items = fs.readdirSync(inputDir);
  
  for (const item of items) {
    const inputPath = path.join(inputDir, item);
    const stat = fs.statSync(inputPath);
    
    if (stat.isDirectory()) {
      // Create corresponding output directory
      const newVillaName = villaName ? `${villaName}/${item}` : item;
      const subOutputDir = path.join(outputDir, item);
      
      if (!fs.existsSync(subOutputDir)) {
        fs.mkdirSync(subOutputDir, { recursive: true });
      }
      
      console.log(`\n📁 Processing villa: ${newVillaName}`);
      await processDirectory(inputPath, subOutputDir, newVillaName);
      
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(item)) {
      // Process image file
      const outputPath = path.join(outputDir, item);
      await optimizeImage(inputPath, outputPath);
    }
  }
}

// Progress display
function displayProgress() {
  const elapsed = (Date.now() - stats.startTime) / 1000;
  const compressionRatio = stats.totalOriginalSize > 0 ? 
    ((stats.totalOriginalSize - stats.totalOptimizedSize) / stats.totalOriginalSize * 100).toFixed(1) : 0;
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 IMAGE OPTIMIZATION PROGRESS');
  console.log('='.repeat(60));
  console.log(`📸 Images Processed: ${stats.totalProcessed}`);
  console.log(`📦 Original Size: ${formatSize(stats.totalOriginalSize)}`);
  console.log(`📦 Optimized Size: ${formatSize(stats.totalOptimizedSize)}`);
  console.log(`💰 Space Saved: ${formatSize(stats.totalOriginalSize - stats.totalOptimizedSize)} (${compressionRatio}%)`);
  console.log(`⏱️  Time Elapsed: ${elapsed.toFixed(1)}s`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log('='.repeat(60));
}

// Main execution
async function main() {
  console.log('🎯 VILLA DATA IMAGE OPTIMIZATION STARTED');
  console.log(`📂 Input: ${INPUT_DIR}`);
  console.log(`📂 Output: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));

  // Check if input directory exists
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Input directory not found: ${INPUT_DIR}`);
    process.exit(1);
  }

  // Create output directory
  createOutputDir();
  
  // Process all images
  await processDirectory(INPUT_DIR, OUTPUT_DIR);
  
  // Final summary
  displayProgress();
  
  if (stats.errors === 0) {
    console.log('\n✅ ALL VILLA IMAGES OPTIMIZED SUCCESSFULLY!');
  } else {
    console.log(`\n⚠️  OPTIMIZATION COMPLETED WITH ${stats.errors} ERRORS`);
  }
  
  // Save optimization report
  const report = {
    timestamp: new Date().toISOString(),
    inputDirectory: INPUT_DIR,
    outputDirectory: OUTPUT_DIR,
    totalProcessed: stats.totalProcessed,
    totalOriginalSize: stats.totalOriginalSize,
    totalOptimizedSize: stats.totalOptimizedSize,
    spaceSaved: stats.totalOriginalSize - stats.totalOptimizedSize,
    compressionRatio: stats.totalOriginalSize > 0 ? 
      ((stats.totalOriginalSize - stats.totalOptimizedSize) / stats.totalOriginalSize * 100) : 0,
    errors: stats.errors,
    processingTime: (Date.now() - stats.startTime) / 1000
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'data-image-optimization-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📊 Report saved: data-image-optimization-report.json');
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Start optimization
main().catch(console.error);
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

const VILLA_IMAGES_DIR = './public/villas';
const OUTPUT_DIR = './public/optimized-villas';
const MAX_WIDTH = 1920;
const THUMBNAIL_WIDTH = 400;
const QUALITY = 80;

class ImageOptimizer {
  constructor() {
    this.processed = 0;
    this.errors = 0;
    this.totalSize = 0;
    this.optimizedSize = 0;
    this.startTime = Date.now();
  }

  async optimize() {
    console.log('🚀 Starting Image Optimization Process...\n');
    
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const villaDirs = fs.readdirSync(VILLA_IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📁 Found ${villaDirs.length} villa directories`);
    
    for (const villaDir of villaDirs.slice(0, 5)) { // Process first 5 for testing
      await this.optimizeVillaImages(villaDir);
    }

    this.printSummary();
  }

  async optimizeVillaImages(villaDir) {
    const villaPath = path.join(VILLA_IMAGES_DIR, villaDir);
    const outputPath = path.join(OUTPUT_DIR, villaDir);

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    console.log(`\n🏡 Processing villa: ${villaDir}`);

    await this.processDirectoryRecursive(villaPath, outputPath, villaDir);
  }

  async processDirectoryRecursive(inputPath, outputPath, villaName) {
    const items = fs.readdirSync(inputPath, { withFileTypes: true });

    for (const item of items) {
      const itemInputPath = path.join(inputPath, item.name);
      
      if (item.isDirectory()) {
        // Process subdirectory
        const itemOutputPath = path.join(outputPath, item.name);
        if (!fs.existsSync(itemOutputPath)) {
          fs.mkdirSync(itemOutputPath, { recursive: true });
        }
        await this.processDirectoryRecursive(itemInputPath, itemOutputPath, villaName);
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
        // Process image file
        await this.optimizeImage(inputPath, outputPath, item.name);
      }
    }
  }

  async optimizeImage(inputDir, outputDir, filename) {
    const inputPath = path.join(inputDir, filename);
    const baseName = path.parse(filename).name;
    
    try {
      const stats = fs.statSync(inputPath);
      this.totalSize += stats.size;

      console.log(`  📸 Processing: ${filename} (${this.formatBytes(stats.size)})`);

      // 1. Create optimized full-size image
      const fullOutputPath = path.join(outputDir, `${baseName}.webp`);
      await sharp(inputPath)
        .resize(MAX_WIDTH, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(fullOutputPath);

      // 2. Create thumbnail
      const thumbOutputPath = path.join(outputDir, `${baseName}-thumb.webp`);
      await sharp(inputPath)
        .resize(THUMBNAIL_WIDTH, Math.round(THUMBNAIL_WIDTH * 0.67), { 
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 75, effort: 4 })
        .toFile(thumbOutputPath);

      // Calculate optimized size
      const fullStats = fs.statSync(fullOutputPath);
      const thumbStats = fs.statSync(thumbOutputPath);
      this.optimizedSize += (fullStats.size + thumbStats.size);

      const compressionRatio = ((stats.size - (fullStats.size + thumbStats.size)) / stats.size * 100);
      
      console.log(`    ✅ Optimized: ${this.formatBytes(fullStats.size + thumbStats.size)} (-${compressionRatio.toFixed(1)}%)`);
      
      this.processed++;
    } catch (error) {
      console.error(`    ❌ Error processing ${filename}:`, error.message);
      this.errors++;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const totalCompression = ((this.totalSize - this.optimizedSize) / this.totalSize * 100);

    console.log('\n' + '='.repeat(60));
    console.log('📊 IMAGE OPTIMIZATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Images processed: ${this.processed}`);
    console.log(`❌ Errors: ${this.errors}`);
    console.log(`📁 Original size: ${this.formatBytes(this.totalSize)}`);
    console.log(`📁 Optimized size: ${this.formatBytes(this.optimizedSize)}`);
    console.log(`💰 Space saved: ${this.formatBytes(this.totalSize - this.optimizedSize)} (${totalCompression.toFixed(1)}%)`);
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log('='.repeat(60));
  }
}

// Run optimization
async function main() {
  const optimizer = new ImageOptimizer();
  await optimizer.optimize();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ImageOptimizer;
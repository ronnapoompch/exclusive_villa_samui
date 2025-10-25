const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Production Image Optimization Script
 * Optimizes all villa images for deployment
 */
class ProductionImageOptimizer {
  constructor() {
    this.config = {
      inputDir: './public/villas',
      outputDir: './public/optimized-villas',
      sizes: {
        thumbnail: { width: 400, height: 267, quality: 75 },
        medium: { width: 800, height: 600, quality: 80 },
        large: { width: 1200, height: 900, quality: 85 },
        hero: { width: 1920, height: 1080, quality: 90 }
      },
      formats: ['webp', 'jpg'], // WebP primary, JPG fallback
      concurrent: 5, // Parallel processing limit
    };
    
    this.stats = {
      processed: 0,
      errors: 0,
      totalOriginalSize: 0,
      totalOptimizedSize: 0,
      startTime: Date.now()
    };
  }

  async optimizeForProduction() {
    console.log('🚀 Starting PRODUCTION Image Optimization...\n');
    console.log(`📝 Configuration:`);
    console.log(`  - Input: ${this.config.inputDir}`);
    console.log(`  - Output: ${this.config.outputDir}`);
    console.log(`  - Sizes: ${Object.keys(this.config.sizes).join(', ')}`);
    console.log(`  - Formats: ${this.config.formats.join(', ')}`);
    console.log(`  - Concurrent: ${this.config.concurrent}\n`);

    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    const villaDirs = this.getVillaDirs();
    console.log(`📁 Found ${villaDirs.length} villa directories\n`);

    // Process villas in batches
    const batchSize = 10; // Process 10 villas at a time
    for (let i = 0; i < villaDirs.length; i += batchSize) {
      const batch = villaDirs.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(villaDirs.length/batchSize)}`);
      
      await Promise.all(
        batch.map(villaDir => this.optimizeVillaComplete(villaDir))
      );
    }

    this.printProductionSummary();
    await this.generateManifest();
  }

  getVillaDirs() {
    return fs.readdirSync(this.config.inputDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort();
  }

  async optimizeVillaComplete(villaDir) {
    const villaInputPath = path.join(this.config.inputDir, villaDir);
    const villaOutputPath = path.join(this.config.outputDir, villaDir);

    if (!fs.existsSync(villaOutputPath)) {
      fs.mkdirSync(villaOutputPath, { recursive: true });
    }

    console.log(`  🏡 Processing: ${villaDir}`);

    const allImages = this.getAllImagesRecursive(villaInputPath);
    
    // Limit concurrent processing per villa
    const semaphore = new Array(this.config.concurrent).fill(null);
    let index = 0;

    const processNext = async () => {
      if (index >= allImages.length) return;
      
      const imageInfo = allImages[index++];
      try {
        await this.optimizeImageAllSizes(imageInfo, villaOutputPath);
      } catch (error) {
        console.error(`    ❌ Error: ${imageInfo.relativePath} - ${error.message}`);
        this.stats.errors++;
      }
      
      return processNext();
    };

    await Promise.all(semaphore.map(() => processNext()));
  }

  getAllImagesRecursive(dirPath, basePath = dirPath, images = []) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        this.getAllImagesRecursive(fullPath, basePath, images);
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
        const relativePath = path.relative(basePath, fullPath);
        const stats = fs.statSync(fullPath);
        
        images.push({
          fullPath,
          relativePath,
          filename: item.name,
          size: stats.size
        });
        
        this.stats.totalOriginalSize += stats.size;
      }
    }

    return images;
  }

  async optimizeImageAllSizes(imageInfo, villaOutputPath) {
    const { fullPath, relativePath, filename } = imageInfo;
    const baseName = path.parse(filename).name;
    const subDir = path.dirname(relativePath);
    const outputSubDir = path.join(villaOutputPath, subDir);

    if (!fs.existsSync(outputSubDir)) {
      fs.mkdirSync(outputSubDir, { recursive: true });
    }

    // Generate all size variants
    for (const [sizeName, sizeConfig] of Object.entries(this.config.sizes)) {
      for (const format of this.config.formats) {
        const outputFilename = `${baseName}-${sizeName}.${format}`;
        const outputPath = path.join(outputSubDir, outputFilename);

        try {
          let pipeline = sharp(fullPath)
            .resize(sizeConfig.width, sizeConfig.height, {
              fit: sizeName === 'thumbnail' ? 'cover' : 'inside',
              withoutEnlargement: true,
              position: 'center'
            });

          // Apply format-specific optimization
          if (format === 'webp') {
            pipeline = pipeline.webp({ 
              quality: sizeConfig.quality, 
              effort: 4,
              smartSubsample: true 
            });
          } else if (format === 'jpg') {
            pipeline = pipeline.jpeg({ 
              quality: sizeConfig.quality, 
              mozjpeg: true,
              progressive: true 
            });
          }

          await pipeline.toFile(outputPath);

          // Track optimized size
          const stats = fs.statSync(outputPath);
          this.stats.totalOptimizedSize += stats.size;
          
        } catch (error) {
          throw new Error(`Failed to create ${sizeName} ${format}: ${error.message}`);
        }
      }
    }

    this.stats.processed++;
  }

  async generateManifest() {
    console.log('\n📋 Generating optimization manifest...');
    
    const manifest = {
      generated: new Date().toISOString(),
      stats: this.stats,
      config: this.config,
      sizes: this.config.sizes,
      totalImages: this.stats.processed,
      compressionRatio: ((this.stats.totalOriginalSize - this.stats.totalOptimizedSize) / this.stats.totalOriginalSize * 100).toFixed(2)
    };

    const manifestPath = path.join(this.config.outputDir, 'optimization-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`✅ Manifest saved: ${manifestPath}`);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printProductionSummary() {
    const duration = ((Date.now() - this.stats.startTime) / 1000 / 60).toFixed(2);
    const compressionRatio = ((this.stats.totalOriginalSize - this.stats.totalOptimizedSize) / this.stats.totalOriginalSize * 100);
    const avgCompressionPerImage = compressionRatio / this.stats.processed;

    console.log('\n' + '='.repeat(70));
    console.log('🏆 PRODUCTION IMAGE OPTIMIZATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`✅ Images processed: ${this.stats.processed.toLocaleString()}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`📁 Original size: ${this.formatBytes(this.stats.totalOriginalSize)}`);
    console.log(`📁 Optimized size: ${this.formatBytes(this.stats.totalOptimizedSize)}`);
    console.log(`💰 Space saved: ${this.formatBytes(this.stats.totalOriginalSize - this.stats.totalOptimizedSize)} (${compressionRatio.toFixed(1)}%)`);
    console.log(`📊 Avg compression: ${avgCompressionPerImage.toFixed(1)}% per image`);
    console.log(`⏱️  Total duration: ${duration} minutes`);
    console.log(`🚀 Ready for production deployment!`);
    console.log('='.repeat(70));
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);
  const isProduction = args.includes('--production');
  
  if (isProduction) {
    console.log('🔥 PRODUCTION MODE - Processing ALL images');
    const optimizer = new ProductionImageOptimizer();
    await optimizer.optimizeForProduction();
  } else {
    console.log('⚠️  TEST MODE - Use --production flag for full optimization');
    console.log('Run: node scripts/production-image-optimizer.js --production');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProductionImageOptimizer;
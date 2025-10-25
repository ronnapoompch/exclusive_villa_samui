const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Batch Image Optimizer - Process villas in smaller batches
 * More stable for large datasets
 */
class BatchImageOptimizer {
  constructor() {
    this.config = {
      inputDir: './public/villas',
      outputDir: './public/optimized-villas',
      batchSize: 5, // Process 5 villas at a time
      maxConcurrent: 3, // 3 images at a time per villa
      sizes: {
        thumbnail: { width: 400, height: 267, quality: 75 },
        medium: { width: 800, height: 600, quality: 80 }
      }
    };
    
    this.stats = {
      totalVillas: 0,
      processedVillas: 0,
      totalImages: 0,
      processedImages: 0,
      errors: 0,
      totalOriginalSize: 0,
      totalOptimizedSize: 0,
      startTime: Date.now()
    };
  }

  async optimizeAllVillas() {
    console.log('🚀 Starting Batch Image Optimization...\n');
    
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    const allVillas = this.getAllVillas();
    this.stats.totalVillas = allVillas.length;
    
    console.log(`📁 Found ${allVillas.length} villa directories`);
    console.log(`📦 Processing in batches of ${this.config.batchSize}\n`);

    // Process in small batches
    for (let i = 0; i < allVillas.length; i += this.config.batchSize) {
      const batch = allVillas.slice(i, i + this.config.batchSize);
      const batchNum = Math.floor(i / this.config.batchSize) + 1;
      const totalBatches = Math.ceil(allVillas.length / this.config.batchSize);
      
      console.log(`\n📦 Batch ${batchNum}/${totalBatches}: ${batch.join(', ')}`);
      
      try {
        await this.processBatch(batch);
        this.printProgress();
      } catch (error) {
        console.error(`❌ Batch ${batchNum} failed:`, error.message);
        this.stats.errors++;
      }
      
      // Small delay between batches to prevent overload
      await this.sleep(1000);
    }

    this.printFinalSummary();
  }

  getAllVillas() {
    return fs.readdirSync(this.config.inputDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort();
  }

  async processBatch(villaNames) {
    const promises = villaNames.map(villaName => this.processVilla(villaName));
    await Promise.all(promises);
  }

  async processVilla(villaName) {
    const inputPath = path.join(this.config.inputDir, villaName);
    const outputPath = path.join(this.config.outputDir, villaName);

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    console.log(`  🏡 ${villaName}`);

    try {
      const images = this.getAllImagesInVilla(inputPath);
      this.stats.totalImages += images.length;

      // Process images with concurrency limit
      const semaphore = new Array(this.config.maxConcurrent).fill(null);
      let imageIndex = 0;

      const processNext = async () => {
        if (imageIndex >= images.length) return;
        
        const imageInfo = images[imageIndex++];
        try {
          await this.optimizeImage(imageInfo, outputPath);
          this.stats.processedImages++;
        } catch (error) {
          console.error(`    ❌ ${imageInfo.relativePath}: ${error.message}`);
          this.stats.errors++;
        }
        
        return processNext();
      };

      await Promise.all(semaphore.map(() => processNext()));
      this.stats.processedVillas++;
      
      console.log(`    ✅ ${images.length} images processed`);
      
    } catch (error) {
      console.error(`  ❌ Villa ${villaName} failed:`, error.message);
      this.stats.errors++;
    }
  }

  getAllImagesInVilla(villaPath, basePath = villaPath, images = []) {
    try {
      const items = fs.readdirSync(villaPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(villaPath, item.name);
        
        if (item.isDirectory()) {
          this.getAllImagesInVilla(fullPath, basePath, images);
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
    } catch (error) {
      console.warn(`    ⚠️  Cannot read directory: ${villaPath}`);
    }

    return images;
  }

  async optimizeImage(imageInfo, villaOutputPath) {
    const { fullPath, relativePath, filename } = imageInfo;
    const baseName = path.parse(filename).name;
    const subDir = path.dirname(relativePath);
    const outputSubDir = path.join(villaOutputPath, subDir);

    if (!fs.existsSync(outputSubDir)) {
      fs.mkdirSync(outputSubDir, { recursive: true });
    }

    // Generate thumbnail and medium size WebP
    for (const [sizeName, sizeConfig] of Object.entries(this.config.sizes)) {
      const outputFilename = `${baseName}-${sizeName}.webp`;
      const outputPath = path.join(outputSubDir, outputFilename);

      try {
        await sharp(fullPath)
          .resize(sizeConfig.width, sizeConfig.height, {
            fit: sizeName === 'thumbnail' ? 'cover' : 'inside',
            withoutEnlargement: true,
            position: 'center'
          })
          .webp({ 
            quality: sizeConfig.quality, 
            effort: 4 
          })
          .toFile(outputPath);

        // Track optimized size
        const stats = fs.statSync(outputPath);
        this.stats.totalOptimizedSize += stats.size;
        
      } catch (error) {
        throw new Error(`Failed to create ${sizeName}: ${error.message}`);
      }
    }
  }

  printProgress() {
    const percent = ((this.stats.processedVillas / this.stats.totalVillas) * 100).toFixed(1);
    const compressionRatio = this.stats.totalOriginalSize > 0 ? 
      ((this.stats.totalOriginalSize - this.stats.totalOptimizedSize) / this.stats.totalOriginalSize * 100).toFixed(1) : 0;
    
    console.log(`📊 Progress: ${this.stats.processedVillas}/${this.stats.totalVillas} villas (${percent}%) | ${this.stats.processedImages} images | ${compressionRatio}% compression`);
  }

  printFinalSummary() {
    const duration = ((Date.now() - this.stats.startTime) / 1000 / 60).toFixed(2);
    const compressionRatio = ((this.stats.totalOriginalSize - this.stats.totalOptimizedSize) / this.stats.totalOriginalSize * 100);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 BATCH OPTIMIZATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Villas processed: ${this.stats.processedVillas}/${this.stats.totalVillas}`);
    console.log(`✅ Images processed: ${this.stats.processedImages}/${this.stats.totalImages}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`📁 Original size: ${this.formatBytes(this.stats.totalOriginalSize)}`);
    console.log(`📁 Optimized size: ${this.formatBytes(this.stats.totalOptimizedSize)}`);
    console.log(`💰 Space saved: ${this.formatBytes(this.stats.totalOriginalSize - this.stats.totalOptimizedSize)} (${compressionRatio.toFixed(1)}%)`);
    console.log(`⏱️  Duration: ${duration} minutes`);
    console.log('='.repeat(60));
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run optimization
async function main() {
  const optimizer = new BatchImageOptimizer();
  await optimizer.optimizeAllVillas();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BatchImageOptimizer;
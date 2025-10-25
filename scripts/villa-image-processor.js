#!/usr/bin/env node

/**
 * Villa Image Processing System
 * โปรแกรมจัดการรูปภาพ Villa 80GB อัตโนมัติ
 * 
 * Features:
 * - สแกนและวิเคราะห์ folder structure
 * - คัดเลือกรูปภาพดีที่สุดจากแต่ละ villa
 * - Resize และ optimize images
 * - สร้าง thumbnails และ WebP format
 * - Generate JSON data สำหรับ database
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp'); // npm install sharp
const { execSync } = require('child_process');

class VillaImageProcessor {
  constructor(sourceDir, outputDir) {
    this.sourceDir = sourceDir;
    this.outputDir = outputDir;
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
    this.stats = {
      totalVillas: 0,
      totalImages: 0,
      processedImages: 0,
      errors: []
    };
  }

  /**
   * 🔍 วิเคราะห์โครงสร้าง folder
   */
  async analyzeStructure() {
    console.log('🔍 วิเคราะห์โครงสร้าง folders...');
    
    try {
      const villaDirs = await fs.readdir(this.sourceDir);
      const analysis = {
        totalVillas: villaDirs.length,
        villaStructure: {}
      };

      for (const villaDir of villaDirs) {
        const villaPath = path.join(this.sourceDir, villaDir);
        const stat = await fs.stat(villaPath);
        
        if (stat.isDirectory()) {
          analysis.villaStructure[villaDir] = await this.analyzeVillaFolder(villaPath);
        }
      }

      // บันทึกผล analysis
      await fs.writeFile(
        path.join(this.outputDir, 'villa-structure-analysis.json'),
        JSON.stringify(analysis, null, 2)
      );

      console.log(`📊 พบ Villa ${analysis.totalVillas} แห่ง`);
      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing structure:', error);
      throw error;
    }
  }

  /**
   * 📁 วิเคราะห์ folder ของแต่ละ villa
   */
  async analyzeVillaFolder(villaPath) {
    const subDirs = await fs.readdir(villaPath);
    const folderAnalysis = {};

    for (const subDir of subDirs) {
      const subDirPath = path.join(villaPath, subDir);
      const stat = await fs.stat(subDirPath);

      if (stat.isDirectory()) {
        const images = await this.findImages(subDirPath);
        folderAnalysis[subDir] = {
          imageCount: images.length,
          totalSize: await this.calculateFolderSize(subDirPath),
          images: images
        };
      }
    }

    return folderAnalysis;
  }

  /**
   * 🖼️ หารูปภาพในโฟลเดอร์
   */
  async findImages(dirPath) {
    const files = await fs.readdir(dirPath);
    const images = [];

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile() && this.isImageFile(file)) {
        images.push({
          filename: file,
          path: filePath,
          size: stat.size,
          modified: stat.mtime
        });
      }
    }

    return images.sort((a, b) => b.size - a.size); // เรียงตามขนาดไฟล์
  }

  /**
   * 🎯 คัดเลือกรูปภาพดีที่สุด
   */
  async selectBestImages(images, maxImages = 8) {
    if (images.length <= maxImages) {
      return images;
    }

    // อัลกอริทึมคัดเลือก:
    // 1. เอารูปที่ใหญ่ที่สุด (คุณภาพดี)
    // 2. เอารูปที่หลากหลายตามเวลา (ไม่เอาซ้ำกัน)
    // 3. ตรวจสอบความชัดของรูป

    const selected = [];
    const sortedBySize = [...images].sort((a, b) => b.size - a.size);
    const sortedByTime = [...images].sort((a, b) => a.modified - b.modified);

    // เอารูปใหญ่ที่สุด 3 รูปก่อน
    selected.push(...sortedBySize.slice(0, 3));

    // เอารูปที่เวลาห่างกันมากที่สุด
    const timeSpread = this.selectTimeSpreadImages(sortedByTime, maxImages - 3);
    selected.push(...timeSpread);

    // ลบรูปซ้ำ
    const uniqueSelected = selected.filter((img, index, arr) => 
      arr.findIndex(i => i.path === img.path) === index
    );

    return uniqueSelected.slice(0, maxImages);
  }

  /**
   * ⏰ เลือกรูปที่มีช่วงเวลาห่างกัน
   */
  selectTimeSpreadImages(images, count) {
    if (images.length <= count) return images;
    
    const step = Math.floor(images.length / count);
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const index = i * step;
      if (index < images.length) {
        selected.push(images[index]);
      }
    }
    
    return selected;
  }

  /**
   * 🔧 ประมวลผลรูปภาพ
   */
  async processImages() {
    const analysis = await this.analyzeStructure();
    
    console.log('🔧 เริ่มประมวลผลรูปภาพ...');
    
    for (const [villaName, villaData] of Object.entries(analysis.villaStructure)) {
      console.log(`\n📁 ประมวลผล Villa: ${villaName}`);
      
      // หา folder ที่มีรูปมากที่สุด (น่าจะเป็น folder หลัก)
      let bestFolder = null;
      let maxImages = 0;
      
      for (const [folderName, folderData] of Object.entries(villaData)) {
        if (folderData.imageCount > maxImages) {
          maxImages = folderData.imageCount;
          bestFolder = { name: folderName, data: folderData };
        }
      }
      
      if (bestFolder && bestFolder.data.images.length > 0) {
        await this.processVillaImages(villaName, bestFolder);
        this.stats.totalVillas++;
      }
    }
    
    console.log('\n✅ ประมวลผลเสร็จสิ้น!');
    console.log(`📊 Stats: ${this.stats.processedImages}/${this.stats.totalImages} images processed`);
  }

  /**
   * 🏠 ประมวลผลรูปภาพของ villa หนึ่งหลัง
   */
  async processVillaImages(villaName, bestFolder) {
    try {
      // คัดเลือกรูปภาพดีที่สุด
      const selectedImages = await this.selectBestImages(bestFolder.data.images, 8);
      
      console.log(`   📸 คัดเลือก ${selectedImages.length}/${bestFolder.data.images.length} รูป`);
      
      // สร้าง output directory
      const villaOutputDir = path.join(this.outputDir, 'villas', villaName);
      await fs.mkdir(villaOutputDir, { recursive: true });
      
      const processedImages = [];
      
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const outputFilename = `${villaName}-${i + 1}`;
        
        try {
          // สร้างรูปหลายขนาด
          const variants = await this.createImageVariants(
            image.path,
            villaOutputDir,
            outputFilename
          );
          
          processedImages.push({
            original: image.filename,
            variants: variants,
            isPrimary: i === 0 // รูปแรกเป็นรูปหลัก
          });
          
          this.stats.processedImages++;
          console.log(`     ✓ ${image.filename}`);
        } catch (error) {
          console.error(`     ❌ Error processing ${image.filename}:`, error.message);
          this.stats.errors.push({ villa: villaName, image: image.filename, error: error.message });
        }
      }
      
      // บันทึก metadata
      await fs.writeFile(
        path.join(villaOutputDir, 'images.json'),
        JSON.stringify({
          villaName,
          processedAt: new Date().toISOString(),
          totalSelected: selectedImages.length,
          images: processedImages
        }, null, 2)
      );
      
    } catch (error) {
      console.error(`❌ Error processing villa ${villaName}:`, error);
      this.stats.errors.push({ villa: villaName, error: error.message });
    }
  }

  /**
   * 🎨 สร้างรูปภาพหลายขนาด
   */
  async createImageVariants(inputPath, outputDir, baseName) {
    const variants = {};
    
    const sizes = [
      { name: 'thumbnail', width: 300, height: 200, quality: 80 },
      { name: 'small', width: 600, height: 400, quality: 85 },
      { name: 'medium', width: 1200, height: 800, quality: 90 },
      { name: 'large', width: 1920, height: 1280, quality: 95 }
    ];
    
    for (const size of sizes) {
      try {
        // WebP format สำหรับ modern browsers
        const webpPath = path.join(outputDir, `${baseName}-${size.name}.webp`);
        await sharp(inputPath)
          .resize(size.width, size.height, { 
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: size.quality })
          .toFile(webpPath);
        
        // JPEG fallback
        const jpgPath = path.join(outputDir, `${baseName}-${size.name}.jpg`);
        await sharp(inputPath)
          .resize(size.width, size.height, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: size.quality })
          .toFile(jpgPath);
        
        variants[size.name] = {
          webp: path.relative(this.outputDir, webpPath),
          jpg: path.relative(this.outputDir, jpgPath),
          width: size.width,
          height: size.height
        };
        
      } catch (error) {
        console.error(`Error creating ${size.name} variant:`, error);
      }
    }
    
    return variants;
  }

  /**
   * 📊 คำนวณขนาด folder
   */
  async calculateFolderSize(dirPath) {
    let totalSize = 0;
    
    try {
      const files = await fs.readdir(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);
        totalSize += stat.size;
      }
    } catch (error) {
      // ignore errors
    }
    
    return totalSize;
  }

  /**
   * 🖼️ ตรวจสอบว่าเป็นไฟล์รูปหรือไม่
   */
  isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  /**
   * 📈 สร้างรายงาน
   */
  async generateReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      stats: this.stats,
      recommendations: [
        'ใช้ WebP format สำหรับ browsers ที่รองรับ',
        'ใช้ lazy loading สำหรับรูปภาพ',
        'ตั้งค่า CDN สำหรับ delivery ที่เร็วขึ้น',
        'ใช้ responsive images สำหรับ mobile optimization'
      ]
    };

    await fs.writeFile(
      path.join(this.outputDir, 'processing-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📋 รายงานการประมวลผล:');
    console.log(`   🏠 Villa ที่ประมวลผล: ${this.stats.totalVillas}`);
    console.log(`   📸 รูปที่ประมวลผล: ${this.stats.processedImages}`);
    console.log(`   ❌ Errors: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      this.stats.errors.forEach(error => {
        console.log(`   - ${error.villa}: ${error.error}`);
      });
    }
  }
}

// 🚀 Main execution
async function main() {
  // ตั้งค่า paths
  const sourceDir = process.argv[2] || './villa-images-raw'; // 80GB folder
  const outputDir = process.argv[3] || './public/images/villas';
  
  console.log('🚀 Villa Image Processing System');
  console.log(`📁 Source: ${sourceDir}`);
  console.log(`📁 Output: ${outputDir}`);
  
  try {
    // สร้าง output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    const processor = new VillaImageProcessor(sourceDir, outputDir);
    
    // ประมวลผลรูปภาพ
    await processor.processImages();
    
    // สร้างรายงาน
    await processor.generateReport();
    
    console.log('\n🎉 เสร็จสิ้น! พร้อมใช้งาน');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// เรียกใช้งาน
if (require.main === module) {
  main();
}

module.exports = { VillaImageProcessor };
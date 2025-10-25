// Professional Villa System Fix Script
// แก้ไขปัญหาทั้งหมดอย่างครอบคลุม

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

console.log('🔧 เริ่มต้นการแก้ไขปัญหา Villa System อย่างครอบคลุม...\n');

// 1. สร้าง Mapping ระหว่าง Excel และ Image Folders
console.log('📊 สร้าง Mapping ระหว่าง Excel Data และ Image Folders...');

const excelPath = path.join(__dirname, 'data/EXVLSM Price (V2).xlsx');
const villaImagesPath = path.join(__dirname, 'src/data/Villla Images');
const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const imageFolders = fs.readdirSync(villaImagesPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log('✅ โหลด Excel:', excelData.length - 1, 'รายการ, Image Folders:', imageFolders.length, 'โฟลเดอร์');

// สร้าง mapping function ที่แม่นยำ
function createVillaMapping() {
  const mapping = [];
  
  // ข้าม header row
  for (let i = 1; i < excelData.length; i++) {
    const row = excelData[i];
    if (!row || row.length < 2) continue;
    
    const realName = String(row[0] || '').trim(); // Column A - ชื่อจริง
    const codeName = String(row[1] || '').trim(); // Column B - ชื่อโค้ด
    const priceDaily = row[2] ? String(row[2]).trim() : '';
    const priceWeekly = row[3] ? String(row[3]).trim() : '';
    const priceMonthly = row[4] ? String(row[4]).trim() : '';
    
    if (!realName || realName === ' NAME') continue;
    
    // ลองหา image folder ที่ตรงกัน (ใช้ชื่อจริงเป็นหลัก)
    let matchedFolder = null;
    let matchType = 'none';
    
    // 1. ตรงกันทุกตัวอักษร
    let exactMatch = imageFolders.find(folder => 
      folder.toLowerCase() === realName.toLowerCase() ||
      folder.toLowerCase() === codeName.toLowerCase()
    );
    
    if (exactMatch) {
      matchedFolder = exactMatch;
      matchType = exactMatch.toLowerCase() === realName.toLowerCase() ? 'exact-real' : 'exact-code';
    } else {
      // 2. Contains matching
      let containsMatch = imageFolders.find(folder => {
        const folderClean = folder.toLowerCase().replace(/[^a-z0-9]/g, '');
        const realClean = realName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const codeClean = codeName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        return folderClean.includes(realClean) || realClean.includes(folderClean) ||
               folderClean.includes(codeClean) || codeClean.includes(folderClean);
      });
      
      if (containsMatch) {
        matchedFolder = containsMatch;
        matchType = 'contains';
      }
    }
    
    // สร้าง slug
    const slug = (matchedFolder || realName).toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    mapping.push({
      rowIndex: i,
      realName,
      codeName,
      slug,
      matchedFolder,
      matchType,
      pricing: {
        daily: priceDaily,
        weekly: priceWeekly,
        monthly: priceMonthly
      }
    });
  }
  
  return mapping;
}

const villaMapping = createVillaMapping();
console.log('📋 สร้าง Mapping สำเร็จ:', villaMapping.length, 'รายการ');

// แสดงสถิติ
const stats = {
  total: villaMapping.length,
  matched: villaMapping.filter(v => v.matchedFolder).length,
  unmatched: villaMapping.filter(v => !v.matchedFolder).length,
  exactRealMatch: villaMapping.filter(v => v.matchType === 'exact-real').length,
  exactCodeMatch: villaMapping.filter(v => v.matchType === 'exact-code').length,
  containsMatch: villaMapping.filter(v => v.matchType === 'contains').length
};

console.log('📊 สถิติการจับคู่:');
console.log('   ทั้งหมด:', stats.total);
console.log('   ✅ จับคู่สำเร็จ:', stats.matched, '(' + (stats.matched/stats.total*100).toFixed(1) + '%)');
console.log('   ❌ ไม่จับคู่:', stats.unmatched, '(' + (stats.unmatched/stats.total*100).toFixed(1) + '%)');
console.log('   🎯 ตรงชื่อจริง:', stats.exactRealMatch);
console.log('   🎯 ตรงชื่อโค้ด:', stats.exactCodeMatch);
console.log('   🔍 ใกล้เคียง:', stats.containsMatch);

// 2. สร้าง Enhanced Villa Images JSON ใหม่
console.log('\n🖼️ สร้าง Enhanced Villa Images JSON...');

function processVillaImages() {
  const enhancedImages = {};
  
  villaMapping.forEach(villa => {
    if (!villa.matchedFolder) return;
    
    const villaFolder = path.join(villaImagesPath, villa.matchedFolder);
    if (!fs.existsSync(villaFolder)) return;
    
    const images = {
      hero: [],
      ext: [],
      liv: [],
      din: [],
      kit: [],
      bed1: [],
      bed2_5: [],
      bath1: [],
      bath2_5: [],
      pool: [],
      view: [],
      amen: []
    };
    
    // สแกนไฟล์ในโฟลเดอร์
    function scanFolder(folderPath, category) {
      if (!fs.existsSync(folderPath)) return;
      
      const files = fs.readdirSync(folderPath);
      files.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
          const imagePath = '/villas/' + villa.matchedFolder + '/' + category + '/' + file;
          images[category].push(imagePath);
        }
      });
    }
    
    // สแกนแต่ละหมวดหมู่
    const categories = Object.keys(images);
    categories.forEach(category => {
      const categoryPath = path.join(villaFolder, category);
      scanFolder(categoryPath, category);
    });
    
    const totalImages = Object.values(images).reduce((sum, arr) => sum + arr.length, 0);
    
    enhancedImages[villa.slug] = {
      realName: villa.realName,
      codeName: villa.codeName,
      slug: villa.slug,
      folderName: villa.matchedFolder,
      images,
      totalImages,
      pricing: villa.pricing
    };
  });
  
  return enhancedImages;
}

const enhancedImages = processVillaImages();
console.log('✅ ประมวลผลรูปภาพ:', Object.keys(enhancedImages).length, 'วิลล่า');

// บันทึกไฟล์
fs.writeFileSync(
  path.join(__dirname, 'src/data/enhanced-villa-images.json'),
  JSON.stringify(enhancedImages, null, 2)
);

console.log('✅ บันทึกไฟล์ enhanced-villa-images.json สำเร็จ');

// สรุปผล
const totalImagesProcessed = Object.values(enhancedImages).reduce((sum, v) => sum + v.totalImages, 0);
console.log('\n📊 สรุปผลการแก้ไข:');
console.log('✅ สร้าง Enhanced Villa Mapping สำเร็จ');
console.log('✅ ประมวลผลรูปภาพจาก Villla Images folder สำเร็จ');
console.log('✅ ใช้ชื่อจริงจาก Column A แทน Column B');
console.log('📄 ไฟล์ที่สร้าง: src/data/enhanced-villa-images.json');
console.log('📈 สถิติ:');
console.log('   🏖️ วิลล่าที่มีรูป:', Object.keys(enhancedImages).length);
console.log('   📸 รูปภาพทั้งหมด:', totalImagesProcessed);
console.log('   ✅ จับคู่สำเร็จ:', stats.matched + '/' + stats.total, '(' + (stats.matched/stats.total*100).toFixed(1) + '%)');

console.log('\n🚀 การวิเคราะห์และประมวลผลเสร็จสิ้น!');
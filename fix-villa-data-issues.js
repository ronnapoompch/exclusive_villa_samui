// Professional Villa Data Analysis and Fix Script
// ตรวจสอบและแก้ไขปัญหา Villa Data อย่างรอบคอบ

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

console.log('🔍 เริ่มต้นการวิเคราะห์และแก้ไขปัญหา Villa Data...\n');

// 1. ตรวจสอบ Villa Images folder
console.log('📁 ตรวจสอบ Villa Images folder...');
const villaImagesPath = path.join(__dirname, 'src/data/Villla Images');

if (!fs.existsSync(villaImagesPath)) {
  console.error('❌ ไม่พบ Villla Images folder!');
  process.exit(1);
}

const imageFolders = fs.readdirSync(villaImagesPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`✅ พบ ${imageFolders.length} โฟลเดอร์รูปวิลล่า`);
console.log('📋 รายชื่อโฟลเดอร์รูป (10 อันแรก):');
imageFolders.slice(0, 10).forEach(folder => console.log(`   - ${folder}`));

// 2. ตรวจสอบไฟล์ Excel
console.log('\n📊 ตรวจสอบไฟล์ Excel...');
const excelPath = path.join(__dirname, 'data/EXVLSM Price (V2).xlsx');

if (!fs.existsSync(excelPath)) {
  console.error('❌ ไม่พบไฟล์ EXVLSM Price (V2).xlsx!');
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`✅ โหลดไฟล์ Excel สำเร็จ - ${excelData.length} แถว`);
console.log('📋 ตัวอย่างข้อมูล 5 แถวแรก:');
excelData.slice(0, 5).forEach((row, index) => {
  if (row.length >= 2) {
    console.log(`   ${index + 1}. Column A: "${row[0]}" | Column B: "${row[1]}"`);
  }
});

// 3. วิเคราะห์ความสอดคล้องของข้อมูล
console.log('\n🔎 วิเคราะห์ความสอดคล้องระหว่างชื่อวิลล่าและโฟลเดอร์รูป...');

const analysis = {
  totalImageFolders: imageFolders.length,
  totalExcelRows: excelData.length - 1, // ลบ header
  matched: [],
  unmatched: [],
  columnAVsB: {
    columnAMatches: 0,
    columnBMatches: 0,
    bothMatch: 0,
    neitherMatch: 0
  }
};

// ตรวจสอบทีละแถวใน Excel (ข้าม header)
for (let i = 1; i < excelData.length; i++) {
  const row = excelData[i];
  if (row.length >= 2) {
    const columnA = String(row[0] || '').trim();
    const columnB = String(row[1] || '').trim();
    
    const matchesColumnA = imageFolders.some(folder => 
      folder.toLowerCase() === columnA.toLowerCase() ||
      folder.toLowerCase().includes(columnA.toLowerCase()) ||
      columnA.toLowerCase().includes(folder.toLowerCase())
    );
    
    const matchesColumnB = imageFolders.some(folder => 
      folder.toLowerCase() === columnB.toLowerCase() ||
      folder.toLowerCase().includes(columnB.toLowerCase()) ||
      columnB.toLowerCase().includes(folder.toLowerCase())
    );
    
    if (matchesColumnA && matchesColumnB) {
      analysis.columnAVsB.bothMatch++;
    } else if (matchesColumnA) {
      analysis.columnAVsB.columnAMatches++;
    } else if (matchesColumnB) {
      analysis.columnAVsB.columnBMatches++;
    } else {
      analysis.columnAVsB.neitherMatch++;
    }
    
    const bestMatch = imageFolders.find(folder => {
      const folderLower = folder.toLowerCase();
      const aLower = columnA.toLowerCase();
      const bLower = columnB.toLowerCase();
      return folderLower === aLower || folderLower === bLower ||
             folderLower.includes(aLower) || aLower.includes(folderLower) ||
             folderLower.includes(bLower) || bLower.includes(folderLower);
    });
    
    if (bestMatch) {
      analysis.matched.push({
        rowIndex: i,
        columnA,
        columnB,
        matchedFolder: bestMatch,
        matchType: matchesColumnA ? 'Column A' : 'Column B'
      });
    } else {
      analysis.unmatched.push({
        rowIndex: i,
        columnA,
        columnB
      });
    }
  }
}

// 4. รายงานผลการวิเคราะห์
console.log('\n📊 ผลการวิเคราะห์:');
console.log(`📁 โฟลเดอร์รูปทั้งหมด: ${analysis.totalImageFolders}`);
console.log(`📄 ข้อมูล Excel ทั้งหมด: ${analysis.totalExcelRows}`);
console.log(`✅ จับคู่สำเร็จ: ${analysis.matched.length}`);
console.log(`❌ จับคู่ไม่สำเร็จ: ${analysis.unmatched.length}`);
console.log(`\n🎯 การจับคู่ Column A vs Column B:`);
console.log(`   Column A เท่านั้น: ${analysis.columnAVsB.columnAMatches}`);
console.log(`   Column B เท่านั้น: ${analysis.columnAVsB.columnBMatches}`);
console.log(`   ทั้ง A และ B: ${analysis.columnAVsB.bothMatch}`);
console.log(`   ไม่มีทั้งคู่: ${analysis.columnAVsB.neitherMatch}`);

// 5. แสดงตัวอย่างการจับคู่ที่สำเร็จ
console.log('\n✅ ตัวอย่างการจับคู่ที่สำเร็จ (10 อันแรก):');
analysis.matched.slice(0, 10).forEach(match => {
  console.log(`   ${match.matchType}: "${match[match.matchType.includes('A') ? 'columnA' : 'columnB']}" → "${match.matchedFolder}"`);
});

// 6. แสดงรายการที่จับคู่ไม่สำเร็จ
if (analysis.unmatched.length > 0) {
  console.log('\n❌ รายการที่จับคู่ไม่สำเร็จ (10 อันแรก):');
  analysis.unmatched.slice(0, 10).forEach(item => {
    console.log(`   A: "${item.columnA}" | B: "${item.columnB}"`);
  });
}

// 7. ตรวจสอบไฟล์ข้อมูลปัจจุบัน
console.log('\n📄 ตรวจสอบไฟล์ข้อมูลปัจจุบัน...');
const currentDataFiles = [
  'src/data/all-villa-images.json',
  'src/data/villa-images.json',
  'src/data/villas.ts'
];

currentDataFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${file} - ขนาด: ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log(`❌ ${file} - ไม่พบไฟล์`);
  }
});

// 8. สร้างรายงานผลการวิเคราะห์
const report = {
  timestamp: new Date().toISOString(),
  analysis,
  recommendations: []
};

if (analysis.columnAVsB.columnAMatches > analysis.columnAVsB.columnBMatches) {
  report.recommendations.push('ควรใช้ Column A (ชื่อจริง) เป็นหลักในการจับคู่ข้อมูล');
} else if (analysis.columnAVsB.columnBMatches > analysis.columnAVsB.columnAMatches) {
  report.recommendations.push('ควรใช้ Column B เป็นหลักในการจับคู่ข้อมูล');
} else {
  report.recommendations.push('ควรตรวจสอบและใช้ทั้ง Column A และ B ในการจับคู่ข้อมูล');
}

if (analysis.unmatched.length > 0) {
  report.recommendations.push(`มี ${analysis.unmatched.length} รายการที่จับคู่ไม่สำเร็จ ต้องแก้ไขด้วยตนเอง`);
}

report.recommendations.push('ควรปรับปรุงระบบให้ใช้รูปภาพจาก Villla Images folder แทน placeholder');

// บันทึกรายงาน
fs.writeFileSync(
  path.join(__dirname, 'VILLA_DATA_ANALYSIS_REPORT.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n📝 บันทึกรายงานการวิเคราะห์แล้วที่ VILLA_DATA_ANALYSIS_REPORT.json');
console.log('\n🎯 สรุป: ควรใช้ Column A (ชื่อจริง) และปรับปรุงระบบรูปภาพ');
console.log('✨ การวิเคราะห์เสร็จสิ้น!');
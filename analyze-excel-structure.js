// analyze-excel-structure.js - วิเคราะห์โครงสร้างไฟล์ Excel
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function analyzeExcelStructure() {
  console.log('🔍 === วิเคราะห์โครงสร้างไฟล์ Excel === 🔍\n');
  
  try {
    const excelPath = path.join(__dirname, 'data', 'EXVLSM Price (V2).xlsx');
    const workbook = XLSX.readFile(excelPath);
    
    // ตรวจสอบทุก Sheet
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`\n📋 Sheet ${index + 1}: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      
      // หา range ของข้อมูล
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      console.log(`   📐 Range: ${worksheet['!ref']} (${range.e.r + 1} แถว, ${range.e.c + 1} คอลัมน์)`);
      
      // อ่านข้อมูลเป็น JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        const headers = jsonData[0];
        console.log(`   📝 Headers (${headers.length} คอลัมน์):`);
        headers.forEach((header, colIndex) => {
          if (header) {
            console.log(`      ${colIndex + 1}. "${header}"`);
          }
        });
        
        // ตรวจสอบว่ามีข้อมูลรูปภาพหรือไม่
        console.log('\n   🖼️ ค้นหาข้อมูลรูปภาพ...');
        let hasImages = false;
        
        headers.forEach((header, colIndex) => {
          if (header) {
            const headerLower = header.toString().toLowerCase();
            if (headerLower.includes('image') || headerLower.includes('photo') || 
                headerLower.includes('pic') || headerLower.includes('img') ||
                headerLower.includes('url') || headerLower.includes('link')) {
              hasImages = true;
              console.log(`      ✅ พบคอลัมน์รูปภาพ: "${header}"`);
              
              // แสดงตัวอย่างข้อมูล
              for (let i = 1; i <= Math.min(3, jsonData.length - 1); i++) {
                if (jsonData[i] && jsonData[i][colIndex]) {
                  console.log(`         แถว ${i}: ${jsonData[i][colIndex]}`);
                }
              }
            }
          }
        });
        
        if (!hasImages) {
          console.log('      ❌ ไม่พบคอลัมน์รูปภาพที่ชัดเจน');
        }
        
        // นับข้อมูลที่มี
        let villaCount = 0;
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row[0]) { // มีชื่อวิลล่า
            villaCount++;
          }
        }
        console.log(`   🏠 จำนวนวิลล่าที่มีข้อมูล: ${villaCount} หลัง`);
      }
    });
    
    // ตรวจสอบว่ามีไฟล์รูปภาพในโฟลเดอร์หรือไม่
    console.log('\n\n📁 === ตรวจสอบไฟล์รูปภาพ === 📁');
    const dataDir = path.join(__dirname, 'data');
    const publicDir = path.join(__dirname, 'public');
    const imagesDir = path.join(__dirname, 'public', 'images');
    
    [dataDir, publicDir, imagesDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`\n📂 โฟลเดอร์: ${dir}`);
        const files = fs.readdirSync(dir);
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
        );
        
        console.log(`   📊 ไฟล์ทั้งหมด: ${files.length}`);
        console.log(`   🖼️ ไฟล์รูปภาพ: ${imageFiles.length}`);
        
        if (imageFiles.length > 0) {
          console.log('   📋 รายชื่อไฟล์รูป:');
          imageFiles.slice(0, 10).forEach((file, index) => {
            console.log(`      ${index + 1}. ${file}`);
          });
          if (imageFiles.length > 10) {
            console.log(`      ... และอีก ${imageFiles.length - 10} ไฟล์`);
          }
        }
      } else {
        console.log(`\n📂 โฟลเดอร์: ${dir} - ไม่พบ`);
      }
    });
    
  } catch (error) {
    console.error('💥 เกิดข้อผิดพลาด:', error.message);
  }
}

// รันโปรแกรม
analyzeExcelStructure();
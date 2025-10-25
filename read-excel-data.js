// read-excel-data.js - อ่านข้อมูลจากไฟล์ Excel
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function readExcelFile() {
  console.log('📊 === อ่านข้อมูลจากไฟล์ Excel === 📊\n');
  
  try {
    const excelPath = path.join(__dirname, 'data', 'EXVLSM Price (V2).xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error('❌ ไม่พบไฟล์:', excelPath);
      return;
    }
    
    console.log('📖 กำลังอ่านไฟล์:', excelPath);
    
    // อ่านไฟล์ Excel
    const workbook = XLSX.readFile(excelPath);
    
    console.log('📋 Sheet ที่มีในไฟล์:');
    workbook.SheetNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
    
    // อ่าน Sheet แรก
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    
    // แปลงเป็น JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`\n📊 พบข้อมูล ${jsonData.length} แถว`);
    
    if (jsonData.length > 0) {
      console.log('\n📝 Header ของข้อมูล:');
      const headers = jsonData[0];
      headers.forEach((header, index) => {
        console.log(`  ${index + 1}. ${header}`);
      });
      
      console.log('\n🔍 ตัวอย่างข้อมูล 5 แถวแรก:');
      for (let i = 1; i <= Math.min(5, jsonData.length - 1); i++) {
        const row = jsonData[i];
        console.log(`\nแถวที่ ${i}:`);
        headers.forEach((header, index) => {
          if (row[index]) {
            console.log(`  ${header}: ${row[index]}`);
          }
        });
      }
      
      // บันทึกเป็นไฟล์ JSON เพื่อดูรายละเอียด
      const outputPath = path.join(__dirname, 'excel-data.json');
      fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
      console.log(`\n💾 บันทึกข้อมูลทั้งหมดไปที่: ${outputPath}`);
      
      // หาคอลัมน์ที่เกี่ยวกับรูปภาพ
      console.log('\n🖼️ คอลัมน์ที่เกี่ยวกับรูปภาพ:');
      headers.forEach((header, index) => {
        if (header && header.toLowerCase().includes('image') || 
            header && header.toLowerCase().includes('photo') || 
            header && header.toLowerCase().includes('pic') ||
            header && header.toLowerCase().includes('img') ||
            header && header.toLowerCase().includes('url')) {
          console.log(`  ${index + 1}. ${header}`);
          
          // แสดงตัวอย่างข้อมูลในคอลัมน์นี้
          for (let i = 1; i <= Math.min(3, jsonData.length - 1); i++) {
            if (jsonData[i][index]) {
              console.log(`    แถว ${i}: ${jsonData[i][index]}`);
            }
          }
        }
      });
    }
    
  } catch (error) {
    console.error('💥 เกิดข้อผิดพลาด:', error.message);
    console.error(error);
  }
}

// รันโปรแกรม
readExcelFile();
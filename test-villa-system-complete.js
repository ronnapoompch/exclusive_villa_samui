// Professional Villa System Testing Script
// ทดสอบระบบวิลล่าทั้งหมดอย่างครบถ้วน

const fetch = require('node-fetch');

console.log('🧪 เริ่มต้นการทดสอบระบบ Villa อย่างครบถ้วน...\n');

const BASE_URL = 'http://localhost:3001';
const testResults = [];

async function testAPI(name, url, expectedStatus = 200) {
  try {
    console.log(`🔍 ทดสอบ: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const success = response.status === expectedStatus;
    
    if (success) {
      const data = await response.json();
      console.log(`   ✅ สถานะ: ${response.status} - สำเร็จ`);
      
      if (data.data) {
        if (Array.isArray(data.data)) {
          console.log(`   📊 ข้อมูล: พบ ${data.data.length} รายการ`);
        } else if (data.data.name) {
          console.log(`   🏖️ วิลล่า: ${data.data.name}`);
          if (data.data.totalImages) {
            console.log(`   📸 รูปภาพ: ${data.data.totalImages} รูป`);
          }
          if (data.data.enhancedImagesUsed) {
            console.log(`   ✨ ใช้รูปภาพจริง: ${data.data.imageSource}`);
          }
        }
      }
      
      testResults.push({ test: name, passed: true, status: response.status });
    } else {
      console.log(`   ❌ สถานะ: ${response.status} - ล้มเหลว`);
      testResults.push({ test: name, passed: false, status: response.status });
    }
  } catch (error) {
    console.log(`   ❌ ข้อผิดพลาด: ${error.message}`);
    testResults.push({ test: name, passed: false, error: error.message });
  }
  
  console.log('');
}

async function runAllTests() {
  console.log('🎯 ทดสอบ API Endpoints...\n');
  
  // 1. ทดสอบ Villa List API
  await testAPI(
    'Villa List API', 
    `${BASE_URL}/api/villas`
  );
  
  // 2. ทดสอบ Villa List API ด้วย parameters
  await testAPI(
    'Villa List API (with pagination)', 
    `${BASE_URL}/api/villas?limit=5&offset=0`
  );
  
  // 3. ทดสอบ Villa Detail API - 5house (มีรูปจริง)
  await testAPI(
    'Villa Detail API - 5house (Enhanced)', 
    `${BASE_URL}/api/villas/5house`
  );
  
  // 4. ทดสอบ Villa Detail API - anzhu-seamate (มีรูปจริง)
  await testAPI(
    'Villa Detail API - anzhu-seamate (Enhanced)', 
    `${BASE_URL}/api/villas/anzhu-seamate`
  );
  
  // 5. ทดสอบ Villa Detail API - villa ที่ไม่มีรูปจริง
  await testAPI(
    'Villa Detail API - non-enhanced villa', 
    `${BASE_URL}/api/villas/luxury-beachfront-villa-sunset`
  );
  
  // 6. ทดสอบ Villa Detail API - 404
  await testAPI(
    'Villa Detail API - 404 Test', 
    `${BASE_URL}/api/villas/non-existent-villa`,
    404
  );
  
  // 7. ทดสอบ Health Check
  await testAPI(
    'Health Check API', 
    `${BASE_URL}/api/health`
  );
  
  // สรุปผลการทดสอบ
  console.log('📊 สรุปผลการทดสอบ:');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  testResults.forEach(result => {
    const status = result.passed ? '✅ ผ่าน' : '❌ ไม่ผ่าน';
    const details = result.status ? `(${result.status})` : result.error ? `(${result.error})` : '';
    console.log(`${status} ${result.test} ${details}`);
    
    if (result.passed) passed++;
    else failed++;
  });
  
  console.log('='.repeat(50));
  console.log(`📈 สรุป: ${passed} ผ่าน, ${failed} ไม่ผ่าน จากทั้งหมด ${testResults.length} การทดสอบ`);
  
  if (failed === 0) {
    console.log('🎉 ระบบ Villa ทำงานได้อย่างสมบูรณ์!');
  } else {
    console.log('⚠️ พบปัญหาบางส่วน กรุณาตรวจสอบ');
  }
}

// เริ่มการทดสอบ
runAllTests().catch(console.error);
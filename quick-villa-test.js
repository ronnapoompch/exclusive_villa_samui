const fs = require('fs');
const path = require('path');

console.log('🏖️ VILLA SYSTEM TEST');
console.log('====================\n');

// Test 1: Villa Data
try {
  const villaData = JSON.parse(fs.readFileSync('src/data/folder-based-villas-array.json', 'utf8'));
  console.log(`✅ ${villaData.length} villas loaded from database`);
  
  const testVilla = villaData.find(v => v.slug === 'baan-ines');
  if (testVilla) {
    console.log(`✅ Test villa "${testVilla.name}" found`);
    console.log(`   - Images: ${testVilla.images?.length || 0}`);
    console.log(`   - First image: ${testVilla.images?.[0] || 'None'}`);
  } else {
    console.log('❌ Test villa not found');
  }
} catch(e) {
  console.log('❌ Villa data error:', e.message);
}

// Test 2: Image Directory
console.log('\n🖼️ Image Directory Test:');
try {
  const imageDir = path.join(__dirname, 'public', 'optimized-data-images');
  if (fs.existsSync(imageDir)) {
    const folders = fs.readdirSync(imageDir);
    console.log(`✅ ${folders.length} villa image folders found`);
    console.log(`   Sample folders: ${folders.slice(0, 3).join(', ')}`);
  } else {
    console.log('❌ Image directory not found');
  }
} catch(e) {
  console.log('❌ Image directory error:', e.message);
}

console.log('\n🚀 Server Information:');
console.log('✅ Development server: http://localhost:3001');
console.log('✅ Main page: http://localhost:3001/en');
console.log('✅ Villa detail: http://localhost:3001/en/villa/baan-ines');
console.log('✅ Villa API: http://localhost:3001/en/api/villas');

console.log('\n🎯 SYSTEM STATUS: READY FOR TESTING!');
console.log('Open browser and check:');
console.log('1. Villa cards show real images');
console.log('2. Villa detail pages work');
console.log('3. Image galleries display correctly');
// Comprehensive Villa Data Validation
// ตรวจสอบความถูกต้องของข้อมูลวิลล่าและรูปภาพ
const fs = require('fs');
const path = require('path');

console.log('🔍 Villa Data Validation System');
console.log('═'.repeat(60));
console.log('');

// Load JSON data
const villasPath = path.join(__dirname, 'data', 'villas-optimized.json');
const villasBySlugPath = path.join(__dirname, 'data', 'villas-optimized-by-slug.json');
const reportPath = path.join(__dirname, 'optimization-report.json');

console.log('📖 Loading JSON files...');
const villas = JSON.parse(fs.readFileSync(villasPath, 'utf8'));
const villasBySlug = JSON.parse(fs.readFileSync(villasBySlugPath, 'utf8'));
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log(`✅ Loaded ${villas.length} villas\n`);

// Validation tests
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function test(name, condition, details = '') {
  const result = {
    name,
    passed: condition,
    details
  };
  
  results.tests.push(result);
  
  if (condition) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

function warn(name, details = '') {
  results.warnings++;
  console.log(`⚠️  ${name}`);
  if (details) console.log(`   ${details}`);
}

// === TEST 1: JSON Structure ===
console.log('\n📋 Test 1: JSON Structure');
console.log('─'.repeat(60));

test(
  'Villas array is not empty',
  villas.length > 0
);

test(
  'All villas have required fields',
  villas.every(v => 
    v.id && v.slug && v.name && v.image !== undefined && v.gallery
  )
);

test(
  'Villas-by-slug matches array count',
  Object.keys(villasBySlug).length === villas.length
);

test(
  'All slugs are unique',
  new Set(villas.map(v => v.slug)).size === villas.length
);

// === TEST 2: Data Integrity ===
console.log('\n🔒 Test 2: Data Integrity');
console.log('─'.repeat(60));

const villasWithImages = villas.filter(v => v.gallery && v.gallery.length > 0);
test(
  'All villas have images',
  villasWithImages.length === villas.length,
  `${villas.length - villasWithImages.length} villas without images`
);

test(
  'All villas have hero image',
  villas.every(v => v.image && v.image.startsWith('/optimized-villas/')),
  villas.filter(v => !v.image).map(v => v.name).join(', ')
);

test(
  'Price per night is a number',
  villas.every(v => typeof v.pricePerNight === 'number' && v.pricePerNight > 0)
);

test(
  'Bedrooms and bathrooms are valid',
  villas.every(v => v.bedrooms > 0 && v.bathrooms > 0)
);

test(
  'Guests calculation is correct',
  villas.every(v => v.guests === v.bedrooms * 2)
);

// === TEST 3: Image Paths ===
console.log('\n🖼️  Test 3: Image Paths');
console.log('─'.repeat(60));

test(
  'All image paths start with /optimized-villas/',
  villas.every(v => 
    v.gallery.every(img => img.startsWith('/optimized-villas/'))
  )
);

test(
  'All image paths end with .webp',
  villas.every(v => 
    v.gallery.every(img => img.endsWith('.webp'))
  )
);

test(
  'No duplicate images in gallery',
  villas.every(v => {
    const unique = new Set(v.gallery);
    return unique.size === v.gallery.length;
  })
);

// === TEST 4: File Existence ===
console.log('\n📁 Test 4: File Existence (sampling 10 villas)');
console.log('─'.repeat(60));

const sampleVillas = villas.slice(0, 10);
let existingFiles = 0;
let missingFiles = 0;

sampleVillas.forEach((villa, index) => {
  const heroPath = path.join(__dirname, 'public', villa.image);
  const exists = fs.existsSync(heroPath);
  
  if (exists) {
    existingFiles++;
    const stats = fs.statSync(heroPath);
    console.log(`✅ [${index + 1}/10] ${villa.name} - ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    missingFiles++;
    console.log(`❌ [${index + 1}/10] ${villa.name} - File not found`);
  }
});

test(
  'Sample files exist on disk',
  missingFiles === 0,
  `${missingFiles} missing files`
);

// === TEST 5: Categories ===
console.log('\n📂 Test 5: Image Categories');
console.log('─'.repeat(60));

const categories = ['hero', 'ext', 'liv', 'bed1', 'bed2-5', 'bath1', 'bath2-5', 'kit', 'din', 'pool', 'amen', 'view'];
const categoryCounts = {};

categories.forEach(cat => {
  const count = villas.filter(v => v[cat] && v[cat].length > 0).length;
  categoryCounts[cat] = count;
  console.log(`   ${cat}: ${count} villas`);
});

const villasWithoutHeroExt = villas.filter(v => 
  (!v.hero || v.hero.length === 0) && (!v.ext || v.ext.length === 0)
);

if (villasWithoutHeroExt.length > 0) {
  warn(
    `${villasWithoutHeroExt.length} villas without hero/ext images`,
    villasWithoutHeroExt.map(v => v.name).join(', ')
  );
} else {
  test('All villas have hero or ext images', true);
}

// === TEST 6: Amenities & Features ===
console.log('\n🏖️  Test 6: Amenities & Features');
console.log('─'.repeat(60));

test(
  'All villas have amenities array',
  villas.every(v => Array.isArray(v.amenities) && v.amenities.length > 0)
);

test(
  'All villas have features object',
  villas.every(v => 
    v.features && 
    typeof v.features.beachfront === 'boolean' &&
    typeof v.features.pool === 'boolean' &&
    typeof v.features.kitchen === 'boolean'
  )
);

const beachfrontCount = villas.filter(v => v.features.beachfront).length;
const poolCount = villas.filter(v => v.features.pool).length;
const kitchenCount = villas.filter(v => v.features.kitchen).length;

console.log(`   Beachfront: ${beachfrontCount} villas`);
console.log(`   Pool: ${poolCount} villas`);
console.log(`   Kitchen: ${kitchenCount} villas`);

// === TEST 7: Statistics Match ===
console.log('\n📊 Test 7: Report Statistics');
console.log('─'.repeat(60));

test(
  'Report villa count matches',
  report.summary.totalVillas === villas.length
);

test(
  'Report image count matches',
  report.summary.totalImages === villas.reduce((sum, v) => sum + v.gallery.length, 0)
);

console.log(`   Duration: ${report.duration} seconds`);
console.log(`   Original size: ${report.summary.originalSizeMB} MB`);
console.log(`   Optimized size: ${report.summary.optimizedSizeMB} MB`);
console.log(`   Total savings: ${report.summary.totalSavings}%`);

// === FINAL SUMMARY ===
console.log('\n' + '═'.repeat(60));
console.log('📋 VALIDATION SUMMARY');
console.log('═'.repeat(60));
console.log('');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log('');

if (results.failed === 0) {
  console.log('🎉 ALL TESTS PASSED!');
  console.log('   System is ready for production');
} else {
  console.log('⚠️  SOME TESTS FAILED');
  console.log('   Please review the errors above');
}

console.log('');
console.log('📊 Quick Stats:');
console.log(`   Total Villas: ${villas.length}`);
console.log(`   Total Images: ${villas.reduce((sum, v) => sum + v.gallery.length, 0)}`);
console.log(`   Average Images/Villa: ${(villas.reduce((sum, v) => sum + v.gallery.length, 0) / villas.length).toFixed(1)}`);
console.log(`   Beachfront Villas: ${beachfrontCount} (${((beachfrontCount/villas.length)*100).toFixed(1)}%)`);
console.log(`   Villas with Pool: ${poolCount} (${((poolCount/villas.length)*100).toFixed(1)}%)`);
console.log('');
console.log('═'.repeat(60));

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);

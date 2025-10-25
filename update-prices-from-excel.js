const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read Excel file
const excelPath = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');
const jsonPath = path.join(__dirname, 'data', 'villas-optimized.json');
const backupPath = path.join(__dirname, 'data', 'backups', `villas-optimized-backup-${Date.now()}.json`);

console.log('📊 Reading Excel file:', excelPath);
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const excelData = XLSX.utils.sheet_to_json(worksheet);

console.log(`✅ Found ${excelData.length} rows in Excel`);
console.log('\n📋 Sample Excel data (first 3 rows):');
excelData.slice(0, 3).forEach((row, i) => {
  console.log(`Row ${i + 1}:`, JSON.stringify(row, null, 2));
});

// Read current JSON
console.log('\n📖 Reading current JSON:', jsonPath);
const villasData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`✅ Found ${villasData.length} villas in JSON`);

// Create backup
console.log('\n💾 Creating backup...');
fs.writeFileSync(backupPath, JSON.stringify(villasData, null, 2));
console.log('✅ Backup created:', backupPath);

// Show Excel column names to help with mapping
console.log('\n📝 Excel columns available:');
if (excelData.length > 0) {
  Object.keys(excelData[0]).forEach(key => {
    console.log(`  - ${key}`);
  });
}

// Try to match and show sample mappings
console.log('\n🔍 Attempting to match first 5 villas:');
let matched = 0;
let notMatched = 0;

villasData.slice(0, 5).forEach(villa => {
  // Try different matching strategies
  const possibleMatches = excelData.filter(row => {
    const villaNameLower = villa.name.toLowerCase().trim();
    const rowValues = Object.values(row).map(v => String(v).toLowerCase().trim());
    return rowValues.some(val => val.includes(villaNameLower) || villaNameLower.includes(val));
  });

  if (possibleMatches.length > 0) {
    console.log(`\n✅ Villa: ${villa.name}`);
    console.log(`   Current price: ${villa.pricePerNight}`);
    console.log(`   Possible Excel match:`, possibleMatches[0]);
    matched++;
  } else {
    console.log(`\n❌ Villa: ${villa.name} - No match found`);
    notMatched++;
  }
});

console.log(`\n📊 Summary: ${matched} matched, ${notMatched} not matched out of 5 samples`);
console.log('\n💡 Please review the Excel columns and villa names to determine the correct mapping.');
console.log('💡 Once confirmed, we can create a script to update all prices automatically.');
